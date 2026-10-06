import { Router } from "express";

import { IAdminPayoutController } from "@/core/interfaces/controllers/admin/IAdminPayoutController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import { ApprovePayoutDto, RejectPayoutDto } from "@/dtos/requests/payout.dto";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router();
const controller = container.get<IAdminPayoutController>(TYPES.AdminPayoutController);

router.get("/", controller.listPayouts);
router.get("/stats", controller.getPayoutStats);
router.post("/:payoutId/approve", validateDto(ApprovePayoutDto), controller.approvePayout);
router.post("/:payoutId/reject", validateDto(RejectPayoutDto), controller.rejectPayout);

router.patch("/:workerId/payout-settings/:method/verify", controller.verifyPayoutMethod);
router.patch("/:workerId/payout-settings/:method/reject", controller.rejectPayoutMethod);
export default router;
