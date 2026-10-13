import { useInfiniteQuery } from '@tanstack/react-query';

import { walletKeys } from '@/features/wallet';
import AdminWalletService from '@/services/admin/walletManagement.service';
import WalletService from '@/services/wallet.service';
import type { WalletTransactionListQuery } from '@/types/wallet';

type TransactionFilters = Omit<WalletTransactionListQuery, 'limit' | 'cursor'>;

const LIMIT = 10;

export function useWorkerTransactions(filters?: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: walletKeys.lists('me', filters),
    queryFn: ({ pageParam }) => {
      const params: WalletTransactionListQuery = {
        ...filters,
        limit: LIMIT,
        cursor: pageParam ?? null,
      };
      return WalletService.getTransactions(params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    retry: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });
}

export function useAdminWorkerTransactions(workerId: string, filters?: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: walletKeys.lists(workerId, filters),
    queryFn: ({ pageParam }) => {
      const params: WalletTransactionListQuery = {
        ...filters,
        limit: LIMIT,
        cursor: pageParam ?? null,
      };
      return AdminWalletService.getWorkerTransactions(workerId, params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    enabled: Boolean(workerId),
    retry: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });
}
