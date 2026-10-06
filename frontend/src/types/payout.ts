import type { PayoutMethod, PayoutMethodStatus, PayoutRequestStatus } from '@/constants/payout';

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  status: PayoutMethodStatus;
  verifiedAt?: Date;
  rejectReason?: string;
}

export interface UpiDetails {
  upiId: string;
  status: PayoutMethodStatus;
  verifiedAt?: Date;
  rejectReason?: string;
}

export interface WorkerPayout {
  primaryMethod: PayoutMethod;
  bankDetails?: BankDetails;
  upiDetails?: UpiDetails;
}

type BankPayoutSnapshot = Pick<
  BankDetails,
  'accountHolderName' | 'accountNumber' | 'ifscCode' | 'bankName'
>;
type UpiPayoutSnapshot = Pick<UpiDetails, 'upiId'>;
type PayoutSnapshot = BankPayoutSnapshot | UpiPayoutSnapshot;

export interface PayoutRequest {
  id: string;
  worker: {
    id: string;
    displayName: string;
    profileImage?: string;
    phone: string;
  };
  amount: number;
  status: PayoutRequestStatus;
  method: PayoutMethod;
  payoutSnapshot: PayoutSnapshot;
  withdrawableBalanceAfter: number;

  processedAt?: Date;
  referenceId?: string;
  receiptUrl?: string;
  rejectionReason?: string;
  createdAt: Date;
}

export interface PayoutListingResponse {
  payouts: PayoutRequest[];
  nextCursor: string | null;
}

export interface PayoutListQuery {
  limit: number;
  cursor?: string | null;
  status?: PayoutRequestStatus | 'all';
  search?: string;
  fromDate?: Date;
  toDate?: Date;
}

export type AdminPayoutListQuery = PayoutListQuery & {
  workerId?: string;
};

export interface PayoutStatsResponse {
  total: { count: number; totalAmount: number };
  pending: { count: number; totalAmount: number; uniqueWorkers: number; oldestAt: string | null };
  approved: { count: number; totalAmount: number };
  rejected: { count: number; totalAmount: number };
}
