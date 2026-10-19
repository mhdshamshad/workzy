import { Router } from "express";
import passport from "passport";

import logger from "@/config/logger";
import { CLIENT_URL, ROLE } from "@/constants";
import { IAuthController } from "@/core/interfaces/controllers/IAuthController";
import { IToken } from "@/core/types/global/express";
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

import type { Profile } from "passport-google-oauth20";

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
  (req, res, next) => {
    try {
      passport.authenticate(
        "google",
        { session: false },
        (error: Error | null, user: Profile | false | undefined) => {
          if (error || !user) {
            if (error) logger.error("Google OAuth callback failed:", error);
            return res.redirect(`${CLIENT_URL}/auth/google/callback?error=google_auth_failed`);
          }

          req.user = user as unknown as IToken;
          next();
        }
      )(req, res, next);
    } catch (err: unknown) {
      logger.error("Exception during passport.authenticate:", err);
      return res.redirect(`${CLIENT_URL}/auth/google/callback?error=google_auth_failed`);
    }
  },
  authController.handleGoogleUser
);

export default router;
