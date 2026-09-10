import { inject, injectable } from "inversify";

import { transporter } from "@/config/nodemailer";
import { AUTH, CLIENT_URL, EMAIL_OTP_EXPIRY, HTTPSTATUS, NODEMAILER_EMAIL } from "@/constants";
import { REDIS_KEYS } from "@/constants/redis";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { ITokenService } from "@/core/interfaces/services/ITokenService";
import { TYPES } from "@/di/types";
import { RegisterRequestDTO } from "@/dtos/requests/auth.dto";
import { otpEmailTemplate } from "@/templates/emails/otpEmailTemplate";
import { resetPasswordTemplate } from "@/templates/emails/resetPasswordTemplate";
import CustomError from "@/utils/customError";

@injectable()
export class EmailService implements IEmailService {
  constructor(
    @inject(TYPES.TokenService) private _tokenService: ITokenService,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}

  async sendOtpEmail(userData: RegisterRequestDTO, otp: string): Promise<void> {
    const data = JSON.stringify({ userData, otp });

    await this._redisService.setWithTTL(
      REDIS_KEYS.AUTH.OTP(userData.email),
      data,
      EMAIL_OTP_EXPIRY
    );
    try {
      await transporter.sendMail({
        from: NODEMAILER_EMAIL,
        to: userData.email,
        subject: "Your OTP for Verification - Workzy",
        html: otpEmailTemplate(otp, EMAIL_OTP_EXPIRY / 60),
      });
    } catch (error) {
      console.error(AUTH.EMAIL_FAILED, error);
      throw new CustomError(AUTH.EMAIL_FAILED, HTTPSTATUS.BAD_REQUEST);
    }
  }

  async sendResetEmailWithToken(email: string): Promise<void> {
    const token = this._tokenService.generateToken();

    await this._redisService.setWithTTL(
      REDIS_KEYS.AUTH.FORGOT_PASSWORD(email),
      token,
      EMAIL_OTP_EXPIRY
    );

    const resetLink = `${CLIENT_URL}/reset-password?token=${token}&email=${email}`;

    await this.sendResetEmail(email, resetLink, EMAIL_OTP_EXPIRY / 60);
  }

  async sendResetEmail(email: string, resetLink: string, expiryTime: number): Promise<void> {
    try {
      await transporter.sendMail({
        from: NODEMAILER_EMAIL,
        to: email,
        subject: "Password Reset Request - Workzy",
        html: resetPasswordTemplate(resetLink, expiryTime),
      });
    } catch (error) {
      console.error(AUTH.EMAIL_FAILED, error);
      throw new CustomError(AUTH.EMAIL_FAILED, HTTPSTATUS.BAD_REQUEST);
    }
  }

  async sendEmail(email: string, otp: string) {
    try {
      await transporter.sendMail({
        from: NODEMAILER_EMAIL,
        to: email,
        subject: "Your OTP for Verification - Workzy",
        html: otpEmailTemplate(otp, EMAIL_OTP_EXPIRY / 60),
      });
    } catch (error) {
      console.error(AUTH.EMAIL_FAILED, error);
      throw new CustomError(AUTH.EMAIL_FAILED, HTTPSTATUS.BAD_REQUEST);
    }
  }
}
