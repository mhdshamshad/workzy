import type { BookingStatus } from '@/constants';

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; badge: string; accent: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    accent: 'border-l-amber-500',
    dot: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30',
    accent: 'border-l-blue-500',
    dot: 'bg-blue-500',
  },
  en_route: {
    label: 'En Route',
    badge: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
    accent: 'border-l-indigo-500',
    dot: 'bg-indigo-500',
  },
  reached: {
    label: 'Reached',
    badge: 'bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-500/30',
    accent: 'border-l-violet-500',
    dot: 'bg-violet-500',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
    accent: 'border-l-sky-500',
    dot: 'bg-sky-500',
  },
  completed: {
    label: 'Completed',
    badge: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    accent: 'border-l-emerald-500',
    dot: 'bg-emerald-500',
  },
  approved: {
    label: 'Approved',
    badge: 'bg-green-500/15 text-emerald-800 dark:text-emerald-300 border-green-500/30',
    accent: 'border-l-green-500',
    dot: 'bg-green-500',
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30',
    accent: 'border-l-slate-500',
    dot: 'bg-slate-500',
  },
  rejected: {
    label: 'Rejected',
    badge: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30',
    accent: 'border-l-red-500',
    dot: 'bg-red-500',
  },
  disputed: {
    label: 'Disputed',
    badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
    accent: 'border-l-orange-500',
    dot: 'bg-orange-500',
  },
  expired: {
    label: 'Expired',
    badge: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
    accent: 'border-l-zinc-500',
    dot: 'bg-zinc-500',
  },
};

export const PAYMENT_STATUS_META: Record<string, { label: string; badge: string }> = {
  pending: {
    label: 'Payment Pending',
    badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  held: {
    label: 'Payment Held',
    badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  released: {
    label: 'Payment Released',
    badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  refunded: {
    label: 'Refunded',
    badge: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
  },
  failed: {
    label: 'Payment Failed',
    badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
  },
} as const;
