export const NOTIFICATION_TEMPLATES = {
  NEW_BOOKING_REQUEST: (serviceName: string) => ({
    type: "new_booking_request",
    heading: "New Booking",
    message: `You have received a new booking request for **${serviceName}**.`,
  }),
  BOOKING_ACCEPTED: (bookingId: string, workerName: string) => ({
    type: "booking_accepted",
    heading: "Booking Accepted",
    message: `Your booking **${bookingId}** has been accepted by **${workerName}**.`,
  }),
  BOOKING_REJECTED: (bookingId: string, workerName: string, reason: string) => ({
    type: "booking_rejected",
    heading: "Booking Rejected",
    message: `Your booking **${bookingId}** has been rejected by **${workerName}**. Reason: ${reason}`,
  }),
  BOOKING_CANCELLED: (bookingId: string) => ({
    type: "booking_cancelled",
    heading: "Booking Cancelled",
    message: `Customer has cancelled booking **${bookingId}**.`,
  }),
  WORKER_EN_ROUTE: (workerName: string, bookingId: string) => ({
    type: "worker_en_route",
    heading: "Worker on the way",
    message: `**${workerName}** is on their way to your location for the **${bookingId}** service. They will reach you soon!`,
  }),
  WORKER_REACHED: (workerName: string, bookingId: string) => ({
    type: "worker_reached",
    heading: "Worker Arrived",
    message: `**${workerName}** has arrived at your location for the **${bookingId}** service. Please provide the OTP to start the job.`,
  }),
  JOB_STARTED: (bookingId: string) => ({
    type: "job_started",
    heading: "Job Started",
    message: `Your job for booking **${bookingId}** has started.`,
  }),
  JOB_COMPLETED: (bookingId: string, workerName: string) => ({
    type: "job_completed",
    heading: "Job Completed",
    message: `Booking **${bookingId}** has been marked as completed by **${workerName}** successfully.`,
  }),
  JOB_APPROVED: (bookingId: string, userName: string) => ({
    type: "job_approved",
    heading: "Job Approved",
    message: `Booking **${bookingId}** has been approved by customer **${userName}**.`,
  }),
  EXTRA_CHARGE_REQUESTED: (amount: number, bookingId: string) => ({
    type: "extra_charge_requested",
    heading: "Extra Charge Requested",
    message: `Your worker has requested an extra charge of **₹${amount}** for booking **${bookingId}**.`,
  }),
  EXTRA_CHARGE_UPDATED: (amount: number, bookingId: string) => ({
    type: "extra_charge_updated",
    heading: "Extra Charge Updated",
    message: `Your worker has updated the extra charge request to **₹${amount}** for booking **${bookingId}**.`,
  }),
  QUOTE_SENT: (bookingId: string, amount: number) => ({
    type: "quote_sent",
    heading: "New Quote Received",
    message: `Your worker has sent a quote of **₹${amount}** for booking **${bookingId}**.`,
  }),
  QUOTE_ACCEPTED: (bookingId: string, amount: number) => ({
    type: "quote_accepted",
    heading: "Quote Accepted & Paid",
    message: `Customer has accepted and paid your quote of **₹${amount}** for booking **${bookingId}**.`,
  }),
  QUOTE_REJECTED: (bookingId: string) => ({
    type: "quote_rejected",
    heading: "Quote Rejected",
    message: `Customer has rejected your quote for booking **${bookingId}**.`,
  }),
  EXTRA_CHARGE_PAID: (bookingId: string, amount: number) => ({
    type: "extra_charge_paid",
    heading: "Extra Charge Paid",
    message: `Customer has paid the extra charge of **₹${amount}** for booking **${bookingId}**. The booking is now ready to be approved.`,
  }),
  EXTRA_CHARGE_REJECTED: (bookingId: string, amount: number) => ({
    type: "extra_charge_rejected",
    heading: "Extra Charge Rejected",
    message: `Customer has rejected the extra charge request of **₹${amount}** for booking **${bookingId}**.`,
  }),
  PAYMENT_FAILED: (bookingId: string) => ({
    type: "payment_failed",
    heading: "Payment Failed",
    message: `Your payment for booking **${bookingId}** has failed. Please check your payment method.`,
  }),
  BOOKING_DISPUTED: (bookingId: string) => ({
    type: "booking_disputed",
    heading: "Booking Disputed",
    message: `A dispute has been raised for booking **${bookingId}**. Our team is reviewing it.`,
  }),
  DISPUTE_UNDER_REVIEW_CUSTOMER: (bookingId: string) => ({
    type: "dispute_under_review",
    heading: "Dispute Under Review",
    message: `Your dispute for booking **${bookingId}** is now under review.`,
  }),
  DISPUTE_UNDER_REVIEW_WORKER: (bookingId: string) => ({
    type: "dispute_under_review",
    heading: "Dispute Under Review",
    message: `The dispute for booking **${bookingId}** is now under review.`,
  }),
  DISPUTE_DISMISSED_CUSTOMER: (bookingId: string) => ({
    type: "dispute_dismissed",
    heading: "Dispute Dismissed",
    message: `The dispute on booking **${bookingId}** has been dismissed by admin.`,
  }),
  DISPUTE_DISMISSED_WORKER: (bookingId: string) => ({
    type: "dispute_dismissed",
    heading: "Dispute Dismissed",
    message: `The dispute on booking **${bookingId}** has been dismissed by admin. Payment has been released.`,
  }),
  DISPUTE_RESOLVED_FULL_REFUND_CUSTOMER: (bookingId: string, total: number) => ({
    type: "dispute_resolved",
    heading: "Dispute Resolved",
    message: `Dispute resolved: Full refund of **₹${total}** was approved for booking **${bookingId}**.`,
  }),
  DISPUTE_RESOLVED_FULL_REFUND_WORKER: (bookingId: string) => ({
    type: "dispute_resolved",
    heading: "Dispute Resolved",
    message: `Dispute resolved: Full refund to customer was approved for booking **${bookingId}**.`,
  }),
  DISPUTE_RESOLVED_PARTIAL_REFUND_CUSTOMER: (bookingId: string, refundedAmount: number) => ({
    type: "dispute_resolved",
    heading: "Dispute Resolved",
    message: `Dispute resolved: Partial refund of **₹${refundedAmount}** was approved for booking **${bookingId}**.`,
  }),
  DISPUTE_RESOLVED_PARTIAL_REFUND_WORKER: (bookingId: string, refundedAmount: number) => ({
    type: "dispute_resolved",
    heading: "Dispute Resolved",
    message: `Dispute resolved: Partial refund of **₹${refundedAmount}** was approved for booking **${bookingId}**. The rest has been released.`,
  }),
  DISPUTE_RESOLVED_PAYOUT_WORKER_CUSTOMER: (bookingId: string) => ({
    type: "dispute_resolved",
    heading: "Dispute Resolved",
    message: `Dispute resolved: Full payout to worker was approved for booking **${bookingId}**.`,
  }),
  DISPUTE_RESOLVED_PAYOUT_WORKER_WORKER: (bookingId: string) => ({
    type: "dispute_resolved",
    heading: "Dispute Resolved",
    message: `Dispute resolved: Full payout was approved for booking **${bookingId}**.`,
  }),
  BOOKING_EXPIRED: (bookingId: string) => ({
    type: "booking_expired",
    heading: "Booking Expired",
    message: `Your booking **${bookingId}** has expired because it wasn't accepted in time. Your refund has been processed.`,
  }),
  WORKER_VERIFIED: () => ({
    type: "worker_verified",
    heading: "Profile Verified",
    message:
      "Your worker profile has been **verified** successfully. You can now start accepting jobs!",
  }),
  WORKER_REVISION: (reason: string) => ({
    type: "worker_revision",
    heading: "Revision Required",
    message: `Your profile needs revision. Reason: **${reason}**`,
  }),
  WORKER_REJECTED: (reason: string) => ({
    type: "worker_rejected",
    heading: "Profile Rejected",
    message: `Your profile verification has been **rejected**. Reason: **${reason}**`,
  }),
  ACCOUNT_BLOCKED: () => ({
    type: "account_blocked",
    heading: "Account Blocked",
    message: "Your account has been **blocked** by the administration.",
  }),
  ACCOUNT_UNBLOCKED: () => ({
    type: "account_unblocked",
    heading: "Account Unblocked",
    message: "Your account has been **unblocked** successfully. Welcome back!",
  }),
  RESCHEDULE_REQUESTED: (bookingId: string, requestedBy: string, dateStr: string) => ({
    type: "reschedule_requested",
    heading: "Reschedule Requested",
    message: `A reschedule request has been submitted for booking **${bookingId}** by the **${requestedBy}** for **${dateStr}**.`,
  }),
  RESCHEDULE_ACCEPTED: (bookingId: string, responderName: string, dateStr: string) => ({
    type: "reschedule_accepted",
    heading: "Reschedule Accepted",
    message: `Your reschedule request for booking **${bookingId}** has been accepted by **${responderName}**. New date: **${dateStr}**.`,
  }),
  RESCHEDULE_REJECTED: (bookingId: string, responderName: string) => ({
    type: "reschedule_rejected",
    heading: "Reschedule Rejected",
    message: `Your reschedule request for booking **${bookingId}** has been rejected by **${responderName}**.`,
  }),
  RESCHEDULE_CANCELLED: (bookingId: string) => ({
    type: "reschedule_cancelled",
    heading: "Reschedule Request Cancelled",
    message: `The pending reschedule request for booking **${bookingId}** has been cancelled.`,
  }),
  WORKER_DOCUMENT_VERIFIED: (documentType: string) => ({
    type: "worker_document_verified",
    heading: "Document Verified",
    message: `Your **${documentType}** has been **verified** successfully.`,
  }),
  WORKER_DOCUMENT_REJECTED: (documentType: string, reason: string) => ({
    type: "worker_document_rejected",
    heading: "Document Rejected",
    message: `Your **${documentType}** has been **rejected**. Reason: **${reason}**.`,
  }),
  WORKER_DOCUMENT_IN_REVIEW: (documentType: string) => ({
    type: "worker_document_in_review",
    heading: "Document In Review",
    message: `Your **${documentType}** is now **in review**.`,
  }),
};
