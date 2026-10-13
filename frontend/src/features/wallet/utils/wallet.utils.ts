import {
  PAYOUT_METHOD,
  PAYOUT_METHOD_STATUS,
  type PayoutMethodStatus,
  type PayoutRequestStatus,
  type WalletPayoutStatus,
} from '@/constants/payout';
import type { Wallet } from '@/types/wallet';

export const maskAccount = (accountNumber?: string) => `•••• ${accountNumber?.slice(-4) ?? ''}`;

type PrimaryDestination = { label: string; verified: boolean } | null;

export function getPrimaryDestination(wallet?: Wallet): PrimaryDestination {
  const payout = wallet?.payout;
  if (!payout) {
    return null;
  }
  if (payout.primaryMethod === PAYOUT_METHOD.BANK && payout.bankDetails) {
    const { bankName, accountNumber, status } = payout.bankDetails;
    return {
      label: `${bankName} · ${maskAccount(accountNumber)}`,
      verified: status === PAYOUT_METHOD_STATUS.VERIFIED,
    };
  }
  if (payout.primaryMethod === PAYOUT_METHOD.UPI && payout.upiDetails) {
    return {
      label: `UPI · ${payout.upiDetails.upiId}`,
      verified: payout.upiDetails.status === PAYOUT_METHOD_STATUS.VERIFIED,
    };
  }
  return null;
}

export function getStatusBadgeVariant(
  status?: PayoutMethodStatus | WalletPayoutStatus | PayoutRequestStatus
): 'green' | 'amber' | 'red' | 'slate' {
  switch (status) {
    case 'verified':
    case 'approved':
      return 'green';
    case 'pending':
      return 'amber';
    case 'rejected':
      return 'red';
    default:
      return 'slate';
  }
}
