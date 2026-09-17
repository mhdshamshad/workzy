import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { inject, injectable } from "inversify";
import { Profile } from "passport";
import validator from "validator";

import logger from "@/config/logger";
import { AUTH, CLIENT_URL, EMAIL, HTTPSTATUS, ROLE, Role, USER, WORKER } from "@/constants";
import { REDIS_KEYS } from "@/constants/redis";
import { IAuthController } from "@/core/interfaces/controllers/IAuthController";
import { IAuthService } from "@/core/interfaces/services/IAuthService";
import { IEmailService } from "@/core/interfaces/services/IEmailService";
import { IOTPService } from "@/core/interfaces/services/IOTPService";
import { IPresenceService } from "@/core/interfaces/services/IPresenceService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { ITokenService } from "@/core/interfaces/services/ITokenService";
import { IWorkerService } from "@/core/interfaces/services/IWorkerService";
import { AccessTokenPayload } from "@/core/types/global/jwt";
import { TYPES } from "@/di/types";
import { LoginRequestDTO, RegisterRequestDTO } from "@/dtos/requests/auth.dto";
import { ApiResponse } from "@/utils/apiResponse";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "@/utils/auth/cookieUtils";
import { generateAccessToken, verifyRefreshToken } from "@/utils/auth/jwt.util";
import CustomError from "@/utils/customError";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(TYPES.AuthService) private _authService: IAuthService,
    @inject(TYPES.OTPService) private _otpService: IOTPService,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.TokenService) private _tokenService: ITokenService,
    @inject(TYPES.WorkerService) private _workerService: IWorkerService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.PresenceService) private _presenceService: IPresenceService,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}

  // Register a new user
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userData = req.body as RegisterRequestDTO;

    const existingUser = await this._authService.findUserByEmail(userData.email);
    if (existingUser) {
      throw new CustomError(USER.EXISTS, HTTPSTATUS.BAD_REQUEST);
    }

    const otp = this._otpService.generateOTP();

    await this._emailService.sendOtpEmail(userData, otp);

    logger.info(`OTP sent to user: ${userData.email}`);

    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.OTP_SENT));
  });

  // Verify OTP and complete registration
  verifyOTP = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    const userData = await this._otpService.verifyAndRetrieveUser(email, otp);

    const user = await this._authService.register(userData);

    setRefreshTokenCookie(res, { id: user.id, role: user.role as Role });

    const accessToken = generateAccessToken({ ...user });

    res.status(HTTPSTATUS.CREATED).json(new ApiResponse({ user, accessToken }, AUTH.LOGIN_SUCCESS));
  });

  resendOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      throw new CustomError(EMAIL.INVALID, HTTPSTATUS.BAD_REQUEST);
    }

    await this._otpService.resendOtp(email);

    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.OTP_RESENT));
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this._authService.login(req.body as LoginRequestDTO);
    setRefreshTokenCookie(res, { id: user.id.toString(), role: user.role as Role });

    const accessToken = generateAccessToken({
      id: user.id.toString(),
      role: user.role as Role,
      workerId: user.worker?.id,
    });
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ accessToken, user }, AUTH.LOGIN_SUCCESS));
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      try {
        const decodedToken = verifyRefreshToken(refreshToken);
        if (decodedToken?.user?.id) {
          const userId = decodedToken.user.id;
          await this._presenceService.forceOffline(userId);
          if (decodedToken.user.role === ROLE.WORKER) {
            const worker = await this._workerService.getWorkerByUserId(userId);
            if (worker) {
              await this._presenceService.forceOffline(worker._id.toString());
            }
          }
        }
      } catch (err) {
        logger.error("Error clearing presence during logout:", err);
      }
    }
    await clearRefreshTokenCookie(res);
    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.LOGOUT_SUCCESS));
  });

  refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new CustomError(AUTH.NO_REFRESH_TOKEN, HTTPSTATUS.UNAUTHORIZED);
    }

    const decodedToken = verifyRefreshToken(refreshToken);
    if (!decodedToken) {
      clearRefreshTokenCookie(res);
      throw new CustomError(AUTH.INVALID_TOKEN, HTTPSTATUS.FORBIDDEN);
    }
    const userId = decodedToken.user.id;
    const role = decodedToken.user.role;

    const isBlocked = await this._redisService.get(REDIS_KEYS.AUTH.BLOCKED_USER(userId));
    if (isBlocked) {
      clearRefreshTokenCookie(res);
      res.status(HTTPSTATUS.FORBIDDEN).json({ success: false, message: USER.BLOCKED });
      return;
    }
    const user = await this._authService.getUserInfo(userId, role);

    if (!user) {
      clearRefreshTokenCookie(res);
      throw new CustomError(USER.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }

    const payload: AccessTokenPayload = {
      id: user.id.toString(),
      role: user.role,
    };

    if (role === ROLE.WORKER && !user.worker?.id) {
      clearRefreshTokenCookie(res);
      throw new CustomError(WORKER.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (user.worker?.id) {
      payload.workerId = user.worker.id;
    }
    const accessToken = generateAccessToken(payload);
    res.status(HTTPSTATUS.OK).json(new ApiResponse({ accessToken, user }));
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      throw new CustomError(EMAIL.INVALID, HTTPSTATUS.BAD_REQUEST);
    }

    const user = await this._authService.findUserByEmail(email);
    if (!user) {
      throw new CustomError(USER.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }

    await this._emailService.sendResetEmailWithToken(email);

    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, AUTH.FORGOT_PASS_EMAIL_SENT));
  });

  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, token, password } = req.body;

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!password || !strongPasswordRegex.test(password)) {
      throw new CustomError(AUTH.WEAK_PASSWORD, HTTPSTATUS.BAD_REQUEST);
    }

    const isValid = await this._tokenService.validateToken(email, token);
    if (!isValid) {
      throw new CustomError(AUTH.TOKEN_EXPIRED, HTTPSTATUS.BAD_REQUEST);
    }

    await this._authService.updatePassword(email, password);

    res.status(HTTPSTATUS.OK).json(new ApiResponse(null, USER.PASSWORD_UPDATE_SUCCESS));
  });

  handleGoogleUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      return res.redirect(`${CLIENT_URL}/login`);
    }
    const googleProfile = req.user as unknown as Profile;

    const email = googleProfile.emails?.[0]?.value;
    if (!email) {
      throw new CustomError(AUTH.GOOGLE_NOT_PROVIDED, HTTPSTATUS.BAD_REQUEST);
    }
    const jsonData = (googleProfile as unknown as { _json?: { picture?: string } })._json;

    const user = await this._authService.handleGoogleUser({
      googleId: googleProfile.id,
      email,
      name: googleProfile.displayName,
      profile: jsonData?.picture || "",
    });
    const isBlocked = await this._redisService.get(REDIS_KEYS.AUTH.BLOCKED_USER(user.id));
    if (isBlocked) {
      return res.redirect(`${CLIENT_URL}/auth/google/callback?error=blocked`);
    }
    setRefreshTokenCookie(res, { id: user.id, role: user.role as Role });

    res.redirect(`${CLIENT_URL}/auth/google/callback`);
  });

  switchRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) {
      throw new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.UNAUTHORIZED);
    }
    const targetRole = role === ROLE.WORKER ? ROLE.USER : ROLE.WORKER;
    const user = await this._authService.getUserInfo(userId, targetRole);

    if (!user) {
      throw new CustomError(USER.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    setRefreshTokenCookie(res, { id: userId, role: targetRole });
    const payload: AccessTokenPayload = {
      id: userId,
      role: targetRole,
      workerId: user.worker?.id,
    };
    const accessToken = generateAccessToken(payload);
    res
      .status(HTTPSTATUS.OK)
      .json(new ApiResponse({ accessToken, user }, "Role switched successfully"));
  });
}
