import type { AdminPayoutListQuery, PayoutListQuery } from '@/types/payout';

export const payoutKeys = {
  all: ['payout'] as const,
  detail: (id: string) => ['payout', id] as const,
  lists: (filters?: Omit<PayoutListQuery, 'limit' | 'cursor'>) =>
    [...payoutKeys.all, 'list', filters] as const,
  adminLists: (filters?: Omit<AdminPayoutListQuery, 'limit' | 'cursor'>) =>
    [...payoutKeys.all, 'admin-list', filters] as const,
  stats: ['admin', 'payouts', 'all'] as const,
};
