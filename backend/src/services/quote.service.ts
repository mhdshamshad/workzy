import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import {
  BOOKING,
  BOOKING_DAY_STATUS,
  BOOKING_TYPE,
  CATEGORY,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  PRICING_MODE,
  QUOTE,
  QUOTE_STATUS,
  SERVICE_TYPE,
  STRIPE_ACCOUNT_STATUS,
  WORKER,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { IQuoteRepository } from "@/core/interfaces/repositories/IQuoteRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IQuoteService } from "@/core/interfaces/services/IQuoteService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { ISlotService } from "@/core/interfaces/services/ISlotService";
import { TYPES } from "@/di/types";
import { CreateQuoteDto, UpdateQuoteDto } from "@/dtos/requests/quote.dto";
import { QuoteListItemDto, WorkerQuoteStatsDto } from "@/dtos/responses/quote.dto";
import { IDailyLog } from "@/types/booking/booking.entity";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { IQuote } from "@/types/quote/quote.entity";
import { QuoteListQuery } from "@/types/quote/quote.query";
import CustomError from "@/utils/customError";
import { generateTxnCode } from "@/utils/generateTxnCode";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class QuoteService implements IQuoteService {
  constructor(
    @inject(TYPES.SlotService) private _slotService: ISlotService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.CategoryRepository) private _categoryRepository: ICategoryRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.QuoteRepository) private _quoteRepository: IQuoteRepository,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService
  ) {}

  async createQuote(workerId: string, data: CreateQuoteDto): Promise<IQuote> {
    const { bookingId, dates: selectedDates, totalPrice, message } = data;
    const booking = await this._bookingRepository.findOne({
      _id: new Types.ObjectId(bookingId),
      workerId: new Types.ObjectId(workerId),
    });
    if (!booking) {
      throw new CustomError(BOOKING.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    if (booking.quoteId) {
      throw new CustomError(QUOTE.ALREADY_EXISTS, HTTPSTATUS.BAD_REQUEST);
    }
    const { serviceId, userId, address } = booking;
    const [lng, lat] = address.location.coordinates;

    const { slotIds, reservedUntil, dates } = await this._slotService.reserveQuoteSlots(workerId, {
      serviceId: serviceId.toString(),
      bookingId: bookingId,
      dates: selectedDates.map((d) => new Date(d)),
      lat,
      lng,
    });
    const { user, worker } = booking.snapshot;
    const quote = await this._quoteRepository.create({
      workerId: new Types.ObjectId(workerId),
      userId: new Types.ObjectId(userId.toString()),
      categoryId: new Types.ObjectId(booking.categoryId),
      serviceId,
      bookingId: new Types.ObjectId(bookingId),
      slotIds: slotIds.map((id) => new Types.ObjectId(id)),
      dates,
      totalPrice,
      message,
      status: QUOTE_STATUS.PENDING,
      searchText: `${booking.bookingId}-${user.name}-${worker.name}`,
      expiresAt: reservedUntil,
    });
    await this._bookingRepository.findByIdAndUpdate(bookingId, {
      quoteId: new Types.ObjectId(quote._id),
    });
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.QUOTE_SENT(booking.bookingId, totalPrice)
    );
    return quote;
  }

  async acceptQuote(userId: string, quoteId: string): Promise<{ url: string }> {
    const quote = await this._quoteRepository.findOne({
      _id: new Types.ObjectId(quoteId),
      userId: new Types.ObjectId(userId),
      status: QUOTE_STATUS.PENDING,
    });

    if (!quote) {
      throw new CustomError(QUOTE.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (new Date() > quote.expiresAt) {
      throw new CustomError(QUOTE.EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }
    const [booking, category, worker] = await Promise.all([
      getEntityOrThrow(this._bookingRepository, quote.bookingId.toString(), BOOKING.NOT_FOUND),
      getEntityOrThrow(this._categoryRepository, quote.categoryId.toString(), CATEGORY.NOT_FOUND),
      getEntityOrThrow(this._workerRepository, quote.workerId.toString(), WORKER.NOT_FOUND),
    ]);

    if (!worker?.stripeAccountId || worker.stripeAccountStatus !== STRIPE_ACCOUNT_STATUS.ACTIVE) {
      throw new CustomError(WORKER.STRIPE_NOT_ACTIVE, HTTPSTATUS.BAD_REQUEST);
    }

    const platformFeePercent = category.platformFee ?? 0;
    const platformFee = Math.floor((quote.totalPrice * platformFeePercent) / 100);
    const workerAmount = quote.totalPrice - platformFee;

    const { category: snapshotCategory } = booking.snapshot;
    const dailyLogs: IDailyLog[] = quote.dates.map((val, index) => {
      return {
        dayIndex: index + 1,
        date: val.date,
        status: BOOKING_DAY_STATUS.PENDING,
      };
    });
    const newBooking = await this._bookingRepository.create({
      bookingId: generateTxnCode("BKG"),
      bookingType: BOOKING_TYPE.PROJECT,
      userId: new Types.ObjectId(userId),
      workerId: new Types.ObjectId(quote.workerId),
      serviceId: new Types.ObjectId(quote.serviceId),
      categoryId: new Types.ObjectId(quote.categoryId),
      quoteId: new Types.ObjectId(quote._id),
      dates: quote.dates,
      duration: 0,
      address: booking.address,
      rate: quote.totalPrice,
      itemCount: 1,
      subtotal: quote.totalPrice,
      discountPercent: 0,
      discountAmount: 0,
      chargeableAmount: quote.totalPrice,
      travelCost: 0,
      platformFeePercent,
      platformFee,
      total: quote.totalPrice,
      dailyLogs,
      snapshot: {
        ...booking.snapshot,
        category: {
          name: snapshotCategory.name,
          pricingMode: PRICING_MODE.FIXED,
          serviceType: SERVICE_TYPE.MAJOR_PROJECT,
        },
      },
    });

    const url = await this._paymentService.createBookingPaymentCheckout({
      bookingId: newBooking._id.toString(),
      workerAmount,
      workerId: quote.workerId.toString(),
      serviceName: category.name,
      slotId: quote.slotIds[0].toString(),
      amount: quote.totalPrice,
      userId,
      platformFee,
      workerStripeId: worker.stripeAccountId,
      userName: newBooking.snapshot.user.name,
      workerName: newBooking.snapshot.worker.name,
    });
    return {
      url,
    };
  }

  async rejectQuote(userId: string, quoteId: string): Promise<void> {
    const quote = await this._quoteRepository.findOneAndUpdate(
      {
        _id: new Types.ObjectId(quoteId),
        userId: new Types.ObjectId(userId),
        status: QUOTE_STATUS.PENDING,
      },
      {
        status: QUOTE_STATUS.REJECTED,
      }
    );
    if (!quote) {
      throw new CustomError(QUOTE.UPDATE_ERROR, HTTPSTATUS.BAD_REQUEST);
    }
    const [_slots, booking] = await Promise.all([
      this._slotService.releaseQuoteSlots(quote.slotIds.map((v) => v.toString())),
      this._bookingRepository.findById(quote.bookingId),
    ]);

    if (booking) {
      void this._notificationService.createNotification(
        quote.workerId.toString(),
        NOTIFICATION_TEMPLATES.QUOTE_REJECTED(booking.bookingId)
      );
    }
  }

  async updateQuote(workerId: string, quoteId: string, data: UpdateQuoteDto): Promise<IQuote> {
    const quote = await this._quoteRepository.findOne({
      _id: new Types.ObjectId(quoteId),
      workerId: new Types.ObjectId(workerId),
      status: QUOTE_STATUS.PENDING,
    });

    if (!quote) {
      throw new CustomError(QUOTE.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (new Date() > quote.expiresAt) {
      throw new CustomError(QUOTE.EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }
    const updateData: Partial<IQuote> = {};

    if (data.dates && data.dates.length > 0) {
      const booking = await this._bookingRepository.findById(quote.bookingId);
      if (!booking) {
        throw new CustomError(BOOKING.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
      }

      const { serviceId, address } = booking;
      const [lng, lat] = address.location.coordinates;

      await this._slotService.releaseQuoteSlots(quote.slotIds.map((v) => v.toString()));
      const { slotIds, reservedUntil, dates } = await this._slotService.reserveQuoteSlots(
        workerId,
        {
          serviceId: serviceId.toString(),
          bookingId: quote.bookingId.toString(),
          dates: data.dates,
          lat,
          lng,
        }
      );

      updateData.slotIds = slotIds.map((id) => new Types.ObjectId(id));
      updateData.dates = dates;
      updateData.expiresAt = reservedUntil;
    }

    if (data.totalPrice) {
      updateData.totalPrice = data.totalPrice;
    }

    if (data.message) {
      updateData.message = data.message;
    }

    const updatedQuote = await this._quoteRepository.findByIdAndUpdate(quoteId, updateData);

    if (!updatedQuote) {
      throw new CustomError(QUOTE.UPDATE_ERROR, HTTPSTATUS.BAD_REQUEST);
    }

    return updatedQuote;
  }

  async expireQuotes(): Promise<number> {
    return await this._quoteRepository.expireQuotes();
  }

  async listQuotes(query: QuoteListQuery): Promise<CursorPaginatedResult<QuoteListItemDto>> {
    const { data, nextCursor } = await this._quoteRepository.listQuotes(query);
    return {
      data: await QuoteListItemDto.fromEntities(data, this._s3Service),
      nextCursor,
    };
  }

  async getWorkerQuoteStats(workerId: string): Promise<WorkerQuoteStatsDto> {
    return await this._quoteRepository.getWorkerQuoteStats(workerId);
  }
}
