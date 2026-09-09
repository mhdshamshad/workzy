import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS } from "@/constants";
import { IBookingDayController } from "@/core/interfaces/controllers/IBookingDayController";
import { IBookingDayService } from "@/core/interfaces/services/IBookingDayService";
import { TYPES } from "@/di/types";
import { DayCompleteDTO, VerifyBookingOtpDTO } from "@/dtos/requests/booking.dto";
import { ApiResponse } from "@/utils/apiResponse";
import CustomError from "@/utils/customError";

@injectable()
export class BookingDayController implements IBookingDayController {
  constructor(@inject(TYPES.BookingDayService) private _bookingDayService: IBookingDayService) {}

  checkInDay = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const bookingId = req.params.bookingId;
    const day = Number(req.params.day);
    const workerId = this.requireWorkerId(req);

    await this._bookingDayService.checkInDay(bookingId, day, workerId);
    res
      .status(HTTPSTATUS.OK)
      .json(new ApiResponse(null, "Check-in OTP sent to customer successfully"));
  });

  verifyDayOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.params;
    const day = Number(req.params.day);
    const workerId = this.requireWorkerId(req);
    const { otp } = req.body as VerifyBookingOtpDTO;

    await this._bookingDayService.verifyDayOtp(bookingId, day, workerId, otp);
    res
      .status(HTTPSTATUS.OK)
      .json(new ApiResponse(null, "Day OTP verified successfully. Status set to checked_in."));
  });

  completeDay = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const bookingId = req.params.bookingId;
    const day = Number(req.params.day);
    const workerId = this.requireWorkerId(req);
    const data: DayCompleteDTO = req.body;

    await this._bookingDayService.completeDay(bookingId, day, workerId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Day marked completed successfully"));
  });

  skipDay = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const bookingId = req.params.bookingId;
    const day = Number(req.params.day);
    const workerId = this.requireWorkerId(req);
    const { reason } = req.body;

    await this._bookingDayService.skipDay(bookingId, day, workerId, reason);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Day skipped successfully"));
  });

  private requireWorkerId(req: Request): string {
    if (!req.user?.workerId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    return req.user.workerId;
  }
}
