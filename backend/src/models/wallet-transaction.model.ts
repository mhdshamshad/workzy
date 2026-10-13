import { model, Schema } from "mongoose";

import { WALLET_TRANSACTION_CATEGORY, WALLET_TRANSACTION_TYPE } from "@/constants/payout";
import { IWalletTransaction } from "@/types/wallet/wallet-transaction.entity";
import { generateTxnCode } from "@/utils/generateTxnCode";

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => generateTxnCode("TXN"),
    },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    payoutId: { type: Schema.Types.ObjectId, ref: "Payout" },
    amount: { type: Number, required: true },
    type: { type: String, enum: Object.values(WALLET_TRANSACTION_TYPE), required: true },
    category: { type: String, enum: Object.values(WALLET_TRANSACTION_CATEGORY), required: true },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

walletTransactionSchema.index({ workerId: 1, createdAt: -1 });

const WalletTransaction = model<IWalletTransaction>("WalletTransaction", walletTransactionSchema);
export default WalletTransaction;
