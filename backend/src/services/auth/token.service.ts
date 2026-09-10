import crypto from "crypto";

import { inject, injectable } from "inversify";

import { REDIS_KEYS } from "@/constants/redis";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { ITokenService } from "@/core/interfaces/services/ITokenService";
import { TYPES } from "@/di/types";

@injectable()
export class TokenService implements ITokenService {
  constructor(@inject(TYPES.RedisService) private _redisService: IRedisService) {}

  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  async validateToken(email: string, token: string): Promise<boolean> {
    const storedToken = await this._redisService.get(REDIS_KEYS.AUTH.FORGOT_PASSWORD(email));
    return storedToken === token;
  }
}
