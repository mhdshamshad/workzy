export interface IRedisService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  setWithTTL(key: string, value: string, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clearPattern(pattern: string): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
  setIfNotExists(key: string, value: string, ttlSeconds: number): Promise<boolean>;
  incr(key: string, ttlSeconds?: number): Promise<number>;
  hIncrBy(key: string, field: string, incrementBy: number): Promise<number>;
  hSet(key: string, field: string, value: string): Promise<void>;
  hGet(key: string, field: string): Promise<string | null>;
  hDel(key: string, field: string): Promise<void>;
  hGetAll(key: string): Promise<Record<string, string>>;
}
