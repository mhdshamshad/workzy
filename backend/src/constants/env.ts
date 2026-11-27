import { Environment, validateEnv } from "@/config/env.validation";

const env = validateEnv(process.env);

export const PORT = env.PORT;
export const SERVER_URL = env.SERVER_URL;
export const CLIENT_URL = env.CLIENT_URL;

export const NODE_ENV = env.NODE_ENV;
export const IS_PROD = NODE_ENV === Environment.Production;
export const IS_DEV = NODE_ENV === Environment.Development;
export const IS_TEST = NODE_ENV === Environment.Test;
export const MONGO_URI = env.MONGO_URI;
export const REDIS_URL = env.REDIS_URL || "redis://localhost:6379";

export const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET;

export const ACCESS_EXPIRY_MINUTES = env.ACCESS_EXPIRY_MINUTES;
export const REFRESH_EXPIRY_DAYS = env.REFRESH_EXPIRY_DAYS;

export const ACCESS_TOKEN_EXPIRY = `${ACCESS_EXPIRY_MINUTES}m`;
export const REFRESH_TOKEN_EXPIRY = `${REFRESH_EXPIRY_DAYS}d`;

export const ACCESS_EXPIRY_SECONDS = ACCESS_EXPIRY_MINUTES * 60;
export const REFRESH_EXPIRY_SECONDS = REFRESH_EXPIRY_DAYS * 86400;

export const NODEMAILER_EMAIL = env.NODEMAILER_EMAIL;
export const NODEMAILER_PASSWORD = env.NODEMAILER_PASSWORD;
export const DEFAULT_WORKER_COVER_IMAGE = `https://workzy-app-storage.s3.ap-south-1.amazonaws.com/public/common/worker/profile_coverImage.webp`;

export const EMAIL_OTP_EXPIRY_SECONDS = env.EMAIL_OTP_EXPIRY_SECONDS;
export const REDIS_EXPIRY_SECONDS = env.REDIS_EXPIRY_SECONDS;

export const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = env.GOOGLE_CALLBACK_URL;

export const AWS_REGION = env.AWS_REGION;
export const AWS_S3_BUCKET = env.AWS_S3_BUCKET;
export const AWS_S3_ACCESSKEY = env.AWS_S3_ACCESSKEY;
export const AWS_S3_SECRET = env.AWS_S3_SECRET;
export const AWS_S3_EXPIRY = env.AWS_S3_EXPIRY;

export const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISHABLE_KEY = env.STRIPE_PUBLISHABLE_KEY;
export const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;
