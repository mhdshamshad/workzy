import { Request, Response } from "express";
import { rateLimit, ipKeyGenerator, Store, Options } from "express-rate-limit";

import redisClient from "@/config/redisClient";
import { HTTPSTATUS } from "@/constants/httpStatusCodes";

class RedisRateLimitStore implements Store {
  prefix: string;
  windowMs: number = 60000;

  constructor(prefix: string) {
    this.prefix = `rl:${prefix}:`;
  }

  init(options: Options) {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const fullKey = `${this.prefix}${key}`;
    const ttlSeconds = Math.ceil(this.windowMs / 1000);

    const [totalHits, currentTtl] = (await redisClient
      .multi()
      .incr(fullKey)
      .ttl(fullKey)
      .exec()) as unknown as [number, number];

    if (totalHits === 1 || currentTtl === -1) {
      await redisClient.expire(fullKey, ttlSeconds);
    }

    const resetTime = new Date(Date.now() + (currentTtl > 0 ? currentTtl * 1000 : this.windowMs));

    return { totalHits, resetTime };
  }

  async decrement(key: string): Promise<void> {
    await redisClient.decr(`${this.prefix}${key}`);
  }

  async resetKey(key: string): Promise<void> {
    await redisClient.del(`${this.prefix}${key}`);
  }
}

const createRedisStore = (prefix: string) => new RedisRateLimitStore(prefix);

const createLimiterResponse = (message: string) => {
  return (_req: Request, res: Response) => {
    res.status(HTTPSTATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message,
    });
  };
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  validate: { xForwardedForHeader: false },
  store: createRedisStore("global"),
  handler: createLimiterResponse("Too many requests from this IP. Please try again later."),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  validate: { xForwardedForHeader: false },
  store: createRedisStore("auth"),
  handler: createLimiterResponse(
    "Too many authentication attempts. Please try again in 15 minutes."
  ),
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  keyGenerator: (req: Request) => {
    const email = req.body?.email;
    return typeof email === "string" && email.trim()
      ? `email:${email.toLowerCase().trim()}`
      : ipKeyGenerator(req.ip || "127.0.0.1");
  },
  store: createRedisStore("otp-verify"),
  handler: createLimiterResponse(
    "Too many failed OTP verification attempts. Please wait 10 minutes or request a new OTP."
  ),
});

export const otpResendLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false },
  keyGenerator: (req: Request) => {
    const email = req.body?.email;
    return typeof email === "string" && email.trim()
      ? `email:${email.toLowerCase().trim()}`
      : ipKeyGenerator(req.ip || "127.0.0.1");
  },
  store: createRedisStore("otp-resend"),
  handler: createLimiterResponse("Please wait 60 seconds before requesting another code."),
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  validate: { xForwardedForHeader: false },
  store: createRedisStore("booking"),
  handler: createLimiterResponse(
    "Booking rate limit exceeded. Please wait a moment before trying again."
  ),
});

export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  validate: { xForwardedForHeader: false },
  store: createRedisStore("upload"),
  handler: createLimiterResponse("Upload request limit reached. Please wait a few minutes."),
});
