import { WalletTransactionCategory, WalletTransactionType } from "@/constants/payout";

import { Cursor } from "../common/query";

export interface WalletTransactionListQuery {
  limit: number;
  search?: string;
  cursor?: Cursor | null;
  category?: WalletTransactionCategory | "all";
  type?: WalletTransactionType | "all";
  fromDate?: Date;
  toDate?: Date;
}

export interface CreditBookingEarningsParams {
  workerId: string;
  bookingId: string;
  amount: number;
  description: string;
}
