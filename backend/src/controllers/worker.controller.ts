import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS, WORKER } from "@/constants";
import { IWorkerController } from "@/core/interfaces/controllers/IWorkerController";
import { IWorkerService } from "@/core/interfaces/services/IWorkerService";
import { TYPES } from "@/di/types";
import { JoinUsDTO } from "@/dtos/requests/joinUs.dto";
import { WorkerDocumentUploadDTO } from "@/dtos/requests/worker-document.dto";
import { WorkerProfileRequestDto } from "@/dtos/requests/worker.profile.dto";
import { ApiResponse } from "@/utils/apiResponse";
import CustomError from "@/utils/customError";

@injectable()
export class WorkerController implements IWorkerController {
  constructor(@inject(TYPES.WorkerService) private _workerService: IWorkerService) {}

  getWorkerProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = req.params.workerId;
    const worker = await this._workerService.getWorkerProfile(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(worker));
  });

  listPublicWorkers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { serviceId } = req.params;
    const workerId = req.user?.workerId;
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    const radiusKm = Number(req.query.radiusKm ?? 150);
    const limit = Math.max(Number(req.query.limit ?? 5), 5);

    if (isNaN(lat) || isNaN(lng)) {
      throw new CustomError("lat and lng query parameters are required", HTTPSTATUS.BAD_REQUEST);
    }
    const parsedCursor = req.query.cursor
      ? JSON.parse(Buffer.from(req.query.cursor as string, "base64url").toString("utf8"))
      : undefined;

    const { data, nextCursor } = await this._workerService.listPublicWorkers(serviceId, {
      lat,
      lng,
      radiusKm,
      limit: Math.min(limit, 10),
      workerId: workerId,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
      minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
      availableNow: req.query.availableNow === "true",
      cursor: parsedCursor
        ? {
            _id: parsedCursor._id,
            distance: parsedCursor.distance,
          }
        : undefined,
    });

    res.status(HTTPSTATUS.OK).json(new ApiResponse({ workers: data, nextCursor }));
  });

  getWorkerProfileDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const workerData = await this._workerService.getWorkerProfileDetails(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(workerData));
  });

  getWorkerProfileDetailsById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const workerData = await this._workerService.getWorkerProfileDetails(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(workerData));
  });

  updateWorkerProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const data = req.body as WorkerProfileRequestDto;
    const workerData = await this._workerService.updateWorkerProfile(workerId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ workerData }, WORKER.UPDATE_SUCCESS));
  });

  updateWorkerPhone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const { phone } = req.body;

    await this._workerService.updateWorkerPhone(workerId, phone);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, WORKER.UPDATE_SUCCESS));
  });

  updateProfileImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const { url } = req.body;
    if (!workerId || !url) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const imageUrl = await this._workerService.updateProfileImage(workerId, url);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ url: imageUrl }));
  });

  getMyWorkerProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const worker = await this._workerService.getMyWorkerProfile(userId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(worker));
  });

  createWorkerProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const data = req.body as JoinUsDTO;
    const worker = await this._workerService.createWorkerProfile(userId, data);
    res.status(HTTPSTATUS.CREATED).json(new ApiResponse({ worker }, WORKER.CREATE_SUCCESS));
  });

  reSubmitWorkerDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { workerId } = req.params;
    const data = req.body as JoinUsDTO;
    const workerData = await this._workerService.reSubmitWorkerDocument(workerId, data);
    res
      .status(HTTPSTATUS.OK)
      .json(new ApiResponse({ worker: workerData }, WORKER.DOCUMENT_UPDATED));
  });

  getWorkerDashboardAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const stats = await this._workerService.getWorkerDashboardAnalytics(workerId);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(stats));
  });

  addWorkerDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const data = req.body as WorkerDocumentUploadDTO;
    const workerData = await this._workerService.addWorkerDocument(workerId, data);
    res.status(HTTPSTATUS.CREATED).json(new ApiResponse(workerData, WORKER.DOCUMENT_UPLOADED));
  });

  updateWorkerDocument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workerId = this.requireWorkerId(req);
    const { documentId } = req.params;
    const { url } = req.body;
    const workerData = await this._workerService.updateWorkerDocument(workerId, documentId, url);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(workerData, WORKER.DOCUMENT_UPDATED));
  });

  private requireWorkerId(req: Request): string {
    if (!req.user?.workerId) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    return req.user.workerId;
  }
}
