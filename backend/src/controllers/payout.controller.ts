import dayjs from "dayjs";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS, PayoutRequestStatus } from "@/constants";
import { IPayoutController } from "@/core/interfaces/controllers/IPayoutController";
import { IPayoutService } from "@/core/interfaces/services/IPayoutService";
import { TYPES } from "@/di/types";
import {
  BankDetailsDto,
  RequestPayoutDto,
  setPrimaryMethodDto,
  UpiDetailsDto,
} from "@/dtos/requests/payout.dto";
import { ApiResponse } from "@/utils/apiResponse";
import CustomError from "@/utils/customError";

@injectable()
export class PayoutController implements IPayoutController {
  constructor(@inject(TYPES.PayoutService) private _payoutService: IPayoutService) {}

  updateBankDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const data = req.body as BankDetailsDto;
    await this._payoutService.updateBankDetails(workerId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Payout details updated successfully"));
  });

  updateUpiDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const data = req.body as UpiDetailsDto;
    await this._payoutService.updateUpiDetails(workerId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Payout details updated successfully"));
  });

  setPrimaryMethod = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const data = req.body as setPrimaryMethodDto;
    await this._payoutService.setPrimaryMethod(workerId, data);
    res
      .status(HTTPSTATUS.OK)
      .json(new ApiResponse(null, "Payout method set as primary successfully"));
  });

  removeBankDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    await this._payoutService.removeBankDetails(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Payout details removed successfully"));
  });

  removeUpiDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    await this._payoutService.removeUpiDetails(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Payout details removed successfully"));
  });

  requestPayout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const data = req.body as RequestPayoutDto;
    const request = await this._payoutService.requestPayout(workerId, data);
    res
      .status(HTTPSTATUS.CREATED)
      .json(new ApiResponse(request, "Payout request submitted successfully"));
  });

  getPayoutRequests = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);

    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const search = (req.query.search as string) ?? "";
    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;

    let parsedCursor = undefined;
    if (req.query.cursor) {
      try {
        parsedCursor = JSON.parse(
          Buffer.from(req.query.cursor as string, "base64url").toString("utf8")
        );
      } catch {
        parsedCursor = undefined;
      }
    }
    const status = (req.query.status as PayoutRequestStatus) || "all";

    const result = await this._payoutService.getPayoutRequests({
      workerId,
      limit,
      search,
      status,
      cursor: parsedCursor,
      fromDate: fromDate ? dayjs(fromDate).startOf("day").toDate() : undefined,
      toDate: toDate ? dayjs(toDate).endOf("day").toDate() : undefined,
    });
    res
      .status(HTTPSTATUS.OK)
      .json(new ApiResponse(result, "Payout history retrieved successfully"));
  });

  private requireWorkerId(req: Request): string {
    const workerId = req.user?.workerId;
    if (!workerId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    return workerId;
  }
}
