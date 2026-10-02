import { Document, Types } from "mongoose";

import { WalletTransactionCategory, WalletTransactionType } from "@/constants/payout";

export interface IWalletTransaction extends Document<string> {
  transactionId: string;
  walletId: Types.ObjectId;
  workerId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  payoutId?: Types.ObjectId;
  amount: number;
  type: WalletTransactionType;
  category: WalletTransactionCategory;
  description: string;
  createdAt: Date;
}
