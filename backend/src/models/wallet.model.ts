import { model, Schema } from "mongoose";

import { PAYOUT_METHOD, PAYOUT_METHOD_STATUS, WALLET_PAYOUT_STATUS } from "@/constants/payout";
import { IWallet } from "@/types/wallet/wallet.entity";

const bankDetailsSchema = new Schema(
  {
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    status: { type: String, enum: Object.values(PAYOUT_METHOD_STATUS), required: true },
    verifiedAt: { type: Date },
    rejectReason: { type: String },
  },
  { _id: false }
);

const upiDetailsSchema = new Schema(
  {
    upiId: { type: String, required: true },
    status: { type: String, enum: Object.values(PAYOUT_METHOD_STATUS), required: true },
    verifiedAt: { type: Date },
    rejectReason: { type: String },
  },
  { _id: false }
);

const payoutSettingsSchema = new Schema(
  {
    primaryMethod: { type: String, enum: Object.values(PAYOUT_METHOD), required: true },
    bankDetails: { type: bankDetailsSchema },
    upiDetails: { type: upiDetailsSchema },
  },
  { _id: false }
);

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
    payout: { type: payoutSettingsSchema },
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
