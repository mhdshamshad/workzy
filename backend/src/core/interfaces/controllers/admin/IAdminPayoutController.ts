import { RequestHandler } from "express";

export interface IAdminPayoutController {
  listPayouts: RequestHandler;
  getPayoutStats: RequestHandler;
  approvePayout: RequestHandler;
  rejectPayout: RequestHandler;
  verifyPayoutMethod: RequestHandler;
  rejectPayoutMethod: RequestHandler;
}
