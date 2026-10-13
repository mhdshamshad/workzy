import type { WorkerStatus } from '@/constants';
import type { WalletPayoutStatus } from '@/constants/payout';

export interface WorkerListItem {
  email: string;
  id: string;
  displayName: string;
  profileImage?: string;
  status: WorkerStatus;
  userId: string;
  phone?: string;
  payoutStatus: WalletPayoutStatus;
  createdAt: Date;
}

export interface AdminWorkerListResponse {
  workers: WorkerListItem[];
  total: number;
}

export type AdminWorkerListQuery = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  payoutStatus?: string;
};
