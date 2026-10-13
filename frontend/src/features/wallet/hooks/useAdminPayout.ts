import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  payoutKeys,
  walletKeys,
  type ApprovePayoutFormType,
  type RejectPayoutFormType,
} from '@/features/wallet';
import AdminPayoutService from '@/services/admin/payoutManagement.service';
import type { AdminPayoutListQuery, PayoutListingResponse } from '@/types/payout';

const LIMIT = 5;

export function useAdminPayouts(filters?: Omit<AdminPayoutListQuery, 'limit' | 'cursor'>) {
  return useInfiniteQuery<
    PayoutListingResponse,
    Error,
    { pages: PayoutListingResponse[]; pageParams: (string | undefined)[] },
    ReturnType<typeof payoutKeys.adminLists>,
    string | undefined
  >({
    queryKey: payoutKeys.adminLists(filters),
    queryFn: ({ pageParam }) =>
      AdminPayoutService.listPayouts({
        ...filters,
        limit: LIMIT,
        cursor: pageParam ?? null,
      }),
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });
}

export function useAdminPayoutStats() {
  return useQuery({
    queryKey: payoutKeys.stats,
    queryFn: () => AdminPayoutService.getPayoutStats(),
    refetchOnMount: 'always',
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });
}

export function useApprovePayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovePayoutFormType }) =>
      AdminPayoutService.approvePayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: payoutKeys.stats });
    },
  });
}

export function useRejectPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectPayoutFormType }) =>
      AdminPayoutService.rejectPayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.all });
      queryClient.invalidateQueries({ queryKey: payoutKeys.stats });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
