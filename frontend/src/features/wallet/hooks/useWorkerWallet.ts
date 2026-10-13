import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PayoutMethod } from '@/constants/payout';
import { walletKeys, type BankDetailsFormType, type UpiDetailsFormType } from '@/features/wallet';
import type { ApiError } from '@/lib/api/apiError';
import WalletService from '@/services/wallet.service';
import type { Wallet } from '@/types/wallet';

export function useWorkerWallet() {
  return useQuery<Wallet, ApiError>({
    queryKey: walletKeys.all,
    queryFn: () => WalletService.getWallet(),
    retry: 1,
    refetchOnMount: 'always',
    gcTime: 1000 * 60 * 3,
  });
}

export function useUpdateBankDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BankDetailsFormType) => WalletService.updateBankDetails(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useUpdateUpiDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpiDetailsFormType) => WalletService.updateUpiDetails(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useSetPrimaryWalletMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (method: PayoutMethod) => WalletService.setPrimaryMethod(method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useRemoveBankDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => WalletService.removeBankDetails(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

export function useRemoveUpiDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => WalletService.removeUpiDetails(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}
