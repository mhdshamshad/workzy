import { Router } from "express";

import { ROLE } from "@/constants";
import { IWalletController } from "@/core/interfaces/controllers/IWalletController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import { authenticate } from "@/middlewares/auth.middleware";

const router = Router();
const controller = container.get<IWalletController>(TYPES.WalletController);

router.get("/", authenticate([ROLE.WORKER]), controller.getWallet);
router.get("/transactions", authenticate([ROLE.WORKER]), controller.getTransactions);

export default router;
