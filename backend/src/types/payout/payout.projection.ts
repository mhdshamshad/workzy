import { Types } from "mongoose";

import { IPayout } from "./payout.entity";

export type PayoutListItem = IPayout & {
  workerId: {
    _id: Types.ObjectId;
    displayName: string;
    phone: string;
    profileImage?: string;
  };
};

export interface PayoutStatsData {
  total: { count: number; totalAmount: number };
  pending: { count: number; totalAmount: number; uniqueWorkers: number; oldestAt: Date | null };
  approved: { count: number; totalAmount: number };
  rejected: { count: number; totalAmount: number };
}
