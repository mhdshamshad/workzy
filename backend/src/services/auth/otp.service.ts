import crypto from "crypto";

import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS } from "@/constants";
import { REDIS_KEYS } from "@/constants/redis";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { TYPES } from "@/di/types";
import { RegisterRequestDTO } from "@/dtos/requests/auth.dto";
import CustomError from "@/utils/customError";

@injectable()
export class OTPService implements IOTPService {
  constructor(
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}

  generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Resend OTP to the user's email
  async resendOtp(email: string): Promise<void> {
    const rawData = await this._redisService.get(REDIS_KEYS.AUTH.OTP(email));
    if (!rawData) {
      throw new CustomError(AUTH.OTP_EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }
    const existingData = JSON.parse(rawData);
    const newOtp = this.generateOTP();

    await this._emailService.sendOtpEmail(existingData.userData, newOtp);
  }

  async verifyAndRetrieveUser(key: string, otp: string): Promise<RegisterRequestDTO> {
    const storedData = await this._redisService.get(REDIS_KEYS.AUTH.OTP(key));
    if (!storedData) {
      throw new CustomError(AUTH.OTP_EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }

    const { userData, otp: storedOTP } = JSON.parse(storedData);

    if (otp !== storedOTP) {
      throw new CustomError(AUTH.INVALID_OTP, HTTPSTATUS.BAD_REQUEST);
    }

    return userData;
  }
}
