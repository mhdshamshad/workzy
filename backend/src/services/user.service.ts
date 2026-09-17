import { compare, hash } from "bcryptjs";
import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import validator from "validator";

import {
  AUTH,
  EMAIL,
  EMAIL_OTP_EXPIRY,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  USER,
} from "@/constants";
import { REDIS_KEYS } from "@/constants/redis";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IDisputeRepository } from "@/core/interfaces/repositories/IDisputeRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { IUserService } from "@/core/interfaces/services/IUserService";
import { TYPES } from "@/di/types";
import {
  ChangePasswordDto,
  UserProfileRequestDto,
  VerifyOtpDto,
} from "@/dtos/requests/profile.dto";
import { UsersResponseDTO } from "@/dtos/responses/admin/users.dto";
import { UserProfileResponseDto } from "@/dtos/responses/user.dto";
import { PaginatedResult } from "@/types/common/pagination";
import { IUser } from "@/types/user/user.entity";
import { UserListQuery } from "@/types/user/user.query";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";
import { extractKeyFromUrl } from "@/utils/upload";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.OTPService) private _otpService: IOTPService,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.DisputeRepository) private _disputeRepository: IDisputeRepository
  ) {}

  async findByEmail(email: string): Promise<IUser | null> {
    return this._userRepository.findByEmail(email);
  }

  async listUsers(query: UserListQuery): Promise<PaginatedResult<UsersResponseDTO>> {
    const { data, total } = await this._userRepository.listUsers(query);
    return {
      data: await UsersResponseDTO.fromEntities(data, this._s3Service),
      total,
    };
  }

  async toggleUserStatus(userId: string): Promise<string> {
    const user = await getEntityOrThrow(this._userRepository, userId, USER.NOT_FOUND);
    const newStatus = !user.isBlocked;

    await this._userRepository.update(userId, { isBlocked: newStatus });

    if (newStatus) {
      await this._redisService.set(`blocked_user:${userId}`, "1");
      void this._notificationService.createNotification(
        userId,
        NOTIFICATION_TEMPLATES.ACCOUNT_BLOCKED()
      );
    } else {
      await this._redisService.delete(`blocked_user:${userId}`);
      void this._notificationService.createNotification(
        userId,
        NOTIFICATION_TEMPLATES.ACCOUNT_UNBLOCKED()
      );
    }
    return newStatus ? USER.BLOCKEDSUCCESS : USER.UNBLOCKED;
  }

  async getUserById(userId: string): Promise<UserProfileResponseDto> {
    const user = await getEntityOrThrow(this._userRepository, userId, USER.NOT_FOUND);
    return UserProfileResponseDto.fromEntity(user, this._s3Service);
  }

  async getUserStats(userId: string): Promise<{
    totalBookings: number;
    totalSpent: number;
    totalDisputes: number;
  }> {
    const [bookingStats, totalDisputes] = await Promise.all([
      this._bookingRepository.getUserBookingStats(userId),
      this._disputeRepository.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);
    return {
      ...bookingStats,
      totalDisputes,
    };
  }

  async updateProfileImage(userId: string, url: string): Promise<string> {
    const user = await getEntityOrThrow(this._userRepository, userId, USER.NOT_FOUND);

    const profileImage = extractKeyFromUrl(url);
    const updatedUser = await this._userRepository.update(user.id, { profileImage });
    if (!updatedUser?.profileImage) {
      throw new CustomError(USER.UPDATE_FAILED, HTTPSTATUS.BAD_REQUEST);
    }
    if (user.profileImage?.includes("private/user/profiles")) {
      void this._s3Service.deleteFile(user.profileImage);
    }
    return await this._s3Service.generateSignedUrl(updatedUser.profileImage);
  }

  async updateProfile(
    userId: string,
    data: UserProfileRequestDto
  ): Promise<UserProfileResponseDto> {
    const user = await this._userRepository.findOneAndUpdate(
      {
        _id: new Types.ObjectId(userId),
        isBlocked: false,
      },
      data
    );
    if (!user) {
      throw new CustomError(USER.UPDATE_FAILED, HTTPSTATUS.BAD_REQUEST);
    }
    return UserProfileResponseDto.fromEntity(user, this._s3Service);
  }

  async confirmOtpAndUpdateContact(
    userId: string,
    data: VerifyOtpDto
  ): Promise<{ user: UserProfileResponseDto; message: string }> {
    const { contact, otp, type } = data;
    const storedData = await this._redisService.get(`otp:${contact}`);
    if (!storedData) {
      throw new CustomError(AUTH.OTP_EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }
    const { otp: storedOTP } = JSON.parse(storedData);
    if (otp !== storedOTP) {
      throw new CustomError(AUTH.INVALID_OTP, HTTPSTATUS.BAD_REQUEST);
    }
    let updatedUser: IUser | null = null;
    if (type === "email") {
      updatedUser = await this._userRepository.findByIdAndUpdate(userId, { email: contact });
    } else {
      updatedUser = await this._userRepository.findByIdAndUpdate(userId, { phone: contact });
    }
    if (!updatedUser) {
      throw new CustomError(USER.UPDATE_FAILED, HTTPSTATUS.BAD_REQUEST);
    }
    return {
      user: await UserProfileResponseDto.fromEntity(updatedUser, this._s3Service),
      message: `${type} Updated successfully`,
    };
  }

  async updatePassword(userId: string, passwordDto: ChangePasswordDto): Promise<boolean> {
    const { currentPassword, newPassword } = passwordDto;
    const user = await getEntityOrThrow(this._userRepository, userId, USER.NOT_FOUND);
    const isPasswordValid = await compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new CustomError(AUTH.INVALID_PASSWORD, HTTPSTATUS.BAD_REQUEST);
    }
    const hashedPassword = await hash(newPassword, 10);
    await this._userRepository.findByIdAndUpdate(userId, { password: hashedPassword });
    return true;
  }

  async requestChangePhone(userId: string, phone: string): Promise<boolean> {
    const user = await getEntityOrThrow(this._userRepository, userId, USER.NOT_FOUND);
    if (!validator.isMobilePhone(phone)) {
      throw new CustomError(AUTH.INVALID_INPUT, HTTPSTATUS.BAD_REQUEST);
    }
    const existing = await this._userRepository.findOne({ phone, _id: { $ne: userId } });
    if (existing) {
      throw new CustomError(AUTH.PHONE_BELONG_ANOTHER, HTTPSTATUS.BAD_REQUEST);
    }
    const otp = this._otpService.generateOTP();
    await Promise.all([
      this._redisService.setWithTTL(
        `otp:${phone}`,
        JSON.stringify({ otp, phone }),
        EMAIL_OTP_EXPIRY
      ),
      this._emailService.sendEmail(user.email, otp),
    ]);
    return true;
  }

  async requestChangeEmail(userId: string, email: string): Promise<boolean> {
    if (!validator.isEmail(email)) {
      throw new CustomError(EMAIL.INVALID, HTTPSTATUS.BAD_REQUEST);
    }
    const existing = await this._userRepository.findByEmail(email);
    if (existing && existing._id.toString() !== userId) {
      throw new CustomError(EMAIL.BELONG_ANOTHER, HTTPSTATUS.BAD_REQUEST);
    }
    const otp = this._otpService.generateOTP();
    await Promise.all([
      this._redisService.setWithTTL(
        REDIS_KEYS.AUTH.OTP(email),
        JSON.stringify({ email, otp }),
        EMAIL_OTP_EXPIRY
      ),
      this._emailService.sendEmail(email, otp),
    ]);
    return true;
  }

  async resendOtp(userId: string, type: "email" | "phone", value: string): Promise<boolean> {
    const user = await getEntityOrThrow(this._userRepository, userId, USER.NOT_FOUND);
    const existingData = await this._redisService.get(REDIS_KEYS.AUTH.OTP(value));
    if (!existingData) {
      throw new CustomError(AUTH.OTP_EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }
    const newOtp = this._otpService.generateOTP();

    await this._redisService.setWithTTL(
      REDIS_KEYS.AUTH.OTP(value),
      JSON.stringify({ otp: newOtp, type: value }),
      EMAIL_OTP_EXPIRY
    );

    if (type === "email") {
      if (!validator.isEmail(value)) {
        throw new CustomError(EMAIL.INVALID, HTTPSTATUS.BAD_REQUEST);
      }
      await this._emailService.sendEmail(value, newOtp);
    } else if (type === "phone") {
      if (!validator.isMobilePhone(value)) {
        throw new CustomError(AUTH.INVALID_INPUT, HTTPSTATUS.BAD_REQUEST);
      }
      await this._emailService.sendEmail(user.email, newOtp);
    }
    return true;
  }
}
