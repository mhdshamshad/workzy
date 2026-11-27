import "reflect-metadata";
import { plainToInstance, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from "class-validator";
import dotenv from "dotenv";

dotenv.config();

export enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

export class Env {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  PORT!: number;

  @IsNotEmpty()
  @IsString()
  SERVER_URL!: string;

  @IsNotEmpty()
  @IsString()
  CLIENT_URL!: string;

  @IsNotEmpty()
  @IsString()
  MONGO_URI!: string;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsNotEmpty()
  @IsString()
  ACCESS_TOKEN_SECRET!: string;

  @IsNotEmpty()
  @IsString()
  REFRESH_TOKEN_SECRET!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  ACCESS_EXPIRY_MINUTES!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  REFRESH_EXPIRY_DAYS!: number;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  EMAIL_OTP_EXPIRY_SECONDS!: number;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  REDIS_EXPIRY_SECONDS!: number;

  @IsNotEmpty()
  @IsString()
  NODEMAILER_EMAIL!: string;

  @IsNotEmpty()
  @IsString()
  NODEMAILER_PASSWORD!: string;

  @IsNotEmpty()
  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsNotEmpty()
  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsNotEmpty()
  @IsString()
  GOOGLE_CALLBACK_URL!: string;

  @IsNotEmpty()
  @IsString()
  AWS_REGION!: string;

  @IsNotEmpty()
  @IsString()
  AWS_S3_BUCKET!: string;

  @IsNotEmpty()
  @IsString()
  AWS_S3_ACCESSKEY!: string;

  @IsNotEmpty()
  @IsString()
  AWS_S3_SECRET!: string;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  AWS_S3_EXPIRY!: number;

  @IsNotEmpty()
  @IsString()
  STRIPE_SECRET_KEY!: string;

  @IsNotEmpty()
  @IsString()
  STRIPE_PUBLISHABLE_KEY!: string;

  @IsNotEmpty()
  @IsString()
  STRIPE_WEBHOOK_SECRET!: string;
}

export function validateEnv(config: Record<string, unknown>): Env {
  const env = plainToInstance(Env, config, { enableImplicitConversion: true });
  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n${errors.toString()}`);
  }
  return env;
}
