import { Router } from "express";

import { IAdminWalletController } from "@/core/interfaces/controllers/admin/IAdminWalletController";
import { IAdminWorkerController } from "@/core/interfaces/controllers/admin/IAdminWorkerController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import {
  WorkerDocumentReviewRequestDTO,
  WorkerReviewRequestDTO,
} from "@/dtos/requests/admin/worker-review.dto";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router();

const controller = container.get<IAdminWorkerController>(TYPES.AdminWorkerController);
const walletController = container.get<IAdminWalletController>(TYPES.AdminWalletController);

router.get("/", controller.listWorkers);
router.get("/:workerId/stats", controller.getWorkerStats);

router.patch("/:workerId/status", controller.toggleStatus);
router.patch("/:workerId/review", validateDto(WorkerReviewRequestDTO), controller.reviewWorker);
router.patch(
  "/:workerId/documents/:documentId/review",
  validateDto(WorkerDocumentReviewRequestDTO),
  controller.reviewWorkerDocument
);
router.get("/:workerId/services", controller.getWorkerServices);
router.get("/:workerId/service-categories", controller.getWorkerServiceCategories);

router.get("/:workerId/wallet", walletController.getWorkerWallet);
router.get("/:workerId/wallet/transactions", walletController.getWorkerTransactions);

export default router;
