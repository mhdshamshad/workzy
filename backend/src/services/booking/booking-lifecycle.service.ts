import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import logger from "@/config/logger";
import {
  AUTH,
  BOOKING,
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
  BOOKING_STATUS_MESSAGES,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  ROLE,
  SLOT_STATUS,
  USER,
} from "@/constants";
import { REDIS_KEYS } from "@/constants/redis";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IBookingLifecycleService } from "@/core/interfaces/services/IBookingLifecycleService";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IMessageService } from "@/core/interfaces/services/IMessageService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { TYPES } from "@/di/types";
import { CompleteBookingDTO } from "@/dtos/requests/booking.dto";
import { IBooking, IEvidence } from "@/types/booking/booking.entity";
import {
  assertWorkerOwnership,
  createStatusHistoryEntry,
  getBookingOrThrow,
  sendBookingEvent,
} from "@/utils/booking.helper";
import CustomError from "@/utils/customError";

@injectable()
export class BookingLifecycleService implements IBookingLifecycleService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.SlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.OTPService) private _otpService: IOTPService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.MessageService) private _messageService: IMessageService,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork
  ) {}

  async cancelBooking(bookingId: string, userId: string, reason: string): Promise<void> {
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);

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
            statusHistory: createStatusHistoryEntry(BOOKING_STATUS.CANCELLED, ROLE.USER, reason),
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

    void sendBookingEvent(
      this._messageService,
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
            statusHistory: createStatusHistoryEntry(
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

    void sendBookingEvent(
      this._messageService,
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
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);
    assertWorkerOwnership(booking, workerId);
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
            statusHistory: createStatusHistoryEntry(BOOKING_STATUS.REJECTED, ROLE.WORKER, reason),
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

    void sendBookingEvent(
      this._messageService,
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
          statusHistory: createStatusHistoryEntry(
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
          statusHistory: createStatusHistoryEntry(
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
    const redisKey = REDIS_KEYS.BOOKING.OTP(bookingId);
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
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);
    assertWorkerOwnership(booking, workerId);
    if (booking.status !== BOOKING_STATUS.REACHED) {
      throw new CustomError(BOOKING.CANNOT_START(booking.status), HTTPSTATUS.BAD_REQUEST);
    }
    const redisKey = REDIS_KEYS.BOOKING.OTP(bookingId);
    const storedOtp = await this._redisService.get(redisKey);
    if (!storedOtp || storedOtp !== otp) {
      throw new CustomError(BOOKING.INVALID_OTP, HTTPSTATUS.BAD_REQUEST);
    }
    await this._bookingRepository.update(bookingId, {
      status: BOOKING_STATUS.IN_PROGRESS,
      $push: {
        statusHistory: createStatusHistoryEntry(
          BOOKING_STATUS.IN_PROGRESS,
          ROLE.WORKER,
          BOOKING_STATUS_MESSAGES.IN_PROGRESS
        ),
      },
    });
    void this._redisService.delete(redisKey);
    void sendBookingEvent(
      this._messageService,
      booking,
      `Work has started for booking ${booking.bookingId}`
    );
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
            statusHistory: createStatusHistoryEntry(
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

    void sendBookingEvent(
      this._messageService,
      booking,
      `Work has been completed for booking ${booking.bookingId}`
    );
    void this._notificationService.createNotification(
      booking.userId.toString(),
      NOTIFICATION_TEMPLATES.JOB_COMPLETED(booking.bookingId, booking.snapshot.worker.name)
    );
  }

  async approveBooking(bookingId: string, userId: string): Promise<void> {
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);
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
        statusHistory: createStatusHistoryEntry(
          BOOKING_STATUS.APPROVED,
          ROLE.USER,
          BOOKING_STATUS_MESSAGES.APPROVED
        ),
      },
    });

    void sendBookingEvent(
      this._messageService,
      booking,
      `Booking ${booking.bookingId} has been approved by the user`
    );
    void this._notificationService.createNotification(
      booking.workerId.toString(),
      NOTIFICATION_TEMPLATES.JOB_APPROVED(booking.bookingId, booking.snapshot.user.name)
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
              statusHistory: createStatusHistoryEntry(
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
}
