import dayjs from "dayjs";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS, WalletTransactionCategory, WalletTransactionType } from "@/constants";
import { IWalletController } from "@/core/interfaces/controllers/IWalletController";
import { IWalletService } from "@/core/interfaces/services/IWalletService";
import { TYPES } from "@/di/types";
import { ApiResponse } from "@/utils/apiResponse";
import CustomError from "@/utils/customError";

@injectable()
export class WalletController implements IWalletController {
  constructor(@inject(TYPES.WalletService) private _walletService: IWalletService) {}

  getWallet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const wallet = await this._walletService.getWallet(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(wallet));
  });

  getTransactions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const search = (req.query.search as string) ?? "";
    const category = (req.query.category as WalletTransactionCategory) || "all";
    const type = (req.query.type as WalletTransactionType) || "all";
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

    const result = await this._walletService.getTransactions(workerId, {
      limit,
      cursor: parsedCursor,
      category,
      search,
      type,
      fromDate: fromDate ? dayjs(fromDate).startOf("day").toDate() : undefined,
      toDate: toDate ? dayjs(toDate).endOf("day").toDate() : undefined,
    });
    res.status(HTTPSTATUS.OK).json(new ApiResponse(result));
  });

  private requireWorkerId(req: Request): string {
    const workerId = req.user?.workerId;
    if (!workerId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    return workerId;
  }
}
