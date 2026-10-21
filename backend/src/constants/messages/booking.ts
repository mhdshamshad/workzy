import { Role } from "../roles";

export const BOOKING_STATUS_MESSAGES = {
  PENDING: "Booking confirmed, waiting for worker to accept",
  CONFIRMED: "Worker accepted your booking",
  EN_ROUTE: "Worker is on the way",
  REACHED: "Status Marked as reached and waiting for OTP confirmation",
  IN_PROGRESS: "Job is in progress",
  COMPLETED: "Job completed",
  APPROVED: "Job approved and payment released",
  CANCELLED: "Booking cancelled",
  REJECTED: "Booking rejected by worker",
  DISPUTED: "Dispute raised",
  EXPIRED: "Booking expired — worker did not respond before the scheduled time.",
  RESCHEDULED: (role: Role, oldDate: string, newDate: string, reason?: string) =>
    `${role} requested a reschedule from ${oldDate} to ${newDate}. -${reason}`,
  RESCHEDULE_ACCEPTED: (name: string, date: string) =>
    `Reschedule request accepted by ${name}. Moved slot to ${date}`,
  RESCHEDULE_REJECTED: (name: string) => `Reschedule request rejected by ${name}`,
  REWORK_REQUESTED: (reason: string) => `Rework requested under 10-day warranty: ${reason}`,
  REWORK_SCHEDULED: (date: string, time: string) =>
    `Rework appointment scheduled for ${date} at ${time}`,
  REWORK_RESCHEDULED: (date: string, time: string) =>
    `Rework appointment rescheduled for ${date} at ${time}`,
  REWORK_COMPLETED: "Rework completed by worker",
  PROJECT_COMPLETED: "All project days completed — project marked as completed",
  DAY_COMPLETED: (dayIndex: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = dayIndex % 100;
    const ord = `${dayIndex}${s[(v - 20) % 10] || s[v] || s[0]}`;
    return `${ord} day of project is completed`;
  },
  DAY_SKIPPED: (dayIndex: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = dayIndex % 100;
    const ord = `${dayIndex}${s[(v - 20) % 10] || s[v] || s[0]}`;
    return `${ord} day of project is skipped$`;
  },
};

export const BOOKING = {
  NOT_FOUND: "Booking not found",
  INVALID_BOOKING_ID: " Invalid BookingId",
  PAYMENT_NOT_HELD: "Payment is not in held state",
  EXTRA_CHARGE_PENDING: "Resolve pending extra charge before approving",
  EXTRA_CHARGE_INVALID_STATUS: "Extra charge can only be requested during or after job",
  EXTRA_CHARGE_NOT_FOUND: "No pending extra charge found on this booking.",
  INVALID_OTP: "Invalid OTP. Please check with the user.",
  CANNOT_CANCEL: (s: string) => `Cannot cancel booking with status: ${s}`,

  CANNOT_ACCEPT:
    "This booking cannot be accepted. It may have already been confirmed, cancelled, expired, or payment is not yet received.",
  CANNOT_EN_ROUTE:
    "Booking cannot be marked en-route. It must be in confirmed status and assigned to you.",
  CANNOT_COMPLETE: "Booking cannot be completed. It must be in progress and assigned to you.",
  CANNOT_REACH: "This booking cannot be reached.",

  CANNOT_REJECT: (s: string) => `Cannot reject booking with status: ${s}`,
  CANNOT_START: (s: string) => `Cannot start job from status: ${s}`,
  CANNOT_APPROVE: (s: string) => `Cannot approve booking with status: ${s}`,
  UPDATE_FAILED: "Failed to process booking.",

  // Warranty & Rework
  WARRANTY_EXPIRED: "The 10-day rework warranty period for this booking has expired.",
  REWORK_NOT_ALLOWED: (s: string) =>
    `Rework can only be requested for completed or approved bookings. Current status: ${s}`,
  REWORK_NOT_APPLICABLE_CONSULTATION:
    "Rework warranty is not applicable for consultation services.",
  REWORK_ALREADY_ACTIVE: "A rework request is already active for this booking.",
  REWORK_ALREADY_FULFILLED:
    "Warranty rework has already been claimed and completed for this booking.",
  REWORK_NOT_REQUESTED: "No pending rework request found to schedule or complete.",
  REWORK_SLOT_REQUIRED: "Date, start time, and end time are required to schedule a rework slot.",
  REWORK_REQUESTED_SUCCESS: "Rework request submitted successfully under 10-day warranty.",
  REWORK_SCHEDULED_SUCCESS: "Rework appointment slot scheduled successfully.",
  REWORK_RESCHEDULED_SUCCESS: "Rework appointment slot rescheduled successfully.",
  REWORK_OTP_SENT_SUCCESS: "Verification OTP sent to customer successfully.",
  REWORK_COMPLETED_SUCCESS: "Rework marked as completed.",

  // Day-based booking messages
  DAY_INDEX_OUT_OF_RANGE: "Day index out of range for this project booking",
  DAY_ALREADY_CHECKED_IN: "This day has already been checked in",
  DAY_NOT_CHECKED_IN: "Day must be checked in before marking completed",
  DAY_OTP_MISMATCH: "Invalid OTP for this day's check-in",

  // Reschedule
  RESCHEDULE_ALREADY_PENDING: "A reschedule request is already pending for this booking.",
  RESCHEDULE_NOT_ALLOWED: (status: string, requestedBy: string) =>
    `Rescheduling is not allowed when the booking is "${status}". ${
      requestedBy === "user"
        ? "You can only reschedule pending or confirmed bookings."
        : "Workers can reschedule pending, confirmed, en-route, reached, or in-progress bookings."
    }`,
  RESCHEDULE_OLD_SLOT_MISMATCH: "The specified old slot does not belong to this booking.",
  RESCHEDULE_SLOT_PASSED: "Cannot reschedule a slot that has already passed.",
  RESCHEDULE_NO_PENDING: "No pending reschedule request found.",
  RESCHEDULE_OWN_REQUEST: "You cannot respond to your own reschedule request.",
  RESCHEDULE_CANCEL_NO_PENDING: "No pending reschedule request found to cancel.",
  RESCHEDULE_CANCEL_FAILED: "Error while cancelling reschedule.",
  RESCHEDULE_RESPONSE_SUCCESS: "Reschedule response handled successfully",
  RESCHEDULE_REQUESTED_SUCCESS: "Reschedule request submitted successfully.",
  RESCHEDULE_CANCELLED_SUCCESS: "Reschedule request cancelled successfully.",
  RESCHEDULE_NEW_SLOT_NOT_FOUND:
    "The new slot was not found or has expired. Please try requesting reschedule again.",
  RESCHEDULE_OLD_SLOT_NOT_FOUND:
    "The original slot could not be found. The booking may have been modified.",
};
