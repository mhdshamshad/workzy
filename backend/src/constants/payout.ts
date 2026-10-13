export const PAYOUT_METHOD = {
  BANK: "bank",
  UPI: "upi",
} as const;
export type PayoutMethod = (typeof PAYOUT_METHOD)[keyof typeof PAYOUT_METHOD];

export const PAYOUT_METHOD_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;
export type PayoutMethodStatus = (typeof PAYOUT_METHOD_STATUS)[keyof typeof PAYOUT_METHOD_STATUS];

export const WALLET_PAYOUT_STATUS = {
  NOT_CONFIGURED: "not_configured",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;
export type WalletPayoutStatus = (typeof WALLET_PAYOUT_STATUS)[keyof typeof WALLET_PAYOUT_STATUS];

export const PAYOUT_REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type PayoutRequestStatus =
  (typeof PAYOUT_REQUEST_STATUS)[keyof typeof PAYOUT_REQUEST_STATUS];

export const WALLET_TRANSACTION_TYPE = {
  CREDIT: "credit",
  DEBIT: "debit",
} as const;
export type WalletTransactionType =
  (typeof WALLET_TRANSACTION_TYPE)[keyof typeof WALLET_TRANSACTION_TYPE];

export const WALLET_TRANSACTION_CATEGORY = {
  EARNING: "earning",
  PAYOUT: "payout",
  ADJUSTMENT: "adjustment", // extra charges
} as const;
export type WalletTransactionCategory =
  (typeof WALLET_TRANSACTION_CATEGORY)[keyof typeof WALLET_TRANSACTION_CATEGORY];

export const MIN_PAYOUT_AMOUNT = 500;
