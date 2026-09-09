export const BOOKING_STATUS = {
  PENDING: "pending", // payment success, worker notified
  CONFIRMED: "confirmed", //worker accepted
  EN_ROUTE: "en_route", // worker heading to location ✦ from friend
  REACHED: "reached", // worker arrived
  IN_PROGRESS: "in_progress", // worker started job
  COMPLETED: "completed",
  APPROVED: "approved",
  SETTLED: "settled",
  CANCELLED: "cancelled", // cancelled before start
  REJECTED: "rejected", // worker rejected
  DISPUTED: "disputed", // user raised dispute
  EXPIRED: "expired",
} as const;

export const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUS);
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const UPCOMING_BOOKING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.EN_ROUTE,
  BOOKING_STATUS.REACHED,
  BOOKING_STATUS.IN_PROGRESS,
] as const;

export const BOOKING_TYPE = {
  INSTANT: "instant",
  PROJECT: "project",
} as const;
export type BookingType = (typeof BOOKING_TYPE)[keyof typeof BOOKING_TYPE];

export const BOOKING_DAY_STATUS = {
  PENDING: "pending",
  CHECKED_IN: "checked_in",
  COMPLETED: "completed",
  SKIPPED: "skipped",
} as const;
export type BookingDayStatus = (typeof BOOKING_DAY_STATUS)[keyof typeof BOOKING_DAY_STATUS];

export const PAYMENT_SCHEDULE_STATUS = {
  PENDING: "pending",
  HELD: "held",
  RELEASED: "released",
  REFUNDED: "refunded",
} as const;
export type PaymentScheduleStatus =
  (typeof PAYMENT_SCHEDULE_STATUS)[keyof typeof PAYMENT_SCHEDULE_STATUS];

export const PROJECT_BOOKING_STATUS_EXTRA = {
  SETTLED: "settled",
} as const;

export const ALLOWED_BOOKING_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled", "expired"],
  confirmed: ["en_route", "cancelled", "in_progress"],
  en_route: ["reached", "cancelled"],
  reached: ["in_progress"],
  in_progress: ["completed", "disputed"],
  completed: ["approved", "disputed"],
  approved: ["settled"],
  settled: [],
  disputed: ["cancelled", "approved", "settled"],
  cancelled: [],
  expired: [],
  rejected: [],
};

export const BOOKING_DAY_TRANSITIONS: Record<BookingDayStatus, BookingDayStatus[]> = {
  pending: ["checked_in", "skipped"],
  checked_in: ["completed", "skipped"],
  completed: [],
  skipped: ["pending"],
};

export const BOOKING_PAYMENT_STATUS = {
  PENDING: "pending",
  HELD: "held",
  RELEASED: "released",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export const BOOKING_PAYMENT_STATUS_VALUES = Object.values(BOOKING_PAYMENT_STATUS);

export type BookingPaymentStatus =
  (typeof BOOKING_PAYMENT_STATUS)[keyof typeof BOOKING_PAYMENT_STATUS];

export const SLOT_STATUS = {
  RESERVED: "reserved",
  BOOKED: "booked",
} as const;
export const SLOT_STATUS_VALUES = Object.values(SLOT_STATUS);

export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];

export const QUOTE_STATUS = {
  PENDING: "pending",
  REJECTED: "rejected",
  ACCEPTED: "accepted",
  EXPIRED: "expired",
} as const;

export const QUOTE_STATUS_VALUES = Object.values(QUOTE_STATUS);

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];
