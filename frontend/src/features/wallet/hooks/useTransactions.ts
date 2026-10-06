import { useInfiniteQuery } from '@tanstack/react-query';

import AdminWalletService from '@/services/admin/walletManagement.service';
import WalletService from '@/services/wallet.service';
import type { WalletTransactionListQuery } from '@/types/wallet';

import { walletKeys } from '../api/wallletKeys';

import type { TransactionFilters } from '../types';

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

export function useTransactions(workerId?: string, filters?: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: walletKeys.lists(workerId ?? 'me', filters),
    queryFn: ({ pageParam }) => {
      const params: WalletTransactionListQuery = {
        ...filters,
        limit: LIMIT,
        cursor: pageParam ?? null,
      };
      return workerId
        ? AdminWalletService.getWorkerTransactions(workerId, params)
        : WalletService.getTransactions(params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    enabled: workerId !== undefined ? Boolean(workerId) : true,
    retry: 1,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    gcTime: 1000 * 60 * 5,
    staleTime: 0,
  });
}
