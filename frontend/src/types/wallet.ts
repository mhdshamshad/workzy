import type {
  WalletPayoutStatus,
  WalletTransactionCategory,
  WalletTransactionType,
} from '@/constants/payout';

import type { WorkerPayout } from './payout';

export interface Wallet {
  withdrawableBalance: number;
  pendingBalance: number;
  totalEarned: number;

  payoutStatus: WalletPayoutStatus;
  payout?: WorkerPayout;
}

export interface WalletTransaction {
  id: string;
  transactionId: string;
  walletId: string;
  workerId: string;
  bookingId?: string;
  payoutId?: string;
  amount: number;
  type: WalletTransactionType;
  category: WalletTransactionCategory;
  description: string;
  createdAt: Date;
}

export interface WalletTransactionListingResponse {
  transactions: WalletTransaction[];
  nextCursor: string | null;
}

export interface WalletTransactionListQuery {
  limit: number;
  search?: string;
  cursor?: string | null;
  category?: WalletTransactionCategory | 'all';
  type?: WalletTransactionType | 'all';
  fromDate?: Date;
  toDate?: Date;
}
