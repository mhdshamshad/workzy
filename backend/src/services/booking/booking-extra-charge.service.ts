import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import { AUTH, BOOKING, BOOKING_STATUS, HTTPSTATUS, NOTIFICATION_TEMPLATES } from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IBookingExtraChargeService } from "@/core/interfaces/services/IBookingExtraChargeService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { TYPES } from "@/di/types";
import { ExtraChargeDTO } from "@/dtos/requests/booking.dto";
import { IExtraCharge } from "@/types/booking/booking.entity";
import { getBookingOrThrow } from "@/utils/booking.helper";
import CustomError from "@/utils/customError";

@injectable()
export class BookingExtraChargeService implements IBookingExtraChargeService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService
  ) {}

  async payExtraCharge(bookingId: string, userId: string): Promise<{ url: string }> {
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);
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
}
