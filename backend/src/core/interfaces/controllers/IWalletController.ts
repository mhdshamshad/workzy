import { RequestHandler } from "express";

export interface IWalletController {
  getWallet: RequestHandler;
  getTransactions: RequestHandler;
}
