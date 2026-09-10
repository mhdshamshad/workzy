import dayjs from "dayjs";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { AUTH, BillType, HTTPSTATUS, PAYMENT, PaymentStatus } from "@/constants";
import { IPaymentController } from "@/core/interfaces/controllers/IPaymentController";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { TYPES } from "@/di/types";
import { PaymentListQuery } from "@/types/payment/payment.query";
import { ApiResponse } from "@/utils/apiResponse";
import CustomError from "@/utils/customError";

@injectable()
export class PaymentController implements IPaymentController {
  constructor(@inject(TYPES.PaymentService) private _paymentService: IPaymentService) {}

  handleWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string") {
      throw new CustomError(PAYMENT.WEBHOOK_SIGNATURE_MISSING, HTTPSTATUS.BAD_REQUEST);
    }
    await this._paymentService.handleWebhookEvent(req.body as Buffer, sig);
    res.status(HTTPSTATUS.OK).json({ received: true });
  });

  verifySession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.params;
    const result = await this._paymentService.verifySession(sessionId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(result));
  });

  getPayments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = this.parseQuery(req);
    const userId = req.query.userId as string | undefined;
    const workerId = req.query.workerId as string | undefined;
    const { nextCursor, data } = await this._paymentService.getPayments({
      userId,
      workerId,
      ...query,
    });
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ payments: data, nextCursor }));
  });

  getUserPayments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.FORBIDDEN);
    }
    const query = this.parseQuery(req);
    const { nextCursor, data } = await this._paymentService.getUserPayments(userId, query);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ payments: data, nextCursor }));
  });

  getWorkerPayments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = req.user?.workerId;
    if (!workerId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.FORBIDDEN);
    }
    const query = this.parseQuery(req);
    const { nextCursor, data } = await this._paymentService.getWorkerPayments(workerId, query);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ payments: data, nextCursor }));
  });

  private parseQuery(req: Request): PaymentListQuery {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const parsedCursor = req.query.cursor
      ? JSON.parse(Buffer.from(req.query.cursor as string, "base64url").toString("utf8"))
      : undefined;
    const fromDate = req.query.fromDate as string | undefined;
    const toDate = req.query.toDate as string | undefined;
    return {
      limit,
      status: (req.query.status as PaymentStatus) ?? ("all" as PaymentStatus),
      billType: (req.query.billType as BillType) || "all",
      search: (req.query.search as string) ?? "",
      cursor: parsedCursor,
      fromDate: fromDate ? dayjs(fromDate).startOf("day").toDate() : undefined,
      toDate: toDate ? dayjs(toDate).endOf("day").toDate() : undefined,
    };
  }
}
