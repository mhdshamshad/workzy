import { RequestHandler } from "express";

export interface IBookingDayController {
  checkInDay: RequestHandler;
  verifyDayOtp: RequestHandler;
  completeDay: RequestHandler;
  skipDay: RequestHandler;
}
