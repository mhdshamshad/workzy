import { compare, hash } from "bcryptjs";
import { plainToInstance } from "class-transformer";
import { inject, injectable } from "inversify";

import { AUTH, HTTPSTATUS, ROLE, Role, USER, WORKER_STATUS } from "@/constants";
import { REDIS_KEYS } from "@/constants/redis";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IAuthService } from "@/core/interfaces/services/IAuthService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { IWorkerService } from "@/core/interfaces/services/IWorkerService";
import { TYPES } from "@/di/types";
import { LoginRequestDTO, RegisterRequestDTO } from "@/dtos/requests/auth.dto";
import { LoginResponseDto, RegisterResponseDTO } from "@/dtos/responses/auth.dto";
import { IUser } from "@/types/user/user.entity";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.WorkerService) private _workerService: IWorkerService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}

  async findUserByEmail(email: string): Promise<boolean> {
    const user = await this._userRepository.findByEmail(email);
    return !!user;
  }

  async register(registerDto: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    const { name, email, password } = registerDto;
    const hashedPassword = await hash(password, 10);

    const user = await this._userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const userData = plainToInstance(RegisterResponseDTO, user, {
      excludeExtraneousValues: true,
    });
    await this._redisService.delete(REDIS_KEYS.AUTH.OTP(email));

    return userData;
  }

  async login(data: LoginRequestDTO): Promise<LoginResponseDto> {
    const { email, password } = data;

    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError(USER.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    if (user.isBlocked) {
      throw new CustomError(USER.BLOCKED, HTTPSTATUS.FORBIDDEN);
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError(AUTH.INVALID_CREDENTIALS, HTTPSTATUS.BAD_REQUEST);
    }

    const userObj = user.toObject();

    if (user.role === ROLE.WORKER) {
      const worker = await this._workerService.getWorkerByUserId(user._id);
      if (worker) {
        const { _id, displayName, profileImage } = worker;
        userObj.workerData = {
          _id: _id.toString(),
          displayName,
          profileImage,
        };
      }
    }

    return await LoginResponseDto.fromEntity(userObj, this._s3Service);
  }

  async isUserBlocked(userId: string): Promise<boolean> {
    const user = await getEntityOrThrow(this._userRepository, userId, USER.NOT_FOUND);
    return user.isBlocked || false;
  }

  async getUserByRoleAndId(role: Role, id: string): Promise<IUser | null> {
    return this._userRepository.getUserByRoleAndId(role, id);
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const user = await this._userRepository.findOne({ email });
    if (!user) {
      throw new CustomError(USER.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    const hashedPassword = await hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await this._redisService.delete(REDIS_KEYS.AUTH.FORGOT_PASSWORD(email));
  }

  async handleGoogleUser(googleData: {
    googleId: string;
    email: string;
    name: string;
    profile: string;
  }): Promise<LoginResponseDto> {
    let user = await this._userRepository.findByGoogleId(googleData.googleId);

    if (!user) {
      const dummyPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await hash(dummyPassword, 10);

      user = await this._userRepository.create({
        name: googleData.name,
        googleId: googleData.googleId,
        email: googleData.email,
        profileImage: googleData.profile,
        password: hashedPassword,
        role: "user",
      });
    }

    const userObj = user.toObject();

    if (user.role === ROLE.WORKER) {
      const worker = await this._workerService.getWorkerByUserId(user._id);
      if (worker) {
        const { _id, displayName, profileImage } = worker;
        userObj.workerData = {
          _id: _id.toString(),
          displayName,
          profileImage,
        };
      }
    }
    return await LoginResponseDto.fromEntity(userObj, this._s3Service);
  }

  async getUserInfo(userId: string, role: Role): Promise<LoginResponseDto | null> {
    const [user, worker] = await Promise.all([
      this._userRepository.findById(userId),
      this._workerService.getWorkerByUserId(userId),
    ]);
    if (!user) return null;
    const userObj = {
      ...user.toObject(),
      workerData:
        worker?.status === WORKER_STATUS.VERIFIED
          ? {
              _id: worker._id,
              displayName: worker.displayName,
              profileImage: worker.profileImage,
            }
          : null,
      role,
    };

    return LoginResponseDto.fromEntity(userObj, this._s3Service);
  }
}
