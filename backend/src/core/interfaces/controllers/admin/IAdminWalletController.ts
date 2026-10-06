import { RequestHandler } from "express";

export interface IAdminWalletController {
  getWorkerWallet: RequestHandler;
  getWorkerTransactions: RequestHandler;
}
