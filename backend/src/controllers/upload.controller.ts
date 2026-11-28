import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { HTTPSTATUS } from "@/constants";
import { IUploadController } from "@/core/interfaces/controllers/IUploadController";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { TYPES } from "@/di/types";
import { RequestUploadUrlDTO } from "@/dtos/requests/upload.dto";
import { ApiResponse } from "@/utils/apiResponse";

@injectable()
export class UploadController implements IUploadController {
  constructor(@inject(TYPES.StorageService) private _storageService: IStorageService) {}

  requestUploadUrl = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = req.body as RequestUploadUrlDTO;

    const signedUrl = await this._storageService.generateUploadPresignedUrl(data);

    res.status(HTTPSTATUS.OK).json(new ApiResponse(signedUrl));
  });
}
