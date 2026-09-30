import { model, Schema } from "mongoose";

import { PAYOUT_METHOD, PAYOUT_METHOD_STATUS, WALLET_PAYOUT_STATUS } from "@/constants/payout";
import { IWallet } from "@/types/wallet/wallet.entity";

const walletSchema = new Schema<IWallet>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
      unique: true,
    },
    withdrawableBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    payout: {
      primaryMethod: { type: String, enum: Object.values(PAYOUT_METHOD) },
      bankDetails: {
        accountHolderName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String },
        status: {
          type: String,
          enum: Object.values(PAYOUT_METHOD_STATUS),
          default: PAYOUT_METHOD_STATUS.PENDING,
        },
        verifiedAt: { type: Date },
        rejectReason: { type: String },
      },
      upiDetails: {
        upiId: { type: String },
        status: {
          type: String,
          enum: Object.values(PAYOUT_METHOD_STATUS),
          default: PAYOUT_METHOD_STATUS.PENDING,
        },
        verifiedAt: { type: Date },
        rejectReason: { type: String },
      },
    },
    payoutStatus: {
      type: String,
      enum: Object.values(WALLET_PAYOUT_STATUS),
      default: WALLET_PAYOUT_STATUS.NOT_CONFIGURED,
    },
  },
  { timestamps: true }
);

const Wallet = model<IWallet>("Wallet", walletSchema);

export default Wallet;
