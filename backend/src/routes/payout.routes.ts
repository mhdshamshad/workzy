import { Router } from "express";

import { ROLE } from "@/constants";
import { IPayoutController } from "@/core/interfaces/controllers/IPayoutController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import {
  BankDetailsDto,
  RequestPayoutDto,
  setPrimaryMethodDto,
  UpiDetailsDto,
} from "@/dtos/requests/payout.dto";
import { authenticate } from "@/middlewares/auth.middleware";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router();
const controller = container.get<IPayoutController>(TYPES.PayoutController);

router.use(authenticate([ROLE.WORKER]));

router.get("/", controller.getPayoutRequests);
router.post("/request", validateDto(RequestPayoutDto), controller.requestPayout);

router.put("/settings/bank", validateDto(BankDetailsDto), controller.updateBankDetails);
router.put("/settings/upi", validateDto(UpiDetailsDto), controller.updateUpiDetails);
router.patch("/settings/primary", validateDto(setPrimaryMethodDto), controller.setPrimaryMethod);
router.delete("/settings/bank", controller.removeBankDetails);
router.delete("/settings/upi", controller.removeUpiDetails);

export default router;
