import { buildRoute } from './routeBuilder';
const booking = buildRoute('/booking');

export const BOOKING_API = {
  ROOT: booking('/'),
  BY_ID: (id: string) => booking(`/${id}`),
  BY_USER: booking('/user'),
  BY_WORKER: booking('/worker'),

  CANCEL: (id: string) => booking(`/${id}/cancel`),
  ACCEPT: (id: string) => booking(`/${id}/accept`),
  REJECT: (id: string) => booking(`/${id}/reject`),
  START: (id: string) => booking(`/${id}/start`),
  EN_ROUTE: (id: string) => booking(`/${id}/en-route`),
  MARK_REACHED: (id: string) => booking(`/${id}/reached`),
  COMPLETE: (id: string) => booking(`/${id}/complete`),
  APPROVE: (id: string) => booking(`/${id}/approve`),

  DISPUTE: (id: string) => booking(`/${id}/dispute`),
  EVIDENCE: (id: string) => booking(`/${id}/evidence`),

  EXTRA_CHARGE: (id: string) => booking(`/${id}/extra-charge`),
  EXTRA_CHARGE_PAY: (id: string) => booking(`/${id}/extra-charge/pay`),
  EXTRA_CHARGE_REJECT: (id: string) => booking(`/${id}/extra-charge/reject`),

  RESCHEDULE: (id: string) => booking(`/${id}/reschedule`),
  RESCHEDULE_RESPOND: (id: string) => booking(`/${id}/reschedule/respond`),
  DAY_CHECK_IN: (id: string, dayIndex: number) => booking(`/${id}/day/${dayIndex}/check-in`),
  DAY_VERIFY_OTP: (id: string, dayIndex: number) => booking(`/${id}/day/${dayIndex}/verify-otp`),
  DAY_COMPLETE: (id: string, dayIndex: number) => booking(`/${id}/day/${dayIndex}/complete`),
  DAY_SKIP: (id: string, dayIndex: number) => booking(`/${id}/day/${dayIndex}/skip`),
} as const;
