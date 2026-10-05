import { PayoutMethod, PayoutMethodStatus } from "@/constants";
import {
  ApprovePayoutDto,
  BankDetailsDto,
  RejectPayoutDto,
  RequestPayoutDto,
  setPrimaryMethodDto,
  UpiDetailsDto,
} from "@/dtos/requests/payout.dto";
import { PayoutResponseDto } from "@/dtos/responses/payout.dto";
import { WalletResponseDto } from "@/dtos/responses/wallet.dto";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { IPayout } from "@/types/payout/payout.entity";
import { PayoutStatsData } from "@/types/payout/payout.projection";
import { PayoutListQuery } from "@/types/payout/payout.query";

export interface IPayoutService {
  updateBankDetails(workerId: string, data: BankDetailsDto): Promise<WalletResponseDto>;
  updateUpiDetails(workerId: string, data: UpiDetailsDto): Promise<WalletResponseDto>;
  setPrimaryMethod(workerId: string, data: setPrimaryMethodDto): Promise<WalletResponseDto>;
  removeBankDetails(workerId: string): Promise<WalletResponseDto>;
  removeUpiDetails(workerId: string): Promise<WalletResponseDto>;

  getPayoutRequests(query: PayoutListQuery): Promise<CursorPaginatedResult<PayoutResponseDto>>;
  requestPayout(workerId: string, data: RequestPayoutDto): Promise<IPayout>;

  approvePayout(payoutId: string, adminUserId: string, data: ApprovePayoutDto): Promise<void>;
  rejectPayout(payoutId: string, adminUserId: string, data: RejectPayoutDto): Promise<void>;
  updatePayoutMethodStatus(
    workerId: string,
    method: PayoutMethod,
    status: PayoutMethodStatus,
    rejectReason?: string
  ): Promise<WalletResponseDto>;
  getPayoutStats(): Promise<PayoutStatsData>;
}
