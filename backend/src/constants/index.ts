import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const SERVER_URL = process.env.SERVER_URL;
export const CLIENT_URL = process.env.CLIENT_URL;
export const DUMMY_URL = process.env.DUMMY_URL;
export const NODE_ENV = process.env.NODE_ENV;
export const MONGO_URI = process.env.MONGO_URI;
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
export const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

export const NODEMAILER_EMAIL = process.env.NODEMAILER_EMAIL;
export const NODEMAILER_PASSWORD = process.env.NODEMAILER_PASSWORD;

export const DEFAULT_IMAGE_URL = `https://workzy-app-storage.s3.ap-south-1.amazonaws.com/public/common/user/userprofile.avif`;
export const DEFAULT_WORKER_COVER_IMAGE = `https://workzy-app-storage.s3.ap-south-1.amazonaws.com/public/common/worker/profile_coverImage.webp`;
export const EMAIL_OTP_EXPIRY = Number(process.env.EMAIL_OTP_EXPIRY);
export const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS);
export const REDIS_EXPIRY = Number(process.env.REDIS_EXPIRY);

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL as string;

export const AWS_REGION = process.env.AWS_REGION!;
export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET!;
export const AWS_S3_ACCESSKEY = process.env.AWS_S3_ACCESSKEY!;
export const AWS_S3_SECRET = process.env.AWS_S3_SECRET!;
export const AWS_S3_EXPIRY = Number(process.env.AWS_S3_EXPIRY!);

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY as string;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;
export const STRIPE_CONNECT_WEBHOOK_SECRET = process.env.STRIPE_CONNECT_WEBHOOK_SECRET as string;

export * from "./httpStatusCodes";
export * from "./messages";
export * from "./roles";
export * from "./validation";
export * from "./upload";
export * from "./service";
export * from "./payment";
export * from "./booking";
export * from "./worker";
export * from "./notification";
export * from "./dispute";
export * from "./chat";
export * from "./redis";
export * from "./payout";
