import dayjs from "dayjs";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import logger from "@/config/logger";
import {
  AUTH,
  BOOKING,
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
  BOOKING_STATUS_MESSAGES,
  BookingStatus,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  PRICING_MODE,
  Role,
  ROLE,
  SERVICE_TYPE,
  SLOT,
  SLOT_STATUS,
  USER,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IChatRepository } from "@/core/interfaces/repositories/IChatRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IBookingPricingService } from "@/core/interfaces/services/IBookingPricingService";
import { IBookingRescheduleService } from "@/core/interfaces/services/IBookingRescheduleService";
import { IBookingService } from "@/core/interfaces/services/IBookingService";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IMessageService } from "@/core/interfaces/services/IMessageService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
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
import { IBooking, IEvidence, IExtraCharge } from "@/types/booking/booking.entity";
import { BookingListQuery } from "@/types/booking/booking.query";
import { CursorPaginatedResult } from "@/types/common/pagination";
import CustomError from "@/utils/customError";
import { generateTxnCode } from "@/utils/generateTxnCode";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.SlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.BookingPricingService) private _pricingService: IBookingPricingService,
    @inject(TYPES.BookingRescheduleService) private _rescheduleService: IBookingRescheduleService,
    @inject(TYPES.OTPService) private _otpService: IOTPService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ChatRepository) private _chatRepository: IChatRepository,
    @inject(TYPES.MessageService) private _messageService: IMessageService,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork
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
    const booking = await this.getBookingOrThrow(bookingId);

    if (booking.userId.toString() !== userId) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }
    const cancellableStatuses = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED];
    if (!cancellableStatuses.includes(booking.status as (typeof cancellableStatuses)[number])) {
      throw new CustomError(BOOKING.CANNOT_CANCEL(booking.status), HTTPSTATUS.BAD_REQUEST);
    }
    if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD) {
      await this._paymentService.refundBookingPayment(bookingId);
    }
    const paymentStatus =
      booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD
        ? BOOKING_PAYMENT_STATUS.REFUNDED
        : booking.paymentStatus;

    await this._unitOfWork.execute(async (options) => {
      await this._bookingRepository.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            status: BOOKING_STATUS.CANCELLED,
            paymentStatus,
          },
          $push: {
            statusHistory: this.createStatusHistoryEntry(
              BOOKING_STATUS.CANCELLED,
              ROLE.USER,
              reason
            ),
          },
        },
        options
      );
      await this._slotRepository.deleteMany(
        {
          bookingId: new Types.ObjectId(bookingId),
          reservedBy: new Types.ObjectId(userId),
          status: SLOT_STATUS.BOOKED,
        },
        options
      );
    });

    void this.sendBookingEvent(
      booking,
      `Booking ${booking.bookingId} has been cancelled by the user`
    );
    void this._notificationService.createNotification(
      booking.workerId.toString(),
      NOTIFICATION_TEMPLATES.BOOKING_CANCELLED(booking.bookingId)
    );
  }

  async acceptBooking(bookingId: string, workerId: string): Promise<void> {
    const booking = await this._unitOfWork.execute(async (options) => {
      const updated = await this._bookingRepository.findOneAndUpdate(
        {
          _id: new Types.ObjectId(bookingId),
          workerId: new Types.ObjectId(workerId),
          status: BOOKING_STATUS.PENDING,
          paymentStatus: BOOKING_PAYMENT_STATUS.HELD,
        },
        {
          status: BOOKING_STATUS.CONFIRMED,
          $push: {
            statusHistory: this.createStatusHistoryEntry(
              BOOKING_STATUS.CONFIRMED,
              ROLE.WORKER,
              BOOKING_STATUS_MESSAGES.CONFIRMED
            ),
          },
        },
        options
      );
      if (!updated) {
        throw new CustomError(BOOKING.CANNOT_ACCEPT, HTTPSTATUS.BAD_REQUEST);
      }
      await this._workerRepository.findOneAndUpdate(
        { _id: workerId },
        { $inc: { "jobStats.accepted": 1 } },
        options
      );
      return updated;
    });

    void this.sendBookingEvent(
      booking,
      `Booking ${booking.bookingId} has been confirmed by the worker`
    );
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.BOOKING_ACCEPTED(booking.bookingId, booking.snapshot.worker.name)
    );
  }

  async rejectBooking(data: {
    bookingId: string;
    workerId: string;
    reason: string;
  }): Promise<void> {
    const { bookingId, workerId, reason } = data;
    const booking = await this.getBookingOrThrow(bookingId);
    this.assertWorkerOwnership(booking, workerId);
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new CustomError(BOOKING.CANNOT_REJECT(booking.status), HTTPSTATUS.BAD_REQUEST);
    }
    if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD) {
      await this._paymentService.refundBookingPayment(bookingId);
    }
    const paymentStatus =
      booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD
        ? BOOKING_PAYMENT_STATUS.REFUNDED
        : booking.paymentStatus;

    await this._unitOfWork.execute(async (options) => {
      await this._bookingRepository.findByIdAndUpdate(
        bookingId,
        {
          status: BOOKING_STATUS.REJECTED,
          paymentStatus,
          $push: {
            statusHistory: this.createStatusHistoryEntry(
              BOOKING_STATUS.REJECTED,
              ROLE.WORKER,
              reason
            ),
          },
        },
        options
      );
      await this._slotRepository.deleteMany(
        {
          bookingId: new Types.ObjectId(bookingId),
          reservedBy: new Types.ObjectId(booking.userId),
          status: SLOT_STATUS.BOOKED,
        },
        options
      );
    });

    void this.sendBookingEvent(
      booking,
      `Booking ${booking.bookingId} has been rejected by the worker${reason ? `: ${reason}` : ""}`
    );
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.BOOKING_REJECTED(
        booking.bookingId,
        booking.snapshot.worker.name,
        reason
      )
    );
  }

  async markEnRoute(bookingId: string, workerId: string): Promise<void> {
    const booking = await this._bookingRepository.findOneAndUpdate(
      {
        _id: new Types.ObjectId(bookingId),
        workerId: new Types.ObjectId(workerId),
        status: BOOKING_STATUS.CONFIRMED,
      },
      {
        status: BOOKING_STATUS.EN_ROUTE,
        $push: {
          statusHistory: this.createStatusHistoryEntry(
            BOOKING_STATUS.EN_ROUTE,
            ROLE.WORKER,
            BOOKING_STATUS_MESSAGES.EN_ROUTE
          ),
        },
      }
    );
    if (!booking) {
      throw new CustomError(BOOKING.CANNOT_EN_ROUTE, HTTPSTATUS.BAD_REQUEST);
    }
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.WORKER_EN_ROUTE(booking.snapshot.worker.name, booking.bookingId)
    );
  }

  async markReached(bookingId: string, workerId: string): Promise<void> {
    const otp = this._otpService.generateOTP();
    logger.info(`Generated OTP ${otp} for booking ${bookingId}`);
    const booking = await this._bookingRepository.findOneAndUpdate(
      {
        _id: new Types.ObjectId(bookingId),
        workerId: new Types.ObjectId(workerId),
        status: BOOKING_STATUS.EN_ROUTE,
      },
      {
        status: BOOKING_STATUS.REACHED,
        $push: {
          statusHistory: this.createStatusHistoryEntry(
            BOOKING_STATUS.REACHED,
            ROLE.WORKER,
            BOOKING_STATUS_MESSAGES.REACHED
          ),
        },
      }
    );
    if (!booking) {
      throw new CustomError(BOOKING.CANNOT_REACH, HTTPSTATUS.BAD_REQUEST);
    }
    const user = await this._userRepository.findById(booking.userId);
    if (!user) {
      throw new CustomError(USER.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    const redisKey = `booking-otp:${bookingId}`;
    await Promise.all([
      this._redisService.setWithTTL(redisKey, otp, 3600),
      this._emailService.sendEmail(user.email, otp),
    ]);
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.WORKER_REACHED(booking.snapshot.worker.name, booking.bookingId)
    );
  }
  async startJob(bookingId: string, workerId: string, otp: string): Promise<void> {
    const booking = await this.getBookingOrThrow(bookingId);
    this.assertWorkerOwnership(booking, workerId);
    if (booking.status !== BOOKING_STATUS.REACHED) {
      throw new CustomError(BOOKING.CANNOT_START(booking.status), HTTPSTATUS.BAD_REQUEST);
    }
    const redisKey = `booking-otp:${bookingId}`;
    const storedOtp = await this._redisService.get(redisKey);
    if (!storedOtp || storedOtp !== otp) {
      throw new CustomError(BOOKING.INVALID_OTP, HTTPSTATUS.BAD_REQUEST);
    }
    await this._bookingRepository.update(bookingId, {
      status: BOOKING_STATUS.IN_PROGRESS,
      $push: {
        statusHistory: this.createStatusHistoryEntry(
          BOOKING_STATUS.IN_PROGRESS,
          ROLE.WORKER,
          BOOKING_STATUS_MESSAGES.IN_PROGRESS
        ),
      },
    });
    void this._redisService.delete(redisKey);
    void this.sendBookingEvent(booking, `Work has started for booking ${booking.bookingId}`);
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.JOB_STARTED(booking.bookingId)
    );
  }

  async completeJob(bookingId: string, workerId: string, data: CompleteBookingDTO): Promise<void> {
    const { evidence, note } = data;
    const bookingEvidence: IEvidence = {
      after: evidence.after,
      before: evidence.before,
      uploadedAt: new Date(),
    };
    const booking = await this._unitOfWork.execute(async (options) => {
      const updated = await this._bookingRepository.findOneAndUpdate(
        {
          _id: new Types.ObjectId(bookingId),
          workerId: new Types.ObjectId(workerId),
          status: BOOKING_STATUS.IN_PROGRESS,
        },
        {
          status: BOOKING_STATUS.COMPLETED,
          evidence: bookingEvidence,
          workerNote: note,
          completedAt: new Date(),
          $push: {
            statusHistory: this.createStatusHistoryEntry(
              BOOKING_STATUS.COMPLETED,
              ROLE.WORKER,
              BOOKING_STATUS_MESSAGES.COMPLETED
            ),
          },
        },
        options
      );
      if (!updated) {
        throw new CustomError(BOOKING.CANNOT_COMPLETE, HTTPSTATUS.BAD_REQUEST);
      }
      await this._slotRepository.deleteMany(
        {
          bookingId: new Types.ObjectId(bookingId),
          status: SLOT_STATUS.BOOKED,
        },
        options
      );
      await this._workerRepository.findByIdAndUpdate(
        workerId,
        { $inc: { "jobStats.completed": 1 } },
        options
      );
      return updated;
    });

    void this.sendBookingEvent(booking, `Work has been completed for booking ${booking.bookingId}`);
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.JOB_COMPLETED(booking.bookingId, booking.snapshot.worker.name)
    );
  }

  async approveBooking(bookingId: string, userId: string): Promise<void> {
    const booking = await this.getBookingOrThrow(bookingId);
    if (booking.userId.toString() !== userId) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw new CustomError(BOOKING.CANNOT_APPROVE(booking.status), HTTPSTATUS.BAD_REQUEST);
    }
    if (booking.paymentStatus !== BOOKING_PAYMENT_STATUS.HELD) {
      throw new CustomError(BOOKING.PAYMENT_NOT_HELD, HTTPSTATUS.BAD_REQUEST);
    }
    if (booking.extraCharge?.status === "pending") {
      throw new CustomError(BOOKING.EXTRA_CHARGE_PENDING, HTTPSTATUS.BAD_REQUEST);
    }
    await this._paymentService.releaseBookingPayment(booking);
    await this._bookingRepository.update(bookingId, {
      status: BOOKING_STATUS.APPROVED,
      paymentStatus: BOOKING_PAYMENT_STATUS.RELEASED,
      completedAt: new Date(),
      $push: {
        statusHistory: this.createStatusHistoryEntry(
          BOOKING_STATUS.APPROVED,
          ROLE.USER,
          BOOKING_STATUS_MESSAGES.APPROVED
        ),
      },
    });

    void this.sendBookingEvent(
      booking,
      `Booking ${booking.bookingId} has been approved by the user`
    );
    void this._notificationService.createNotification(
      booking.workerId.toString(),
      NOTIFICATION_TEMPLATES.JOB_APPROVED(booking.bookingId, booking.snapshot.user.name)
    );
  }

  async payExtraCharge(bookingId: string, userId: string): Promise<{ url: string }> {
    const booking = await this.getBookingOrThrow(bookingId);
    if (booking.userId.toString() !== userId) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      throw new CustomError(BOOKING.EXTRA_CHARGE_INVALID_STATUS, HTTPSTATUS.BAD_REQUEST);
    }
    if (!booking.extraCharge || booking.extraCharge.status !== "pending") {
      throw new CustomError(BOOKING.EXTRA_CHARGE_NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    const url = await this._paymentService.createExtraChargeCheckout({
      userId,
      booking,
      amount: booking.extraCharge.amount,
    });
    return { url };
  }

  async rejectExtraCharge(bookingId: string, userId: string): Promise<void> {
    const booking = await this._bookingRepository.findOneAndUpdate(
      {
        _id: new Types.ObjectId(bookingId),
        userId: new Types.ObjectId(userId),
        "extraCharge.status": "pending",
      },
      {
        "extraCharge.status": "rejected",
        "extraCharge.respondedAt": new Date(),
      }
    );
    if (!booking) {
      throw new CustomError(BOOKING.EXTRA_CHARGE_NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    void this._notificationService.createNotification(
      booking.workerId.toString(),
      NOTIFICATION_TEMPLATES.EXTRA_CHARGE_REJECTED(
        booking.bookingId,
        booking.extraCharge?.amount ?? 0
      )
    );
  }

  async requestExtraCharge(
    bookingId: string,
    workerId: string,
    data: ExtraChargeDTO
  ): Promise<void> {
    const { amount, reason, evidenceUrl } = data;
    const extraCharge: IExtraCharge = {
      amount,
      reason,
      status: "pending",
      evidenceUrl,
      requestedAt: new Date(),
    };
    const [booking, updated] = await Promise.all([
      this._bookingRepository.findById(bookingId),
      this._bookingRepository.findOneAndUpdate(
        {
          _id: new Types.ObjectId(bookingId),
          workerId: new Types.ObjectId(workerId),
          status: { $in: [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETED] },
          $or: [
            { extraCharge: { $exists: false } },
            { extraCharge: null },
            { "extraCharge.status": { $in: ["pending", "rejected"] } },
          ],
        },
        { extraCharge }
      ),
    ]);
    const isEdit = !!booking?.extraCharge;
    if (!updated) {
      throw new CustomError(BOOKING.EXTRA_CHARGE_INVALID_STATUS, HTTPSTATUS.BAD_REQUEST);
    }
    void this._notificationService.createNotification(
      updated.userId.toString(),
      isEdit
        ? NOTIFICATION_TEMPLATES.EXTRA_CHARGE_UPDATED(amount, updated.bookingId)
        : NOTIFICATION_TEMPLATES.EXTRA_CHARGE_REQUESTED(amount, updated.bookingId)
    );
  }

  async expireBooking(): Promise<void> {
    const bookings = await this._bookingRepository.getExpiredBookings();
    if (!bookings.length) {
      return;
    }
    const results = await Promise.allSettled(
      bookings.map((booking) => this.processBookingExpiry(booking))
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    logger.info(`Booking expiry job done — ${succeeded} expired successfully, ${failed} failed.`);
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

  private async processBookingExpiry(booking: IBooking): Promise<void> {
    try {
      if (booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD) {
        await this._paymentService.refundBookingPayment(booking._id.toString());
      }
      await this._unitOfWork.execute(async (options) => {
        await this._bookingRepository.update(
          booking._id.toString(),
          {
            status: BOOKING_STATUS.EXPIRED,
            paymentStatus:
              booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD
                ? BOOKING_PAYMENT_STATUS.REFUNDED
                : booking.paymentStatus,
            $push: {
              statusHistory: this.createStatusHistoryEntry(
                BOOKING_STATUS.EXPIRED,
                ROLE.SYSTEM,
                BOOKING_STATUS_MESSAGES.EXPIRED
              ),
            },
          },
          options
        );
        await this._slotRepository.findOneAndDelete(
          {
            bookingId: new Types.ObjectId(booking._id.toString()),
            reservedBy: new Types.ObjectId(booking.userId),
            status: SLOT_STATUS.BOOKED,
          },
          options
        );
        await this._workerRepository.findOneAndUpdate(
          { _id: booking.workerId },
          { $inc: { noResponses: 1 } },
          options
        );
      });
      void this._notificationService.createNotification(
        booking.userId.toString(),
        NOTIFICATION_TEMPLATES.BOOKING_EXPIRED(booking.bookingId)
      );
    } catch (error) {
      logger.error(`Failed to expire booking ${booking._id}:`, error);
      throw error;
    }
  }

  private assertWorkerOwnership(booking: IBooking, workerId: string): void {
    if (booking.workerId.toString() !== workerId) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }
  }

  private createStatusHistoryEntry(status: BookingStatus, changedBy: Role, reason?: string) {
    return {
      status,
      changedBy,
      reason,
      changedAt: new Date(),
    };
  }

  private async getBookingOrThrow(bookingId: string): Promise<IBooking> {
    return await getEntityOrThrow(this._bookingRepository, bookingId, BOOKING.NOT_FOUND);
  }

  private async sendBookingEvent(booking: IBooking, content: string): Promise<void> {
    try {
      await this._messageService.saveBookingEvent({
        userId: booking.userId.toString(),
        workerId: booking.workerId.toString(),
        bookingId: booking._id.toString(),
        content,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to send BookingEvent";
      logger.error(`Failed to save booking event message -${booking.bookingId} - ${msg}`);
    }
  }
}
