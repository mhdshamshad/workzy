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
  CATEGORY,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  PRICING_MODE,
  PricingMode,
  Role,
  ROLE,
  SERVICE,
  SERVICE_TYPE,
  SLOT,
  SLOT_STATUS,
  STRIPE_ACCOUNT_STATUS,
  USER,
  WORKER,
  WORKER_STATUS,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { IChatRepository } from "@/core/interfaces/repositories/IChatRepository";
import { IQuoteRepository } from "@/core/interfaces/repositories/IQuoteRepository";
import { IServiceRepository } from "@/core/interfaces/repositories/IServiceRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IBookingService } from "@/core/interfaces/services/IBookingService";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IMessageService } from "@/core/interfaces/services/IMessageService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
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
import {
  BookingContext,
  IBooking,
  IBookingSlot,
  IEvidence,
  IExtraCharge,
} from "@/types/booking/booking.entity";
import { BookingListQuery } from "@/types/booking/booking.query";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { BulkDiscountType } from "@/types/service/service.entity";
import CustomError from "@/utils/customError";
import { generateTxnCode } from "@/utils/generateTxnCode";
import { calculateDistanceKm } from "@/utils/geo";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";
import { formatTimeRange } from "@/utils/time.utils";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.ServiceRepository) private _serviceRepository: IServiceRepository,
    @inject(TYPES.SlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.QuoteRepository) private _quoteRepository: IQuoteRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.CategoryRepository) private _categoryRepository: ICategoryRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.OTPService) private _otpService: IOTPService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.ChatRepository) private _chatRepository: IChatRepository,
    @inject(TYPES.MessageService) private _messageService: IMessageService,
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
      await this.getBookingContext(
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
      this.getBestDiscount(service?.bulkDiscounts ?? null, itemCount)?.percent ?? 0;
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
    const booking = await this._bookingRepository.findOneAndUpdate(
      {
        _id: new Types.ObjectId(bookingId),
        workerId: new Types.ObjectId(workerId),
        status: BOOKING_STATUS.EN_ROUTE,
      },
      {
        status: BOOKING_STATUS.REACHED,
        otp,
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
    logger.info(`Generated OTP ${otp} for booking ${bookingId}`);
    await this._emailService.sendEmail(user.email, otp);
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
    if (!booking.otp || booking.otp !== otp) {
      throw new CustomError(BOOKING.INVALID_OTP, HTTPSTATUS.BAD_REQUEST);
    }
    await this._bookingRepository.update(bookingId, {
      status: BOOKING_STATUS.IN_PROGRESS,
      $unset: { otp: "" },
      $push: {
        statusHistory: this.createStatusHistoryEntry(
          BOOKING_STATUS.IN_PROGRESS,
          ROLE.WORKER,
          BOOKING_STATUS_MESSAGES.IN_PROGRESS
        ),
      },
    });
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
          reservedBy: new Types.ObjectId(updated.userId),
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
    const { newSlotId, oldSlotId, reason, requestedBy } = data;
    const booking = await this.getBookingOrThrow(bookingId);
    const { userId, workerId, serviceId, rescheduleRequest, status } = booking;

    if (
      (requestedBy === ROLE.USER && initiatorId !== userId.toString()) ||
      (requestedBy === ROLE.WORKER && initiatorId !== workerId.toString())
    ) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }

    const isPendingStage = BOOKING_STATUS.PENDING === status || BOOKING_STATUS.CONFIRMED === status;
    const workerAllowStages =
      BOOKING_STATUS.EN_ROUTE === status ||
      BOOKING_STATUS.REACHED === status ||
      BOOKING_STATUS.IN_PROGRESS === status;

    if (rescheduleRequest && rescheduleRequest.status === "pending") {
      throw new CustomError(BOOKING.RESCHEDULE_ALREADY_PENDING, HTTPSTATUS.BAD_REQUEST);
    }

    if (
      (requestedBy === ROLE.USER && !isPendingStage) ||
      (requestedBy === ROLE.WORKER && !isPendingStage && !workerAllowStages)
    ) {
      throw new CustomError(
        BOOKING.RESCHEDULE_NOT_ALLOWED(status, requestedBy),
        HTTPSTATUS.BAD_REQUEST
      );
    }
    const [oldSlot, newSlot] = await Promise.all([
      this._slotRepository.findById(oldSlotId),
      this._slotRepository.findOneAndUpdate(
        {
          _id: new Types.ObjectId(newSlotId),
          workerId: new Types.ObjectId(workerId),
          serviceId: new Types.ObjectId(serviceId),
          status: SLOT_STATUS.RESERVED,
        },
        {
          bookingId: new Types.ObjectId(bookingId),
          status: SLOT_STATUS.BOOKED,
        }
      ),
    ]);

    if (!oldSlot || oldSlot.bookingId?.toString() !== bookingId) {
      throw new CustomError(BOOKING.RESCHEDULE_OLD_SLOT_MISMATCH, HTTPSTATUS.BAD_REQUEST);
    }
    if (dayjs(oldSlot.date).isBefore(dayjs().startOf("day"))) {
      throw new CustomError(BOOKING.RESCHEDULE_SLOT_PASSED, HTTPSTATUS.BAD_REQUEST);
    }

    if (!newSlot) {
      throw new CustomError(SLOT.EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }
    const newDateStr = `${dayjs(newSlot.date).format("YYYY-MM-DD")} - ${newSlot.isFullDay ? "" : formatTimeRange(newSlot.startTime, newSlot.endTime)}`;
    const oldDateStr = `${dayjs(oldSlot.date).format("YYYY-MM-DD")} - ${oldSlot.isFullDay ? "" : formatTimeRange(oldSlot.startTime, oldSlot.endTime)}`;
    const responderId = requestedBy === ROLE.USER ? workerId : userId;

    const updated = await this._bookingRepository.update(bookingId, {
      rescheduleRequest: {
        requestedBy,
        oldSlotId: new Types.ObjectId(oldSlotId),
        newSlotId: new Types.ObjectId(newSlotId),
        newDate: newSlot.date,
        newStartTime: newSlot.startTime,
        newEndTime: newSlot.endTime,
        status: "pending",
        reason,
        requestedAt: new Date(),
      },
      $push: {
        statusHistory: this.createStatusHistoryEntry(
          booking.status,
          requestedBy,
          BOOKING_STATUS_MESSAGES.RESCHEDULED(requestedBy, oldDateStr, newDateStr, reason)
        ),
      },
    });

    if (!updated) {
      throw new CustomError(BOOKING.UPDATE_FAILED, HTTPSTATUS.BAD_REQUEST);
    }

    void this._notificationService.createNotification(
      responderId.toString(),
      NOTIFICATION_TEMPLATES.RESCHEDULE_REQUESTED(booking.bookingId, requestedBy, newDateStr)
    );
  }

  async respondReschedule(
    bookingId: string,
    responderId: string,
    data: RespondRescheduleDto
  ): Promise<string> {
    const { role, status } = data;
    const booking = await this.getBookingOrThrow(bookingId);
    const { userId, workerId, snapshot, rescheduleRequest, dates } = booking;

    if (
      (role === ROLE.USER && responderId !== userId.toString()) ||
      (role === ROLE.WORKER && responderId !== workerId.toString())
    ) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }

    if (!rescheduleRequest || rescheduleRequest.status !== "pending") {
      throw new CustomError(BOOKING.RESCHEDULE_NO_PENDING, HTTPSTATUS.BAD_REQUEST);
    }
    const { requestedBy, newSlotId, oldSlotId, newDate, newStartTime, newEndTime } =
      rescheduleRequest;
    if (requestedBy === role) {
      throw new CustomError(BOOKING.RESCHEDULE_OWN_REQUEST, HTTPSTATUS.BAD_REQUEST);
    }
    const initiatorId = requestedBy === ROLE.WORKER ? workerId : userId;
    const otherPartyName = requestedBy === ROLE.USER ? snapshot.worker.name : snapshot.user.name;

    if (status === "accepted") {
      const [oldSlot, newSlot] = await Promise.all([
        this._slotRepository.findById(oldSlotId),
        this._slotRepository.findById(newSlotId),
      ]);

      if (!newSlot) {
        throw new CustomError(BOOKING.RESCHEDULE_NEW_SLOT_NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
      }
      if (!oldSlot) {
        throw new CustomError(BOOKING.RESCHEDULE_OLD_SLOT_NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
      }

      const newDateStr = `${dayjs(newDate).format("YYYY-MM-DD")} - ${newSlot?.isFullDay ? "Full day" : formatTimeRange(newStartTime, newEndTime)}`;
      const isSingleSlot = dates.length === 1;
      const newStatus = isSingleSlot
        ? booking.paymentStatus === BOOKING_PAYMENT_STATUS.HELD &&
          booking.status !== BOOKING_STATUS.PENDING
          ? BOOKING_STATUS.CONFIRMED
          : BOOKING_STATUS.PENDING
        : booking.status;

      const newBookingSlot: IBookingSlot = {
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
      };

      const historyEntry = this.createStatusHistoryEntry(
        booking.status,
        role,
        BOOKING_STATUS_MESSAGES.RESCHEDULE_ACCEPTED(otherPartyName, newDateStr)
      );
      await this._unitOfWork.execute(async (options) => {
        const updated = await this._bookingRepository.acceptReschedule(
          bookingId,
          {
            oldSlotDate: oldSlot.date,
            newSlot: newBookingSlot,
            historyEntry,
            newStatus,
          },
          options
        );

        if (!updated) {
          throw new CustomError(BOOKING.UPDATE_FAILED, HTTPSTATUS.BAD_REQUEST);
        }
        await this._slotRepository.delete(oldSlotId.toString(), options);
        if (booking.quoteId) {
          await this._quoteRepository.syncRescheduleSlot(
            booking.quoteId.toString(),
            {
              oldSlotId: oldSlotId.toString(),
              oldSlotDate: oldSlot.date,
              newSlotId: newSlotId.toString(),
              newSlot: newBookingSlot,
            },
            options
          );
        }
      });

      void this._notificationService.createNotification(
        initiatorId.toString(),
        NOTIFICATION_TEMPLATES.RESCHEDULE_ACCEPTED(booking.bookingId, otherPartyName, newDateStr)
      );
    } else {
      await this._unitOfWork.execute(async (options) => {
        await this._slotRepository.delete(newSlotId.toString(), options);
        await this._bookingRepository.update(
          bookingId,
          {
            $push: {
              statusHistory: this.createStatusHistoryEntry(
                booking.status,
                role,
                BOOKING_STATUS_MESSAGES.RESCHEDULE_REJECTED(otherPartyName)
              ),
            },
            $unset: { rescheduleRequest: 1 },
          },
          options
        );
      });

      void this._notificationService.createNotification(
        initiatorId.toString(),
        NOTIFICATION_TEMPLATES.RESCHEDULE_REJECTED(booking.bookingId, otherPartyName)
      );
    }
    return BOOKING.RESCHEDULE_RESPONSE_SUCCESS;
  }

  async cancelReschedule(
    bookingId: string,
    initiatorId: string,
    data: CancelRescheduleDto
  ): Promise<void> {
    const { requestedBy } = data;
    const booking = await this.getBookingOrThrow(bookingId);
    const { userId, workerId, rescheduleRequest } = booking;

    if (
      (requestedBy === ROLE.USER && initiatorId !== userId.toString()) ||
      (requestedBy === ROLE.WORKER && initiatorId !== workerId.toString())
    ) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }

    if (!rescheduleRequest || rescheduleRequest.status !== "pending") {
      throw new CustomError(BOOKING.RESCHEDULE_CANCEL_NO_PENDING, HTTPSTATUS.BAD_REQUEST);
    }
    const responderId = requestedBy === ROLE.USER ? workerId : userId;

    await this._unitOfWork.execute(async (options) => {
      const updated = await this._bookingRepository.update(
        bookingId,
        {
          $push: {
            statusHistory: this.createStatusHistoryEntry(
              booking.status,
              requestedBy,
              "Reschedule request cancelled by requester"
            ),
          },
          $unset: { rescheduleRequest: 1 },
        },
        options
      );
      if (!updated) {
        throw new CustomError(BOOKING.RESCHEDULE_CANCEL_FAILED, HTTPSTATUS.BAD_REQUEST);
      }
      await this._slotRepository.delete(rescheduleRequest.newSlotId.toString(), options);
    });
    void this._notificationService.createNotification(
      responderId.toString(),
      NOTIFICATION_TEMPLATES.RESCHEDULE_CANCELLED(booking.bookingId)
    );
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

  private getBestDiscount(discounts: BulkDiscountType[] | null, count: number) {
    if (!discounts || !discounts?.length) {
      return null;
    }
    const eligible = discounts.filter((d) => count >= d.count);
    if (!eligible.length) {
      return null;
    }
    return eligible.reduce((a, b) => (a.percent > b.percent ? a : b));
  }

  private async getBookingContext(
    workerId: string,
    serviceId: string,
    lat: number,
    lng: number
  ): Promise<BookingContext> {
    const [service, worker] = await Promise.all([
      this._serviceRepository.findById(serviceId),
      this._workerRepository.findById(workerId),
    ]);
    if (!service) {
      throw new CustomError(SERVICE.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    if (!worker || worker.status !== WORKER_STATUS.VERIFIED) {
      throw new CustomError(WORKER.NOT_AVAILABLE, HTTPSTATUS.BAD_REQUEST);
    }
    const category = await this._categoryRepository.findById(service.categoryId);
    if (!category) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    const workerStripeId = worker.stripeAccountId;
    if (!workerStripeId || worker.stripeAccountStatus !== STRIPE_ACCOUNT_STATUS.ACTIVE) {
      throw new CustomError(WORKER.STRIPE_NOT_ACTIVE, HTTPSTATUS.BAD_REQUEST);
    }

    const rate = service.rate ?? category.baseRate;
    const estimatedDuration = service.estimatedDuration ?? category.estimatedDuration ?? 60;
    const bufferTime = service.bufferTime ?? category.bufferTime ?? 15;
    const platformFeePercent = category.platformFee ?? 0;
    const travelRatePerKM = category.travelRatePerKM ?? 0;
    const pricingMode = category.pricingMode as PricingMode;

    const distanceKm = calculateDistanceKm(
      { lat: worker.location.coordinates[1], lng: worker.location.coordinates[0] },
      { lat, lng }
    );
    const travelCost = Math.min(
      Math.round(distanceKm * (travelRatePerKM ?? 0)),
      service.maxTravelCost ?? Infinity
    );

    return {
      worker: {
        name: worker.displayName,
        phone: worker.phone,
      },
      service,
      category,
      pricingMode,
      rate,
      workerStripeId,
      estimatedDuration,
      bufferTime,
      platformFeePercent,
      travelRatePerKM,
      distanceKm,
      travelCost,
    };
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
