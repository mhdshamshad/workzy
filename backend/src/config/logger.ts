import { createLogger, format, transports } from "winston";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

import { IS_PROD } from "@/constants";

const customColors = {
  error: "brightRed",
  warn: "brightYellow",
  info: "brightGreen",
  http: "brightCyan",
  debug: "brightBlue",
};

winston.addColors(customColors);
const logger = createLogger({
  level: IS_PROD ? "info" : "debug",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "info",
    }),
  ],
});

export default logger;
