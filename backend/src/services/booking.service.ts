import dayjs from "dayjs";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import { BOOKING, HTTPSTATUS, PRICING_MODE, SERVICE_TYPE, SLOT, USER } from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IChatRepository } from "@/core/interfaces/repositories/IChatRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IBookingExtraChargeService } from "@/core/interfaces/services/IBookingExtraChargeService";
import { IBookingLifecycleService } from "@/core/interfaces/services/IBookingLifecycleService";
import { IBookingPricingService } from "@/core/interfaces/services/IBookingPricingService";
import { IBookingRescheduleService } from "@/core/interfaces/services/IBookingRescheduleService";
import { IBookingService } from "@/core/interfaces/services/IBookingService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { TYPES } from "@/di/types";
import {
  CancelRescheduleDto,
  CompleteBookingDTO,
  CreatebookingDTO,
  ExtraChargeDTO,
  RequestRescheduleDto,
  RespondRescheduleDto,
} from "@/dtos/requests/booking.dto";
import { BookingListItemDTO, BookingResponseDTO } from "@/dtos/responses/booking.dto";
import { BookingListQuery } from "@/types/booking/booking.query";
import { CursorPaginatedResult } from "@/types/common/pagination";
import CustomError from "@/utils/customError";
import { generateTxnCode } from "@/utils/generateTxnCode";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.SlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.BookingPricingService) private _pricingService: IBookingPricingService,
    @inject(TYPES.BookingRescheduleService) private _rescheduleService: IBookingRescheduleService,
    @inject(TYPES.BookingExtraChargeService)
    private _extraChargeService: IBookingExtraChargeService,
    @inject(TYPES.BookingLifecycleService) private _lifecycleService: IBookingLifecycleService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.ChatRepository) private _chatRepository: IChatRepository
  ) {}

  async getBookings(input: BookingListQuery): Promise<CursorPaginatedResult<BookingListItemDTO>> {
    const { data, nextCursor } = await this._bookingRepository.getBookings(input);
    return {
      data: await BookingListItemDTO.fromEntities(data, this._s3Service),
      nextCursor,
    };
  }

  async getBookingDetails(bookingId: string): Promise<BookingResponseDTO> {
    const booking = await this._bookingRepository.getBookingDetailById(bookingId);
    if (!booking) {
      throw new CustomError(BOOKING.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    const chat = await this._chatRepository.findByParticipants(
      booking?.userId._id.toString(),
      booking?.workerId._id.toString()
    );
    if (chat) {
      booking.chatId = chat._id.toString();
    }
    return await BookingResponseDTO.fromEntity(booking, this._s3Service);
  }

  async createBooking(userId: string, data: CreatebookingDTO): Promise<{ url: string }> {
    const { workerId, serviceId, slotId, address, itemCount = 1, userNote } = data;

    const [slot, user] = await Promise.all([
      this._slotRepository.findById(slotId),
      this._userRepository.findById(userId),
    ]);
    if (!slot) {
      throw new CustomError(SLOT.NOT_AVAILABLE, HTTPSTATUS.BAD_REQUEST);
    }
    if (!user) {
      throw new CustomError(USER.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    const { date, startTime, endTime, reservedBy, duration } = slot;

    if (reservedBy?.toString() !== userId) {
      throw new CustomError(SLOT.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const { category, worker, workerStripeId, service, platformFeePercent, rate, travelCost } =
      await this._pricingService.getBookingContext(
        workerId,
        serviceId,
        address.location.coordinates[1],
        address.location.coordinates[0]
      );
    const subtotal = rate * itemCount;

    const finalEndTime = dayjs(`2000-01-01 ${endTime}`)
      .subtract(service.bufferTime, "minute")
      .format("HH:mm");

    const discountPercent =
      this._pricingService.getBestDiscount(service?.bulkDiscounts ?? null, itemCount)?.percent ?? 0;
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const chargeableAmount = subtotal - discountAmount;
    const platformFee = Math.floor((chargeableAmount * platformFeePercent) / 100);

    const booking = await this._bookingRepository.create({
      bookingId: generateTxnCode("BKG"),
      userId: new Types.ObjectId(userId),
      workerId: new Types.ObjectId(workerId),
      serviceId: new Types.ObjectId(serviceId),
      categoryId: new Types.ObjectId(category._id),
      dates: [{ date, startTime, endTime: finalEndTime }],
      duration: duration - service.bufferTime,

      rate,
      itemCount,
      subtotal: rate * itemCount,
      discountPercent,
      discountAmount,
      chargeableAmount,
      travelCost,
      platformFeePercent,
      platformFee,
      total: chargeableAmount + travelCost,
      address: address,
      userNote,
      snapshot: {
        user: {
          name: user.name,
          phone: user.phone,
        },
        worker,
        category: {
          name: category.name,
          pricingMode: category.pricingMode ?? PRICING_MODE.PER_UNIT,
          serviceType: category.serviceType ?? SERVICE_TYPE.SMALL_TASK,
        },
      },
    });

    const url = await this._paymentService.createBookingPaymentCheckout({
      bookingId: booking._id.toString(),
      workerAmount: booking.total - booking.platformFee,
      workerId: booking.workerId.toString(),
      serviceName: category.name,
      slotId,
      amount: booking.total,
      userId,
      platformFee,
      workerStripeId,
      userName: user.name,
      workerName: booking.snapshot.worker.name,
    });
    return { url };
  }

  async cancelBooking(bookingId: string, userId: string, reason: string): Promise<void> {
    return this._lifecycleService.cancelBooking(bookingId, userId, reason);
  }

  async acceptBooking(bookingId: string, workerId: string): Promise<void> {
    return this._lifecycleService.acceptBooking(bookingId, workerId);
  }

  async rejectBooking(data: {
    bookingId: string;
    workerId: string;
    reason: string;
  }): Promise<void> {
    return this._lifecycleService.rejectBooking(data);
  }

  async markEnRoute(bookingId: string, workerId: string): Promise<void> {
    return this._lifecycleService.markEnRoute(bookingId, workerId);
  }

  async markReached(bookingId: string, workerId: string): Promise<void> {
    return this._lifecycleService.markReached(bookingId, workerId);
  }

  async startJob(bookingId: string, workerId: string, otp: string): Promise<void> {
    return this._lifecycleService.startJob(bookingId, workerId, otp);
  }

  async completeJob(bookingId: string, workerId: string, data: CompleteBookingDTO): Promise<void> {
    return this._lifecycleService.completeJob(bookingId, workerId, data);
  }

  async approveBooking(bookingId: string, userId: string): Promise<void> {
    return this._lifecycleService.approveBooking(bookingId, userId);
  }

  async payExtraCharge(bookingId: string, userId: string): Promise<{ url: string }> {
    return this._extraChargeService.payExtraCharge(bookingId, userId);
  }

  async rejectExtraCharge(bookingId: string, userId: string): Promise<void> {
    return this._extraChargeService.rejectExtraCharge(bookingId, userId);
  }

  async requestExtraCharge(
    bookingId: string,
    workerId: string,
    data: ExtraChargeDTO
  ): Promise<void> {
    return this._extraChargeService.requestExtraCharge(bookingId, workerId, data);
  }

  async expireBooking(): Promise<void> {
    return this._lifecycleService.expireBooking();
  }

  async requestReschedule(
    bookingId: string,
    initiatorId: string,
    data: RequestRescheduleDto
  ): Promise<void> {
    return this._rescheduleService.requestReschedule(bookingId, initiatorId, data);
  }

  async respondReschedule(
    bookingId: string,
    responderId: string,
    data: RespondRescheduleDto
  ): Promise<string> {
    return this._rescheduleService.respondReschedule(bookingId, responderId, data);
  }

  async cancelReschedule(
    bookingId: string,
    initiatorId: string,
    data: CancelRescheduleDto
  ): Promise<void> {
    return this._rescheduleService.cancelReschedule(bookingId, initiatorId, data);
  }
}
