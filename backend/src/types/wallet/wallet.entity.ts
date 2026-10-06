import { Document, Types } from "mongoose";

import { WalletPayoutStatus } from "@/constants";
import { IWorkerPayout } from "@/types/payout/payout.entity";

export interface IWallet extends Document<string> {
  workerId: Types.ObjectId;
  withdrawableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  payout?: IWorkerPayout;
  payoutStatus: WalletPayoutStatus;
  updatedAt: Date;
  createdAt: Date;
}
