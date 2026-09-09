import dayjs from "dayjs";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import {
  AUTH,
  BOOKING,
  BOOKING_PAYMENT_STATUS,
  BOOKING_STATUS,
  BOOKING_STATUS_MESSAGES,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  ROLE,
  SLOT,
  SLOT_STATUS,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IQuoteRepository } from "@/core/interfaces/repositories/IQuoteRepository";
import { ISlotRepository } from "@/core/interfaces/repositories/ISlotRepository";
import { IBookingRescheduleService } from "@/core/interfaces/services/IBookingRescheduleService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { TYPES } from "@/di/types";
import {
  CancelRescheduleDto,
  RequestRescheduleDto,
  RespondRescheduleDto,
} from "@/dtos/requests/booking.dto";
import { IBookingSlot } from "@/types/booking/booking.entity";
import { createStatusHistoryEntry, getBookingOrThrow } from "@/utils/booking.helper";
import CustomError from "@/utils/customError";
import { formatTimeRange } from "@/utils/time.utils";

@injectable()
export class BookingRescheduleService implements IBookingRescheduleService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.SlotRepository) private _slotRepository: ISlotRepository,
    @inject(TYPES.QuoteRepository) private _quoteRepository: IQuoteRepository,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork
  ) {}

  async requestReschedule(
    bookingId: string,
    initiatorId: string,
    data: RequestRescheduleDto
  ): Promise<void> {
    const { newSlotId, oldSlotId, reason, requestedBy } = data;
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);
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
        statusHistory: createStatusHistoryEntry(
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
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);
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

      const historyEntry = createStatusHistoryEntry(
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
              statusHistory: createStatusHistoryEntry(
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
    const booking = await getBookingOrThrow(this._bookingRepository, bookingId);
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
            statusHistory: createStatusHistoryEntry(
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
}
