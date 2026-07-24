import { RequestHandler } from "express";

export interface IAdminWorkerController {
  listWorkers: RequestHandler;
  toggleStatus: RequestHandler;
  getWorkerStats: RequestHandler;
  reviewWorker: RequestHandler;
  reviewWorkerDocument: RequestHandler;
  getWorkerServices: RequestHandler;
  getWorkerServiceCategories: RequestHandler;
}
