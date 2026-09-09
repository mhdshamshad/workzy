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
