import { PayoutRequestStatus } from "@/constants/payout";

import { Cursor } from "../common/query";

export interface PayoutListQuery {
  limit: number;
  cursor?: Cursor | null;
  status?: PayoutRequestStatus | "all";
  search?: string;
  workerId?: string;
  fromDate?: Date;
  toDate?: Date;
}
