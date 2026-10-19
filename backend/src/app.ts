import "reflect-metadata";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";

import passport from "./config/passport";
import { CLIENT_URL, DUMMY_URL } from "./constants";
import { startCleanupJob } from "./jobs/cleanup-slots";
import { startQuoteExpiryJob } from "./jobs/quote-expiry";
import errorMiddleware from "./middlewares/errorMiddleware";
import { globalLimiter } from "./middlewares/rateLimit.middleware";
import apiRouter from "./routes";
import webhookRouter from "./routes/webhook.routes";

const app = express();

const allowedOrigins = [CLIENT_URL, DUMMY_URL, "http://13.204.5.195:5173"].filter(
  Boolean
) as string[];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use("/api/webhook", express.raw({ type: "*/*" }), webhookRouter);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use(compression());
app.use(cors(corsOptions));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});
app.use(cookieParser());
app.use(passport.initialize());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", globalLimiter, apiRouter);

app.use(errorMiddleware);

startQuoteExpiryJob();
startCleanupJob();

export default app;
