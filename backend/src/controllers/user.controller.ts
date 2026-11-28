import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS, USER } from "@/constants";
import { IUserController } from "@/core/interfaces/controllers/IUserController";
import { IUserService } from "@/core/interfaces/services/IUserService";
import { TYPES } from "@/di/types";
import {
  ChangePasswordDto,
  UserProfileRequestDto,
  VerifyOtpDto,
} from "@/dtos/requests/profile.dto";
import { ApiResponse } from "@/utils/apiResponse";
import CustomError from "@/utils/customError";

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TYPES.UserService) private _userService: IUserService) {}

  uploadImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { url } = req.body;
    if (!url) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    const imageUrl = await this._userService.updateProfileImage(userId, url);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ url: imageUrl }));
  });

  changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);

    await this._userService.updatePassword(userId, req.body as ChangePasswordDto);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.PASSWORD_UPDATED));
  });

  changeEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { email } = req.body;
    await this._userService.requestChangeEmail(userId, email);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.OTP_SENT));
  });

  changePhone = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { phone } = req.body;
    await this._userService.requestChangePhone(userId, phone);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.OTP_SENT));
  });

  resentOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const { type, value } = req.body;
    await this._userService.resendOtp(userId, type, value);

    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.OTP_RESENT));
  });

  confirmOtpAndUpdateContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const data = req.body as VerifyOtpDto;
    const { user, message } = await this._userService.confirmOtpAndUpdateContact(userId, data);

    res.status(HTTPSTATUS.OK).json(new ApiResponse(user, message));
  });

  updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.requireUserId(req);
    const data = req.body as UserProfileRequestDto;
    const user = await this._userService.updateProfile(userId, data);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(user, USER.PROFILE_SUCCESS));
  });

  private requireUserId(req: Request): string {
    if (!req.user?.id) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    return req.user.id;
  }
}
