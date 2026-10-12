import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { walletKeys, payoutKeys } from '@/features/wallet';
import PayoutService from '@/services/payout.service';
import type { PayoutListQuery } from '@/types/payout';

const LIMIT = 6;

export function useWorkerPayouts(filters?: Omit<PayoutListQuery, 'limit' | 'cursor'>) {
  return useInfiniteQuery({
    queryKey: payoutKeys.lists(filters),
    queryFn: ({ pageParam }) => {
      return PayoutService.getPayoutRequests({
        ...filters,
        limit: LIMIT,
        cursor: pageParam ?? null,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => PayoutService.requestPayout(amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: payoutKeys.all });
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
