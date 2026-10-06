import { model, Schema } from "mongoose";

import { PAYOUT_METHOD, PAYOUT_REQUEST_STATUS } from "@/constants/payout";
import { IPayout } from "@/types/payout/payout.entity";

const payoutSchema = new Schema<IPayout>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "Worker", required: true, index: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(PAYOUT_REQUEST_STATUS),
      default: PAYOUT_REQUEST_STATUS.PENDING,
      index: true,
    },
    method: { type: String, enum: Object.values(PAYOUT_METHOD), required: true },
    payoutSnapshot: { type: Schema.Types.Mixed, required: true },
    withdrawableBalanceAfter: { type: Number, min: 0, required: true },

    processedAt: Date,
    processedBy: { type: Schema.Types.ObjectId, ref: "User" }, //admin ref
    referenceId: String,
    receiptUrl: String,
    rejectionReason: String,
  },
  { timestamps: true }
);

payoutSchema.index({ workerId: 1, status: 1 });

const Payout = model<IPayout>("Payout", payoutSchema);
export default Payout;
