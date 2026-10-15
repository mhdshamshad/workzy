import { Router } from "express";

import { ROLE } from "@/constants";
import { IWorkerController } from "@/core/interfaces/controllers/IWorkerController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import { JoinUsDTO } from "@/dtos/requests/joinUs.dto";
import {
  WorkerDocumentUpdateDTO,
  WorkerDocumentUploadDTO,
} from "@/dtos/requests/worker-document.dto";
import { WorkerProfileRequestDto } from "@/dtos/requests/worker.profile.dto";
import { authenticate, optionalAuth } from "@/middlewares/auth.middleware";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router();

const workerController = container.get<IWorkerController>(TYPES.WorkerController);

router.post(
  "/joinUs",
  authenticate([ROLE.USER]),
  validateDto(JoinUsDTO),
  workerController.createWorkerProfile
);

router.patch(
  "/:workerId/reApply",
  authenticate([ROLE.WORKER, ROLE.USER]),
  validateDto(JoinUsDTO),
  workerController.reSubmitWorkerDocument
);
router.get("/service/:serviceId", optionalAuth, workerController.listPublicWorkers);

router.get("/details", authenticate([ROLE.WORKER]), workerController.getWorkerProfileDetails);
router.get("/me", authenticate([ROLE.USER, ROLE.WORKER]), workerController.getMyWorkerProfile);

router.get("/:workerId/details", workerController.getWorkerProfileDetailsById);

router.get("/:workerId", workerController.getWorkerProfile);

router.use(authenticate([ROLE.WORKER]));

router.get("/worker/dashboard", workerController.getWorkerDashboardAnalytics);

router.patch(
  "/profile",
  validateDto(WorkerProfileRequestDto),
  workerController.updateWorkerProfile
);
router.patch("/phone", workerController.updateWorkerPhone);
router.patch("/profile-url", workerController.updateProfileImage);

router.post("/documents", validateDto(WorkerDocumentUploadDTO), workerController.addWorkerDocument);
router.patch(
  "/documents/:documentId",
  validateDto(WorkerDocumentUpdateDTO),
  workerController.updateWorkerDocument
);

export default router;
