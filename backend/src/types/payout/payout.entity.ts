import { Document, Types } from "mongoose";

import { PayoutMethod, PayoutRequestStatus, PayoutMethodStatus } from "@/constants";

export interface IBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  status: PayoutMethodStatus;
  verifiedAt?: Date;
  rejectReason?: string;
}

export interface IUpiDetails {
  upiId: string;
  status: PayoutMethodStatus;
  verifiedAt?: Date;
  rejectReason?: string;
}

export interface IWorkerPayout {
  primaryMethod: PayoutMethod;
  bankDetails?: IBankDetails;
  upiDetails?: IUpiDetails;
}

interface IBankPayoutSnapshot {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}
interface IUpiPayoutSnapshot {
  upiId: string;
}
export type IPayoutSnapshot = IBankPayoutSnapshot | IUpiPayoutSnapshot;

export interface IPayout extends Document<string> {
  workerId: Types.ObjectId;
  amount: number;
  status: PayoutRequestStatus;
  method: PayoutMethod;
  payoutSnapshot: IPayoutSnapshot;
  withdrawableBalanceAfter: number;

  processedAt?: Date;
  processedBy?: Types.ObjectId;

  referenceId?: string;
  receiptUrl?: string;
  rejectionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}
