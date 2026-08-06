import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";
import { isValidObjectId } from "mongoose";

import {
  AUTH,
  BOOKING,
  BOOKING_STATUS_MESSAGES,
  BookingPaymentStatus,
  HTTPSTATUS,
  ROLE,
} from "@/constants";
import { IBookingController } from "@/core/interfaces/controllers/IBookingController";
import { IBookingService } from "@/core/interfaces/services/IBookingService";
import { TYPES } from "@/di/types";
import {
  CancelBookingDTO,
  CompleteBookingDTO,
  CreatebookingDTO,
  ExtraChargeDTO,
  RejectBookingDTO,
  VerifyBookingOtpDTO,
  RequestRescheduleDto,
  RespondRescheduleDto,
  CancelRescheduleDto,
} from "@/dtos/requests/booking.dto";
import { BookingListQuery, ListingStatus } from "@/types/booking/booking.query";
import CustomError from "@/utils/customError";

@injectable()
export class BookingController implements IBookingController {
  constructor(@inject(TYPES.BookingService) private _bookingService: IBookingService) {}
  createBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const data = req.body as CreatebookingDTO;
    const { url } = await this._bookingService.createBooking(userId, data);
    res.status(HTTPSTATUS.OK).json({ url });
  });

  getBookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = this.parseQuery(req);
    const { userId, workerId } = this.resolveActorIds(req);
    const paymentStatus = (req.query.paymentStatus as BookingPaymentStatus) || "all";
    const { data, nextCursor } = await this._bookingService.getBookings({
      ...query,
      paymentStatus,
      userId,
      workerId,
    });
    res.status(HTTPSTATUS.OK).json({ bookings: data, nextCursor });
  });

  getBookingById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    if (!isValidObjectId(bookingId)) {
      throw new CustomError("Invalid Booking ID", HTTPSTATUS.NOT_FOUND);
    }
    const result = await this._bookingService.getBookingDetails(bookingId);
    res.status(HTTPSTATUS.OK).json({ booking: result });
  });

  cancelBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { bookingId } = req.params;
    const { reason } = req.body as CancelBookingDTO;
    await this._bookingService.cancelBooking(bookingId, userId, reason);

    res.status(HTTPSTATUS.OK).json({ message: BOOKING_STATUS_MESSAGES.CANCELLED });
  });

  acceptBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const workerId = this.requireWorkerId(req);
    await this._bookingService.acceptBooking(bookingId, workerId);
    res.status(HTTPSTATUS.OK).json({ message: BOOKING_STATUS_MESSAGES.CONFIRMED });
  });

  rejectBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const { bookingId } = req.params;
    const { reason } = req.body as RejectBookingDTO;
    await this._bookingService.rejectBooking({ bookingId, reason, workerId });
    res.status(HTTPSTATUS.OK).json({ message: BOOKING_STATUS_MESSAGES.REJECTED });
  });

  markEnRoute = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    await this._bookingService.markEnRoute(req.params.bookingId, workerId);
    res.status(HTTPSTATUS.OK).json({ message: BOOKING_STATUS_MESSAGES.EN_ROUTE });
  });

  markReached = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    await this._bookingService.markReached(req.params.bookingId, workerId);
    res.status(HTTPSTATUS.OK).json({ message: BOOKING_STATUS_MESSAGES.REACHED });
  });

  startJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const { bookingId } = req.params;
    const { otp } = req.body as VerifyBookingOtpDTO;

    await this._bookingService.startJob(bookingId, workerId, otp);
    res.status(HTTPSTATUS.OK).json({ message: BOOKING_STATUS_MESSAGES.IN_PROGRESS });
  });

  approveBooking = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { bookingId } = req.params;
    await this._bookingService.approveBooking(bookingId, userId);
    res.status(HTTPSTATUS.OK).json({ message: "Job approved and payment released" });
  });

  payExtraCharge = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { bookingId } = req.params;

    const { url } = await this._bookingService.payExtraCharge(bookingId, userId);
    res.status(HTTPSTATUS.OK).json({ url });
  });

  rejectExtraCharge = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { bookingId } = req.params;
    await this._bookingService.rejectExtraCharge(bookingId, userId);
    res.status(HTTPSTATUS.OK).json({ message: "Extra charge rejected" });
  });

  completeJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const { bookingId } = req.params;
    const data = req.body as CompleteBookingDTO;

    await this._bookingService.completeJob(bookingId, workerId, data);
    res.status(HTTPSTATUS.OK).json({ message: BOOKING_STATUS_MESSAGES.COMPLETED });
  });

  requestExtraCharge = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const { bookingId } = req.params;
    const data = req.body as ExtraChargeDTO;
    await this._bookingService.requestExtraCharge(bookingId, workerId, data);
    res.status(HTTPSTATUS.OK).json({ message: "Extra charge request sent to client" });
  });

  requestReschedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const data = req.body as RequestRescheduleDto;
    const initiatorId =
      data.requestedBy === ROLE.WORKER ? this.requireWorkerId(req) : this.requireUserId(req);
    await this._bookingService.requestReschedule(bookingId, initiatorId, data);
    res.status(HTTPSTATUS.OK).json({ message: BOOKING.RESCHEDULE_REQUESTED_SUCCESS });
  });

  respondReschedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const data = req.body as RespondRescheduleDto;
    const responderId =
      data.role === ROLE.WORKER ? this.requireWorkerId(req) : this.requireUserId(req);
    const message = await this._bookingService.respondReschedule(bookingId, responderId, data);
    res.status(HTTPSTATUS.OK).json({ message });
  });

  cancelReschedule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const data = req.body as CancelRescheduleDto;
    const initiatorId =
      data.requestedBy === ROLE.WORKER ? this.requireWorkerId(req) : this.requireUserId(req);
    await this._bookingService.cancelReschedule(bookingId, initiatorId, data);
    res.status(HTTPSTATUS.OK).json({ message: BOOKING.RESCHEDULE_CANCELLED_SUCCESS });
  });

  private parseQuery(req: Request): BookingListQuery {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const search = (req.query.search as string) ?? "";
    const status = (req.query.status as ListingStatus) ?? ("all" as ListingStatus);

    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;
    const parsedCursor = req.query.cursor
      ? JSON.parse(Buffer.from(req.query.cursor as string, "base64url").toString("utf8"))
      : undefined;

    return {
      limit,
      status,
      search,
      cursor: parsedCursor,
      fromDate,
      toDate,
    };
  }

  private resolveActorIds(req: Request): { userId?: string; workerId?: string } {
    const role = req.user?.role;
    if (role === ROLE.ADMIN) {
      return {
        userId: req.query.userId as string | undefined,
        workerId: req.query.workerId as string | undefined,
      };
    }

    if (role === ROLE.USER) return { userId: this.requireUserId(req) };
    if (role === ROLE.WORKER) return { workerId: this.requireWorkerId(req) };

    return {};
  }

  private requireUserId(req: Request): string {
    if (!req.user?.id) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    return req.user.id;
  }

  private requireWorkerId(req: Request): string {
    if (!req.user?.workerId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    return req.user.workerId;
  }
}
