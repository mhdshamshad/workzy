import { injectable } from "inversify";

import logger from "@/config/logger";
import redisClient from "@/config/redisClient";
import { REDIS } from "@/constants";
import { IRedisService } from "@/core/interfaces/services/IRedisService";

@injectable()
export class RedisService implements IRedisService {
  async get(key: string): Promise<string | null> {
    try {
      return await redisClient.get(key);
    } catch (error) {
      logger.error(REDIS.GET_ERROR(key), error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds !== undefined) {
        await redisClient.set(key, value, { EX: ttlSeconds });
      } else {
        await redisClient.set(key, value);
      }
    } catch (error) {
      logger.error(REDIS.SET_ERROR(key), error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.error(REDIS.DELETE_ERROR(key), error);
    }
  }
  async clearPattern(prefix: string): Promise<void> {
    try {
      await redisClient.del(prefix);
      const pattern = `${prefix}:*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      logger.info(REDIS.CLEAR_PATTERN_SUCCESS(prefix));
    } catch (error) {
      logger.error(REDIS.CLEAR_PATTERN_ERROR(prefix), error);
      console.log("error:", error);
    }
  }
  async deleteMany(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;
      await redisClient.del(keys);
    } catch (error) {
      logger.error(REDIS.DELETE_MANY_ERROR, error);
    }
  }
  async setIfNotExists(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await redisClient.set(key, value, { NX: true, EX: ttlSeconds });
      return result === "OK";
    } catch (error) {
      logger.error(REDIS.NX_SET_ERROR(key), error);
      return false;
    }
  }
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const count = await redisClient.incr(key);
      if (count === 1 && ttlSeconds !== undefined) {
        await redisClient.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      logger.error(REDIS.INCR_ERROR(key), error);
      return 0;
    }
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    try {
      await redisClient.hSet(key, field, value);
    } catch (error) {
      logger.error(REDIS.HSET_ERROR(key), error);
    }
  }

  /** automaticaly increments field on a hash key, creating both if missing. Returns the new value. */
  async hIncrBy(key: string, field: string, incrementBy: number): Promise<number> {
    try {
      return await redisClient.hIncrBy(key, field, incrementBy);
    } catch (error) {
      logger.error(REDIS.HINCRBY_ERROR(key), error);
      throw error;
    }
  }
  /** Reads one field from a hash. Returns null if the key or field doesn't exist. */
  async hGet(key: string, field: string): Promise<string | null> {
    try {
      const value = await redisClient.hGet(key, field);
      return value ?? null;
    } catch (error) {
      logger.error(REDIS.HGET_ERROR(key), error);
      return null;
    }
  }
  /** Removes one field from a hash. */
  async hDel(key: string, field: string): Promise<void> {
    try {
      await redisClient.hDel(key, field);
    } catch (error) {
      logger.error(REDIS.HDEL_ERROR(key), error);
    }
  }
  /** Returns the whole hash as a plain object (used sparingly — avoid on hot paths). */
  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await redisClient.hGetAll(key);
    } catch (error) {
      logger.error(REDIS.HGETALL_ERROR(key), error);
      return {};
    }
  }
}
