import { Router } from "express";

import { ROLE } from "@/constants";
import { IBookingController } from "@/core/interfaces/controllers/IBookingController";
import { container } from "@/di/container";
import { TYPES } from "@/di/types";
import {
  CancelBookingDTO,
  CompleteBookingDTO,
  CreatebookingDTO,
  ExtraChargeDTO,
  RejectBookingDTO,
  VerifyBookingOtpDTO,
  RequestRescheduleDto,
  RespondRescheduleDto,
  CancelRescheduleDto,
  CompleteReworkDTO,
  RequestReworkDTO,
  ScheduleReworkSlotDTO,
} from "@/dtos/requests/booking.dto";
import { authenticate } from "@/middlewares/auth.middleware";
import { bookingLimiter, otpVerifyLimiter } from "@/middlewares/rateLimit.middleware";
import { validateDto } from "@/middlewares/validate-dto.middleware";

import bookingDayRouter from "./booking-day.routes";

const router = Router();
const controller = container.get<IBookingController>(TYPES.BookingController);

router.get("/", authenticate([ROLE.ADMIN, ROLE.USER, ROLE.WORKER]), controller.getBookings);

router.post(
  "/",
  bookingLimiter,
  authenticate([ROLE.USER, ROLE.WORKER]),
  validateDto(CreatebookingDTO),
  controller.createBooking
);
router.get(
  "/:bookingId",
  authenticate([ROLE.ADMIN, ROLE.USER, ROLE.WORKER]),
  controller.getBookingById
);

router.patch("/:bookingId/accept", authenticate([ROLE.WORKER]), controller.acceptBooking);
router.use(authenticate([ROLE.USER, ROLE.WORKER]));

router.patch("/:bookingId/cancel", validateDto(CancelBookingDTO), controller.cancelBooking);
router.patch("/:bookingId/approve", controller.approveBooking);
router.patch("/:bookingId/extra-charge/pay", controller.payExtraCharge);
router.patch("/:bookingId/extra-charge/reject", controller.rejectExtraCharge);

router.patch(
  "/:bookingId/reject",
  authenticate([ROLE.WORKER]),
  validateDto(RejectBookingDTO),
  controller.rejectBooking
);
router.patch("/:bookingId/en-route", authenticate([ROLE.WORKER]), controller.markEnRoute);
router.patch("/:bookingId/reached", controller.markReached);
router.patch(
  "/:bookingId/start",
  otpVerifyLimiter,
  authenticate([ROLE.WORKER]),
  validateDto(VerifyBookingOtpDTO),
  controller.startJob
);
router.patch(
  "/:bookingId/complete",
  authenticate([ROLE.WORKER]),
  validateDto(CompleteBookingDTO),
  controller.completeJob
);

router.patch(
  "/:bookingId/extra-charge",
  authenticate([ROLE.WORKER]),
  validateDto(ExtraChargeDTO),
  controller.requestExtraCharge
);

// Reschedule Routes
router.patch(
  "/:bookingId/reschedule",
  validateDto(RequestRescheduleDto),
  controller.requestReschedule
);

router.patch(
  "/:bookingId/reschedule/respond",
  validateDto(RespondRescheduleDto),
  controller.respondReschedule
);

router.delete(
  "/:bookingId/reschedule",
  validateDto(CancelRescheduleDto),
  controller.cancelReschedule
);

router.post(
  "/:bookingId/rework/request",
  authenticate([ROLE.USER]),
  validateDto(RequestReworkDTO),
  controller.requestRework
);

router.post(
  "/:bookingId/rework/schedule-slot",
  authenticate([ROLE.WORKER]),
  validateDto(ScheduleReworkSlotDTO),
  controller.scheduleReworkSlot
);

router.put(
  "/:bookingId/rework/reschedule-slot",
  authenticate([ROLE.WORKER]),
  validateDto(ScheduleReworkSlotDTO),
  controller.rescheduleReworkSlot
);

router.post(
  "/:bookingId/rework/reschedule-slot",
  authenticate([ROLE.WORKER]),
  validateDto(ScheduleReworkSlotDTO),
  controller.rescheduleReworkSlot
);

router.post(
  "/:bookingId/rework/send-otp",
  authenticate([ROLE.WORKER]),
  controller.sendReworkCompletionOtp
);

router.post(
  "/:bookingId/rework/complete",
  otpVerifyLimiter,
  authenticate([ROLE.WORKER]),
  validateDto(CompleteReworkDTO),
  controller.completeRework
);

router.use("/:bookingId/day", bookingDayRouter);
export default router;
