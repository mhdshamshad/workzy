export const BOOKING_STEPS = {
  COUNT: 'count',
  DATE: 'date',
  SLOTS: 'slots',
  INSTRUCTIONS: 'instructions',
  REVIEW: 'review',
} as const;
export type BookingStep = (typeof BOOKING_STEPS)[keyof typeof BOOKING_STEPS];

export const STEP_LABELS: Record<BookingStep, string> = {
  count: 'Count',
  date: 'Date',
  slots: 'Time',
  instructions: 'Note',
  review: 'Review',
};

export const BOOKING_TYPE = {
  INSTANT: 'instant',
  PROJECT: 'project',
} as const;
export type BookingType = (typeof BOOKING_TYPE)[keyof typeof BOOKING_TYPE];

export const BOOKING_DAY_STATUS = {
  PENDING: 'pending',
  CHECKED_IN: 'checked_in',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const;
export type BookingDayStatus = (typeof BOOKING_DAY_STATUS)[keyof typeof BOOKING_DAY_STATUS];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  EN_ROUTE: 'en_route',
  REACHED: 'reached',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  DISPUTED: 'disputed',
  EXPIRED: 'expired',
} as const;

export const BOOKING_STATUS_VALUES = Object.values(BOOKING_STATUS);
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type BookingFilterStatus = BookingStatus | 'all' | 'upcoming';

export const BOOKING_PAYMENT_STATUS = {
  PENDING: 'pending',
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const;

export const BOOKING_PAYMENT_STATUS_VALUES = Object.values(BOOKING_PAYMENT_STATUS);

export type BookingPaymentStatus =
  (typeof BOOKING_PAYMENT_STATUS)[keyof typeof BOOKING_PAYMENT_STATUS];

export const BOOKING_EMPTY_MESSAGES: Record<BookingFilterStatus, { title: string; sub: string }> = {
  all: {
    title: 'No bookings yet',
    sub: 'Your service bookings will appear here.',
  },
  pending: {
    title: 'No pending bookings',
    sub: 'Newly created bookings will show up here.',
  },
  confirmed: {
    title: 'No confirmed bookings',
    sub: 'Bookings accepted by workers appear here.',
  },
  in_progress: {
    title: 'Nothing in progress',
    sub: 'Active jobs will be listed here.',
  },
  en_route: {
    title: 'Nothing in progress',
    sub: 'Active jobs will be listed here.',
  },
  reached: {
    title: 'Nothing in progress',
    sub: 'Active jobs will be listed here.',
  },
  completed: {
    title: 'No completed jobs',
    sub: 'Jobs awaiting your approval appear here.',
  },
  approved: {
    title: 'No approved jobs',
    sub: "Jobs you've signed off will appear here.",
  },
  cancelled: {
    title: 'No cancelled bookings',
    sub: 'Cancelled bookings are listed here.',
  },
  rejected: {
    title: 'No rejected bookings',
    sub: 'Bookings rejected by workers appear here.',
  },
  disputed: {
    title: 'No disputes',
    sub: 'Any raised disputes will appear here.',
  },
  expired: {
    title: 'No expired bookings',
    sub: 'Bookings that have passed their expiry will appear here.',
  },
  upcoming: {
    title: 'No upcoming bookings',
    sub: 'Confirmed future bookings appear here.',
  },
};

export const RESCHEDULE_STEPS = {
  DATE: 'date',
  SLOTS: 'slots',
  PREVIEW: 'preview',
} as const;
export type RescheduleStep = (typeof RESCHEDULE_STEPS)[keyof typeof RESCHEDULE_STEPS];
