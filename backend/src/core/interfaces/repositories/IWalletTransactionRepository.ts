import { BaseRepository } from "@/core/abstracts/base.repository";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { IWalletTransaction } from "@/types/wallet/wallet-transaction.entity";
import { WalletTransactionListQuery } from "@/types/wallet/wallet.query";

export interface IWalletTransactionRepository extends BaseRepository<IWalletTransaction> {
  listByWorkerId(
    workerId: string,
    params: WalletTransactionListQuery
  ): Promise<CursorPaginatedResult<IWalletTransaction>>;
}
