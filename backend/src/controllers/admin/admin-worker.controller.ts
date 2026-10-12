import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { injectable, inject } from "inversify";

import { HTTPSTATUS, WORKER } from "@/constants";
import { WalletPayoutStatus } from "@/constants/payout";
import { IAdminWorkerController } from "@/core/interfaces/controllers/admin/IAdminWorkerController";
import { IServiceManagement } from "@/core/interfaces/services/IServiceManagement";
import { IWorkerService } from "@/core/interfaces/services/IWorkerService";
import { TYPES } from "@/di/types";
import {
  WorkerDocumentReviewRequestDTO,
  WorkerReviewRequestDTO,
} from "@/dtos/requests/admin/worker-review.dto";
import { WorkerStatusFilter } from "@/types/worker/worker.query";
import { ApiResponse } from "@/utils/apiResponse";

@injectable()
export class AdminWorkerController implements IAdminWorkerController {
  constructor(
    @inject(TYPES.WorkerService) private _workerService: IWorkerService,
    @inject(TYPES.ServiceManagement) private _serviceManagement: IServiceManagement
  ) {}

  listWorkers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as WorkerStatusFilter) || "all";
    const payoutStatus = (req.query.payoutStatus as "all" | WalletPayoutStatus) || "all";

    const { data, total } = await this._workerService.listWorkers({
      page,
      limit,
      search,
      status,
      payoutStatus,
    });

    res.status(HTTPSTATUS.OK).json(
      new ApiResponse({
        workers: data,
        total,
      })
    );
  });

  reviewWorker = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const data = req.body as WorkerReviewRequestDTO;
    const updatedWorker = await this._workerService.reviewWorker(workerId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ worker: updatedWorker }, WORKER.VERIFIED));
  });

  toggleStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const reason = req.body.reason;
    const message = await this._workerService.toggleWorkerStatus(workerId, reason);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, message));
  });

  reviewWorkerDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId, documentId } = req.params;
    const data = req.body as WorkerDocumentReviewRequestDTO;
    const worker = await this._workerService.reviewWorkerDocument(workerId, documentId, data);

    res.status(HTTPSTATUS.OK).json(new ApiResponse({ worker: worker }, WORKER.DOCUMENT_REVIEWED));
  });

  getWorkerStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const stats = await this._workerService.getWorkerStats(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(stats));
  });

  getWorkerServices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const search = (req.query.search as string) || "";
    const status = (req.query.status as "all" | "blocked" | "active") || "all";
    const categoryId = !req.query.categoryId ? null : (req.query.categoryId as string);
    const parsedCursor = req.query.cursor
      ? JSON.parse(Buffer.from(req.query.cursor as string, "base64url").toString("utf8"))
      : undefined;
    const { data, nextCursor } = await this._serviceManagement.getWorkerServices(workerId, {
      limit,
      search,
      status,
      categoryId,
      cursor: parsedCursor
        ? { _id: parsedCursor._id, createdAt: new Date(parsedCursor.createdAt) }
        : undefined,
    });
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ services: data, nextCursor }));
  });
  getWorkerServiceCategories = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const categories = await this._serviceManagement.getWorkerServiceCategories(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ categories }));
  });
}
