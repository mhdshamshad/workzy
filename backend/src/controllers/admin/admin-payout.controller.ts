import dayjs from "dayjs";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS, PayoutRequestStatus } from "@/constants";
import { IAdminPayoutController } from "@/core/interfaces/controllers/admin/IAdminPayoutController";
import { IPayoutService } from "@/core/interfaces/services/IPayoutService";
import { TYPES } from "@/di/types";
import { ApprovePayoutDto, RejectPayoutDto } from "@/dtos/requests/payout.dto";
import { ApiResponse } from "@/utils/apiResponse";
import CustomError from "@/utils/customError";

@injectable()
export class AdminPayoutController implements IAdminPayoutController {
  constructor(@inject(TYPES.PayoutService) private _payoutService: IPayoutService) {}

  listPayouts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const search = (req.query.search as string) ?? "";
    const workerId = (req.query.workerId as string) ?? "";
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
      limit,
      cursor: parsedCursor,
      status,
      search,
      workerId,
      fromDate: fromDate ? dayjs(fromDate).startOf("day").toDate() : undefined,
      toDate: toDate ? dayjs(toDate).endOf("day").toDate() : undefined,
    });
    res
      .status(HTTPSTATUS.OK)
      .json(new ApiResponse(result, "Payout requests retrieved successfully"));
  });

  approvePayout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const { payoutId } = req.params;
    const data = req.body as ApprovePayoutDto;
    await this._payoutService.approvePayout(payoutId, adminId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Payout approved successfully"));
  });

  rejectPayout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = req.user?.id;
    if (!adminId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const { payoutId } = req.params;
    const data = req.body as RejectPayoutDto;
    await this._payoutService.rejectPayout(payoutId, adminId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, "Payout rejected and balance refunded"));
  });
}
