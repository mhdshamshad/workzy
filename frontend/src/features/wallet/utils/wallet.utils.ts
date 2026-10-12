import {
  PAYOUT_METHOD,
  PAYOUT_METHOD_STATUS,
  type PayoutMethodStatus,
  type PayoutRequestStatus,
  type WalletPayoutStatus,
} from '@/constants/payout';
import type { BankPayoutSnapshot, PayoutRequest, UpiPayoutSnapshot } from '@/types/payout';
import type { Wallet } from '@/types/wallet';

export const maskAccount = (accountNumber?: string) => `•••• ${accountNumber?.slice(-4) ?? ''}`;

export type PrimaryDestination = { label: string; verified: boolean } | null;

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

export type PayoutDestinationDetails =
  | ({ method: typeof PAYOUT_METHOD.BANK } & BankPayoutSnapshot)
  | ({ method: typeof PAYOUT_METHOD.UPI } & UpiPayoutSnapshot);

export function getPayoutDestinationDetails(
  payout: Pick<PayoutRequest, 'method' | 'payoutSnapshot'>
): PayoutDestinationDetails | null {
  const { method, payoutSnapshot } = payout;

  if (method === PAYOUT_METHOD.BANK && 'accountNumber' in payoutSnapshot) {
    const { accountHolderName, accountNumber, ifscCode, bankName } = payoutSnapshot;
    return { method, accountHolderName, accountNumber, ifscCode, bankName };
  }

  if (method === PAYOUT_METHOD.UPI && 'upiId' in payoutSnapshot) {
    return { method, upiId: payoutSnapshot.upiId };
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

export type SnapshotFields = Partial<{
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string;
}>;
