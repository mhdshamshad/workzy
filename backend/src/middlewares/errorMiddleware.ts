import { NextFunction, Request, Response } from "express";

import logger from "@/config/logger";
import { SERVER } from "@/constants";
import CustomError from "@/utils/customError";

const errorMiddleware = (
  err: CustomError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof CustomError ? err.statusCode : 500;
  const message = err.message || SERVER.ERROR;

  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${req.method} ${req.path} - Server Error:`, err);
  } else if (statusCode !== 401) {
    logger.warn(`[${statusCode}] ${req.method} ${req.path} - ${message}`);
    console.log(err);
  }

  const response: {
    success: false;
    message: string;
    errors?: unknown;
  } = { success: false, message };

  if (err instanceof CustomError && err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

export default errorMiddleware;
