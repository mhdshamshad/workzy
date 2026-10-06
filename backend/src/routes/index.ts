import { Router } from "express";

import adminRoutes from "./admin.routes";
import authRoute from "./auth.routes";
import bookingRoutes from "./booking.routes";
import categoryRoutes from "./category.routes";
import chatRoutes from "./chat.routes";
import disputeRoutes from "./dispute.routes";
import homeRoutes from "./home.routes";
import leaveRoutes from "./leave.routes";
import messageRoutes from "./message.routes";
import notificationRoutes from "./notification.routes";
import paymentRoutes from "./payment.routes";
import payoutRoutes from "./payout.routes";
import quoteRoutes from "./quote.routes";
import reviewRoutes from "./review.routes";
import serviceRoutes from "./service.routes";
import slotRoutes from "./slot.routes";
import uploadRoutes from "./upload.routes";
import userRoutes from "./user.routes";
import walletRoutes from "./wallet.routes";
import workerRoutes from "./worker.routes";

const router = Router();

router.use("/auth", authRoute);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/workers", workerRoutes);
router.use("/wallet", walletRoutes);
router.use("/payouts", payoutRoutes);
router.use("/upload", uploadRoutes);
router.use("/categories", categoryRoutes);
router.use("/services", serviceRoutes);
router.use("/home", homeRoutes);
router.use("/payments", paymentRoutes);
router.use("/slots", slotRoutes);
router.use("/booking", bookingRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messageRoutes);
router.use("/leave", leaveRoutes);
router.use("/reviews", reviewRoutes);
router.use("/quotes", quoteRoutes);
router.use("/notifications", notificationRoutes);
router.use("/disputes", disputeRoutes);

export default router;
