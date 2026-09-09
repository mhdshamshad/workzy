import { Router } from "express";

import { ROLE } from "@/constants";
import { BookingDayController } from "@/controllers/booking-day.controller";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import { DayCompleteDTO, VerifyBookingOtpDTO } from "@/dtos/requests/booking.dto";
import { authenticate } from "@/middlewares/auth.middleware";
import { validateDto } from "@/middlewares/validate-dto.middleware";

const router = Router({ mergeParams: true });
const controller = container.get<BookingDayController>(TYPES.BookingDayController);

router.post("/:day/check-in", authenticate([ROLE.WORKER]), controller.checkInDay);

router.post(
  "/:day/verify-otp",
  authenticate([ROLE.WORKER]),
  validateDto(VerifyBookingOtpDTO),
  controller.verifyDayOtp
);

router.post(
  "/:day/complete",
  authenticate([ROLE.WORKER]),
  validateDto(DayCompleteDTO),
  controller.completeDay
);

router.post("/:day/skip", authenticate([ROLE.WORKER]), controller.skipDay);

export default router;
