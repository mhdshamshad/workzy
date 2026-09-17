import { Router } from "express";
import passport from "passport";

import { ROLE } from "@/constants";
import { IAuthController } from "@/core/interfaces/controllers/IAuthController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import { LoginRequestDTO, RegisterRequestDTO } from "@/dtos/requests/auth.dto";
import { authenticate, validateRefreshToken } from "@/middlewares/auth.middleware";
import {
  authLimiter,
  otpResendLimiter,
  otpVerifyLimiter,
} from "@/middlewares/rateLimit.middleware";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router();

const authController = container.get<IAuthController>(TYPES.AuthController);

router.post("/register", authLimiter, validateDto(RegisterRequestDTO), authController.register);
router.post("/verify-otp", otpVerifyLimiter, authController.verifyOTP);
router.post("/resend-otp", otpResendLimiter, authController.resendOtp);
router.post("/login", authLimiter, validateDto(LoginRequestDTO), authController.login);
router.post("/logout", authController.logout);

router.post("/forgot-password", otpResendLimiter, authController.forgotPassword);
router.post("/reset-password", authLimiter, authController.resetPassword);

router.post("/refresh-token", validateRefreshToken, authController.refreshToken);
router.post("/switch-role", authenticate([ROLE.USER, ROLE.WORKER]), authController.switchRole);

router.get(
  "/google",
  passport.authenticate("google", {
    session: false,
    scope: ["email", "profile"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  authController.handleGoogleUser
);

export default router;
