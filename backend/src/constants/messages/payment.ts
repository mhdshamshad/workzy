import { MIN_PAYOUT_AMOUNT } from "../payout";

export const PAYMENT = {
  WEBHOOK_SIGNATURE_MISSING: "Missing Stripe signature header.",
  WEBHOOK_SIGNATURE_INVALID: "Webhook signature verification failed.",

  PAYMENT_NOT_FOUND: "Payment record not found for this booking",
  PAYMENT_INTENT_MISSING: "No payment intent found to refund",
  REFUND_FAILED: "Refund failed.",
  WORKER_AMOUNT_MISSING: "Payment worker amount is missing",
};

export const PAYOUT_MESSAGES = {
  NOT_CONFIGURED: "Please add your bank or UPI details before requesting a payout.",
  BELOW_MINIMUM: `Minimum payout amount is ₹${MIN_PAYOUT_AMOUNT}.`,
  INSUFFICIENT_BALANCE: "Requested amount exceeds your available balance.",
  ALREADY_PENDING: "You already have a pending payout request.",
  REQUEST_NOT_FOUND: "Payout request not found.",
  ALREADY_PROCESSED: "This payout request has already been processed.",
  UTR_REQUIRED: "A UTR / reference number is required to approve a payout.",
  WALLET_NOT_FOUND: "Wallet not found for this worker.",
};
