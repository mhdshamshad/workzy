import { RepositoryOptions } from "@/core/types/repository";
import { WalletResponseDto, WalletTransactionResponseDto } from "@/dtos/responses/wallet.dto";
import { CursorPaginatedResult } from "@/types/common/pagination";
import {
  CreditBookingEarningsParams,
  WalletTransactionListQuery,
} from "@/types/wallet/wallet.query";

export interface IWalletService {
  getWallet(workerId: string): Promise<WalletResponseDto>;
  creditBookingEarnings(
    params: CreditBookingEarningsParams,
    options?: RepositoryOptions
  ): Promise<void>;
  getTransactions(
    workerId: string,
    query?: WalletTransactionListQuery
  ): Promise<CursorPaginatedResult<WalletTransactionResponseDto>>;
}
