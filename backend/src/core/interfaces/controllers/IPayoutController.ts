import { RequestHandler } from "express";

export interface IPayoutController {
  updateBankDetails: RequestHandler;
  updateUpiDetails: RequestHandler;
  setPrimaryMethod: RequestHandler;
  removeBankDetails: RequestHandler;
  removeUpiDetails: RequestHandler;

  requestPayout: RequestHandler;
  getPayoutRequests: RequestHandler;
}
