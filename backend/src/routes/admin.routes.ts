import { Router } from "express";

import { ROLE } from "@/constants";
import { IAdminController } from "@/core/interfaces/controllers/admin/IAdminController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import { authenticate } from "@/middlewares/auth.middleware";

import adminBookingRoutes from "./admin/admin.booking.routes";
import adminCategoryRoutes from "./admin/admin.categories.routes";
import adminPayoutRoutes from "./admin/admin.payout.routes";
import adminUserRoutes from "./admin/admin.users.routes";
import adminWorkerRoutes from "./admin/admin.workers.routes";

const router = Router();

const controller = container.get<IAdminController>(TYPES.AdminController);

router.use(authenticate([ROLE.ADMIN]));

router.use("/users", adminUserRoutes);
router.use("/workers", adminWorkerRoutes);
router.use("/categories", adminCategoryRoutes);
router.use("/booking", adminBookingRoutes);
router.use("/payouts", adminPayoutRoutes);
router.get("/dashboard", controller.getAdminDashboard);

export default router;
