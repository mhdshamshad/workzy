import { Document, Types } from "mongoose";

import { BillType, PaymentProvider, PaymentStatus } from "@/constants";

export interface IPayment extends Document<string> {
  transactionId: string;
  title: string;
  userId: Types.ObjectId;
  workerId: Types.ObjectId;
  bookingId: Types.ObjectId;
  billType: BillType;

  amount: number;
  platformFee?: number;
  workerAmount?: number;
  currency: string; // "inr" | "aed" | "usd"
  status: PaymentStatus;
  provider: PaymentProvider;

  paymentIntentId?: string;
  refundedAmount?: number;
  sessionId?: string;
  failureReason?: string;

  userName?: string;
  workerName?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface BookingCheckoutParams {
  slotId: string;
  userId: string;
  workerId: string;
  bookingId: string;
  amount: number;
  serviceName: string;
  workerName: string;
  userName: string;
  platformFee: number;
  workerAmount: number;
}

export interface VerifySessionType {
  success: boolean;
  transactionId?: string;
  productName?: string;
  amountPaid?: number;
  paymentMethod?: string;
  date?: string;
  type?: string;
  receiptUrl?: string;
}
