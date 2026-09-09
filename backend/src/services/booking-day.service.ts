import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import logger from "@/config/logger";
import { BOOKING, BOOKING_STATUS, BOOKING_DAY_STATUS, HTTPSTATUS, AUTH } from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IBookingDayService } from "@/core/interfaces/services/IBookingDayService";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { TYPES } from "@/di/types";
import { DayCompleteDTO } from "@/dtos/requests/booking.dto";
import { IBooking, IDailyLog, IEvidence } from "@/types/booking/booking.entity";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class BookingDayService implements IBookingDayService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.SlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.OTPService) private _otpService: IOTPService,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork
  ) {}

  async checkInDay(bookingId: string, dayIndex: number, workerId: string): Promise<void> {
    const booking = await this.getBookingOrThrow(bookingId);
    this.assertWorkerOwnership(booking, workerId);
    const log = this.getDayLogOrThrow(booking, dayIndex);

    if (log.status === BOOKING_DAY_STATUS.CHECKED_IN) {
      throw new CustomError(BOOKING.DAY_ALREADY_CHECKED_IN, HTTPSTATUS.BAD_REQUEST);
    }
    const otp = this._otpService.generateOTP();
    const redisKey = this.otpRedisKey(bookingId, dayIndex);
    const [user] = await Promise.all([
      this._userRepository.findById(booking.userId.toString()),
      this._redisService.setWithTTL(redisKey, otp, 3600),
    ]);

    if (!user) {
      throw new CustomError(BOOKING.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    logger.info(`Generated Day ${dayIndex} OTP ${otp} for booking ${booking.bookingId}`);
    await this._emailService.sendEmail(
      user.email,
      `Your OTP for Project Day ${dayIndex} is ${otp}`
    );
  }

  async verifyDayOtp(
    bookingId: string,
    dayIndex: number,
    workerId: string,
    otp: string
  ): Promise<void> {
    const booking = await this.getBookingOrThrow(bookingId);
    this.assertWorkerOwnership(booking, workerId);
    this.getDayLogOrThrow(booking, dayIndex);

    const redisKey = this.otpRedisKey(bookingId, dayIndex);
    const cachedOtp = await this._redisService.get(redisKey);

    if (!cachedOtp || cachedOtp !== otp) {
      throw new CustomError(BOOKING.DAY_OTP_MISMATCH, HTTPSTATUS.BAD_REQUEST);
    }

    const dailyLogs = (booking.dailyLogs || []).map((d) =>
      d.dayIndex === dayIndex
        ? {
            dayIndex: dayIndex,
            date: d.date,
            status: BOOKING_DAY_STATUS.CHECKED_IN,
            checkInTime: new Date(),
          }
        : d
    );

    const isFirstDay =
      dailyLogs.filter((d) => d.status !== BOOKING_DAY_STATUS.PENDING).length === 1;
    const newStatus =
      isFirstDay && booking.status === BOOKING_STATUS.CONFIRMED
        ? BOOKING_STATUS.IN_PROGRESS
        : booking.status;

    await this._bookingRepository.findByIdAndUpdate(bookingId, {
      dailyLogs,
      status: newStatus,
    });
    void this._redisService.delete(redisKey);
  }

  async completeDay(
    bookingId: string,
    dayIndex: number,
    workerId: string,
    data: DayCompleteDTO
  ): Promise<void> {
    const { evidence, note } = data;
    const booking = await this.getBookingOrThrow(bookingId);
    this.assertWorkerOwnership(booking, workerId);
    const log = this.getDayLogOrThrow(booking, dayIndex);

    if (log.status !== BOOKING_DAY_STATUS.CHECKED_IN) {
      throw new CustomError(BOOKING.DAY_NOT_CHECKED_IN, HTTPSTATUS.BAD_REQUEST);
    }

    const bookingEvidence: IEvidence = {
      after: evidence.after,
      before: evidence.before,
      uploadedAt: new Date(),
    };
    const dailyLogs: IDailyLog[] = (booking.dailyLogs || []).map((d) =>
      d.dayIndex === dayIndex
        ? {
            dayIndex: dayIndex,
            date: d.date,
            checkInTime: d.checkInTime,
            status: BOOKING_DAY_STATUS.COMPLETED,
            checkOutTime: new Date(),
            evidence: bookingEvidence,
            workerNote: note,
          }
        : d
    );

    const allFinished = dailyLogs.every(
      (d) => d.status === BOOKING_DAY_STATUS.COMPLETED || d.status === BOOKING_DAY_STATUS.SKIPPED
    );
    const newStatus = allFinished ? BOOKING_STATUS.COMPLETED : booking.status;
    const completedAt = allFinished ? new Date() : booking.completedAt;

    await this._unitOfWork.execute(async (options) => {
      await this._bookingRepository.update(
        bookingId,
        {
          dailyLogs,
          status: newStatus,
          completedAt,
        },
        options
      );
      await this._slotRepository.deleteMany(
        {
          bookingId: new Types.ObjectId(bookingId),
          workerId: new Types.ObjectId(workerId),
          date: log.date,
        },
        options
      );
    });
  }

  async skipDay(
    bookingId: string,
    dayIndex: number,
    workerId: string,
    reason: string
  ): Promise<void> {
    const booking = await this.getBookingOrThrow(bookingId);
    this.assertWorkerOwnership(booking, workerId);
    const log = this.getDayLogOrThrow(booking, dayIndex);

    const dailyLogs = (booking.dailyLogs || []).map((d) =>
      d.dayIndex === dayIndex
        ? {
            dayIndex: dayIndex,
            date: d.date,
            status: BOOKING_DAY_STATUS.SKIPPED,
            skippedReason: reason,
          }
        : d
    );

    const allFinished = dailyLogs.every(
      (d) => d.status === BOOKING_DAY_STATUS.COMPLETED || d.status === BOOKING_DAY_STATUS.SKIPPED
    );
    const newStatus = allFinished ? BOOKING_STATUS.COMPLETED : booking.status;
    const completedAt = allFinished ? new Date() : booking.completedAt;

    await this._unitOfWork.execute(async (options) => {
      await this._bookingRepository.update(
        bookingId,
        {
          dailyLogs,
          status: newStatus,
          completedAt,
        },
        options
      );
      await this._slotRepository.deleteMany(
        {
          bookingId: new Types.ObjectId(bookingId),
          workerId: new Types.ObjectId(workerId),
          date: log.date,
        },
        options
      );
    });
  }

  private async getBookingOrThrow(bookingId: string): Promise<IBooking> {
    return await getEntityOrThrow(this._bookingRepository, bookingId, BOOKING.NOT_FOUND);
  }

  private assertWorkerOwnership(booking: IBooking, workerId: string): void {
    if (booking.workerId.toString() !== workerId) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN);
    }
  }
  private getDayLogOrThrow(booking: IBooking, dayIndex: number) {
    const log = booking.dailyLogs?.find((d) => d.dayIndex === dayIndex);
    if (!log) {
      throw new CustomError(BOOKING.DAY_INDEX_OUT_OF_RANGE, HTTPSTATUS.BAD_REQUEST);
    }
    return log;
  }

  private otpRedisKey(bookingId: string, dayIndex: number): string {
    return `booking-day-otp:${bookingId}:${dayIndex}`;
  }
}
