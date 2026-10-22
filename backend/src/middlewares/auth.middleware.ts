import { NextFunction, Request, Response } from "express";

import logger from "@/config/logger";
import redisClient from "@/config/redisClient";
import { AUTH, HTTPSTATUS, REDIS_KEYS, Role, USER } from "@/constants";
import { verifyAccessToken, verifyRefreshToken } from "@/utils/auth/jwt.util";
import CustomError from "@/utils/customError";

export const validateRefreshToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new CustomError(AUTH.NO_REFRESH_TOKEN, HTTPSTATUS.UNAUTHORIZED));
    }
    const decoded = verifyRefreshToken(token);

    if (redisClient.isOpen && decoded.user?.id && decoded.iat) {
      const loggedOutAt = await redisClient.get(
        REDIS_KEYS.AUTH.USER_LOGGED_OUT_AT(decoded.user.id)
      );
      if (loggedOutAt && decoded.iat < Number(loggedOutAt)) {
        return next(new CustomError(AUTH.NO_REFRESH_TOKEN, HTTPSTATUS.UNAUTHORIZED));
      }
    }

    req.user = {
      id: decoded.user.id,
      role: decoded.user.role,
    };
    next();
  } catch {
    return next(new CustomError(AUTH.NO_REFRESH_TOKEN, HTTPSTATUS.UNAUTHORIZED));
  }
};

export const authenticate = (roles: Array<Role>) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return next(new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED));
      }

      const decoded = verifyAccessToken(token);

      if (redisClient.isOpen) {
        const isBlacklisted = await redisClient.get(REDIS_KEYS.AUTH.BLACKLISTED_TOKEN(token));
        if (isBlacklisted) {
          return next(new CustomError(AUTH.TOKEN_INVALID, HTTPSTATUS.UNAUTHORIZED));
        }

        if (decoded.id && decoded.iat) {
          const loggedOutAt = await redisClient.get(REDIS_KEYS.AUTH.USER_LOGGED_OUT_AT(decoded.id));
          if (loggedOutAt && decoded.iat < Number(loggedOutAt)) {
            return next(new CustomError(AUTH.TOKEN_INVALID, HTTPSTATUS.UNAUTHORIZED));
          }
        }

        if (decoded.id) {
          const isBlocked = await redisClient.get(REDIS_KEYS.AUTH.BLOCKED_USER(decoded.id));
          if (isBlocked) {
            return next(new CustomError(USER.BLOCKED, HTTPSTATUS.FORBIDDEN));
          }
        }
      }

      req.user = decoded;

      if (roles.length && (!req.user || !roles.includes(req.user?.role))) {
        logger.debug(req.user.role, roles);
        return next(new CustomError(AUTH.ACCESS_DENIED, HTTPSTATUS.FORBIDDEN));
      }
      next();
    } catch {
      return next(new CustomError(AUTH.TOKEN_INVALID, HTTPSTATUS.UNAUTHORIZED));
    }
  };
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }
    const decoded = verifyAccessToken(token);

    if (redisClient.isOpen) {
      const isBlacklisted = await redisClient.get(REDIS_KEYS.AUTH.BLACKLISTED_TOKEN(token));
      if (isBlacklisted) {
        return next();
      }

      if (decoded.id && decoded.iat) {
        const loggedOutAt = await redisClient.get(REDIS_KEYS.AUTH.USER_LOGGED_OUT_AT(decoded.id));
        if (loggedOutAt && decoded.iat < Number(loggedOutAt)) {
          return next();
        }
      }

      if (decoded.id) {
        const isBlocked = await redisClient.get(REDIS_KEYS.AUTH.BLOCKED_USER(decoded.id));
        if (isBlocked) {
          return next();
        }
      }
    }

    req.user = decoded;

    return next();
  } catch (error) {
    logger.warn("Optional auth failed:", error);
    return next();
  }
};
