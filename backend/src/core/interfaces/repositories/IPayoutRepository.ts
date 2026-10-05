import { BaseRepository } from "@/core/abstracts/base.repository";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { IPayout } from "@/types/payout/payout.entity";
import { PayoutListItem, PayoutStatsData } from "@/types/payout/payout.projection";
import { PayoutListQuery } from "@/types/payout/payout.query";

export interface IPayoutRepository extends BaseRepository<IPayout> {
  findPayoutRequests(query: PayoutListQuery): Promise<CursorPaginatedResult<PayoutListItem>>;
  getPayoutStats(): Promise<PayoutStatsData>;
}
