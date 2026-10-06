import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AdminPayoutService from '@/services/admin/payoutManagement.service';
import PayoutService from '@/services/payout.service';
import type { PayoutListQuery } from '@/types/payout';

import { payoutKeys } from '../api/payoutKeys';
import { walletKeys } from '../api/wallletKeys';
import { getScopeWorkerId, type PayoutFilters, type WalletScope } from '../types';

const LIMIT = 6;

export function usePayouts(scope: WalletScope, filters?: PayoutFilters) {
  const workerId = getScopeWorkerId(scope);
  return useInfiniteQuery({
    queryKey: workerId
      ? payoutKeys.adminLists({ ...filters, workerId })
      : payoutKeys.lists(filters),
    queryFn: ({ pageParam }) => {
      const params: PayoutListQuery = { ...filters, limit: LIMIT, cursor: pageParam ?? null };
      return workerId
        ? AdminPayoutService.listPayouts({ ...params, workerId })
        : PayoutService.getPayoutRequests(params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    enabled: scope.role === 'worker' || Boolean(workerId),
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
