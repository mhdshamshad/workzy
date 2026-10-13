import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PayoutMethod } from '@/constants/payout';
import { walletKeys } from '@/features/wallet';
import type { ApiError } from '@/lib/api/apiError';
import AdminPayoutService from '@/services/admin/payoutManagement.service';
import AdminWalletService from '@/services/admin/walletManagement.service';
import type { Wallet } from '@/types/wallet';

export function useAdminWorkerWallet(workerId: string) {
  return useQuery<Wallet, ApiError>({
    queryKey: walletKeys.worker(workerId),
    queryFn: () => AdminWalletService.getWorkerWallet(workerId),
    enabled: Boolean(workerId),
    retry: 1,
    refetchOnMount: 'always',
    gcTime: 1000 * 60 * 3,
  });
}

export function useVerifyPayoutMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, method }: { workerId: string; method: PayoutMethod }) =>
      AdminPayoutService.verifyPayoutMethod(workerId, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useRejectPayoutMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      workerId,
      method,
      reason,
    }: {
      workerId: string;
      method: PayoutMethod;
      reason: string;
    }) => AdminPayoutService.rejectPayoutMethod(workerId, method, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
