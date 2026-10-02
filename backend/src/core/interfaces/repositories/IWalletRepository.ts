import { ClientSession } from "mongoose";

import { PayoutMethod } from "@/constants/payout";
import { BaseRepository } from "@/core/abstracts/base.repository";
import { RepositoryOptions } from "@/core/types/repository";
import { IBankDetails, IUpiDetails } from "@/types/payout/payout.entity";
import { IWallet } from "@/types/wallet/wallet.entity";

export interface IWalletRepository extends BaseRepository<IWallet> {
  findOrCreateByWorkerId(workerId: string, options?: { session?: ClientSession }): Promise<IWallet>;

  updateBankDetails(
    workerId: string,
    bankDetails: IBankDetails,
    primaryMethod?: PayoutMethod,
    options?: RepositoryOptions
  ): Promise<IWallet | null>;
  updateUpiDetails(
    workerId: string,
    upiDetails: IUpiDetails,
    primaryMethod?: PayoutMethod,
    options?: RepositoryOptions
  ): Promise<IWallet | null>;
  setPrimaryMethod(workerId: string, method: PayoutMethod): Promise<IWallet | null>;

  removePayoutMethod(
    workerId: string,
    method: PayoutMethod,
    options?: RepositoryOptions
  ): Promise<IWallet | null>;

  creditEarnings(
    workerId: string,
    amount: number,
    options?: { session?: ClientSession }
  ): Promise<IWallet>;

  moveToPending(
    workerId: string,
    amount: number,
    options?: { session?: ClientSession }
  ): Promise<IWallet | null>;

  resolvePendingPayout(
    workerId: string,
    amount: number,
    outcome: "approved" | "rejected",
    options?: { session?: ClientSession }
  ): Promise<IWallet | null>;
}
