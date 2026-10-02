import { injectable } from "inversify";
import { Types } from "mongoose";

import {
  PAYOUT_METHOD,
  PAYOUT_METHOD_STATUS,
  PayoutMethod,
  WALLET_PAYOUT_STATUS,
} from "@/constants";
import { BaseRepository } from "@/core/abstracts/base.repository";
import { IWalletRepository } from "@/core/interfaces/repositories/IWalletRepository";
import { RepositoryOptions } from "@/core/types/repository";
import Wallet from "@/models/wallet.model";
import { IBankDetails, IUpiDetails } from "@/types/payout/payout.entity";
import { IWallet } from "@/types/wallet/wallet.entity";

@injectable()
export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {
  constructor() {
    super(Wallet);
  }

  async findOrCreateByWorkerId(workerId: string, options?: RepositoryOptions): Promise<IWallet> {
    return this.model.findOneAndUpdate(
      { workerId: new Types.ObjectId(workerId) },
      {
        $setOnInsert: {
          workerId: new Types.ObjectId(workerId),
        },
      },
      { new: true, upsert: true, session: options?.session, setDefaultsOnInsert: true }
    );
  }

  async updateBankDetails(
    workerId: string,
    bankDetails: IBankDetails,
    primaryMethod?: PayoutMethod,
    options?: RepositoryOptions
  ): Promise<IWallet | null> {
    const $set: Record<string, unknown> = {
      "payout.bankDetails": bankDetails,
      payoutStatus: WALLET_PAYOUT_STATUS.PENDING,
    };

    if (primaryMethod) {
      $set["payout.primaryMethod"] = primaryMethod;
    }

    return this.model.findOneAndUpdate(
      { workerId: new Types.ObjectId(workerId) },
      { $set },
      {
        new: true,
        session: options?.session,
      }
    );
  }

  async updateUpiDetails(
    workerId: string,
    upiDetails: IUpiDetails,
    primaryMethod?: PayoutMethod,
    options?: RepositoryOptions
  ): Promise<IWallet | null> {
    const $set: Record<string, unknown> = {
      "payout.upiDetails": upiDetails,
      payoutStatus: WALLET_PAYOUT_STATUS.PENDING,
    };

    if (primaryMethod) {
      $set["payout.primaryMethod"] = primaryMethod;
    }

    return this.model.findOneAndUpdate(
      { workerId: new Types.ObjectId(workerId) },
      { $set },
      {
        new: true,
        session: options?.session,
      }
    );
  }

  async setPrimaryMethod(workerId: string, method: PayoutMethod): Promise<IWallet | null> {
    return this.model.findOneAndUpdate(
      { workerId: new Types.ObjectId(workerId) },
      { "payout.primaryMethod": method },
      { new: true }
    );
  }

  async removePayoutMethod(
    workerId: string,
    method: PayoutMethod,
    options?: RepositoryOptions
  ): Promise<IWallet | null> {
    const isBank = method === PAYOUT_METHOD.BANK;
    const targetField = isBank ? "bankDetails" : "upiDetails";
    const otherField = isBank ? "upiDetails" : "bankDetails";
    const otherMethod = isBank ? PAYOUT_METHOD.UPI : PAYOUT_METHOD.BANK;

    const otherMethodExists = { $eq: [{ $type: `$payout.${otherField}` }, "object"] };
    const noMethodsRemain = {
      $and: [
        { $ne: [{ $type: "$payout.bankDetails" }, "object"] },
        { $ne: [{ $type: "$payout.upiDetails" }, "object"] },
      ],
    };

    return this.model.findOneAndUpdate(
      { workerId: new Types.ObjectId(workerId) },
      [
        { $unset: `payout.${targetField}` },
        {
          $set: {
            payout: {
              $cond: [
                otherMethodExists,
                { $mergeObjects: ["$payout", { primaryMethod: otherMethod }] },
                "$$REMOVE",
              ],
            },
          },
        },
        {
          $set: {
            payoutStatus: {
              $cond: [
                noMethodsRemain,
                WALLET_PAYOUT_STATUS.NOT_CONFIGURED,
                {
                  $cond: [
                    {
                      $or: [
                        {
                          $eq: ["$payout.bankDetails.status", PAYOUT_METHOD_STATUS.PENDING],
                        },
                        {
                          $eq: ["$payout.upiDetails.status", PAYOUT_METHOD_STATUS.PENDING],
                        },
                      ],
                    },
                    WALLET_PAYOUT_STATUS.PENDING,
                    {
                      $cond: [
                        {
                          $or: [
                            {
                              $eq: ["$payout.bankDetails.status", PAYOUT_METHOD_STATUS.VERIFIED],
                            },
                            {
                              $eq: ["$payout.upiDetails.status", PAYOUT_METHOD_STATUS.VERIFIED],
                            },
                          ],
                        },
                        WALLET_PAYOUT_STATUS.VERIFIED,
                        WALLET_PAYOUT_STATUS.REJECTED,
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
      {
        new: true,
        session: options?.session,
      }
    );
  }

  async creditEarnings(
    workerId: string,
    amount: number,
    options?: RepositoryOptions
  ): Promise<IWallet> {
    const wallet = await this.model.findOneAndUpdate(
      { workerId: new Types.ObjectId(workerId) },
      { $inc: { withdrawableBalance: amount, totalEarned: amount } },
      { new: true, upsert: true, session: options?.session }
    );
    return wallet;
  }

  async moveToPending(
    workerId: string,
    amount: number,
    options?: RepositoryOptions
  ): Promise<IWallet | null> {
    return this.model.findOneAndUpdate(
      { workerId: new Types.ObjectId(workerId), withdrawableBalance: { $gte: amount } },
      { $inc: { withdrawableBalance: -amount, pendingBalance: amount } },
      { new: true, session: options?.session }
    );
  }

  async resolvePendingPayout(
    workerId: string,
    amount: number,
    outcome: "approved" | "rejected",
    options?: RepositoryOptions
  ): Promise<IWallet | null> {
    const update =
      outcome === "approved"
        ? { $inc: { pendingBalance: -amount } }
        : { $inc: { pendingBalance: -amount, withdrawableBalance: amount } };

    return await this.model.findOneAndUpdate(
      {
        workerId: new Types.ObjectId(workerId),
        pendingBalance: { $gte: amount },
      },
      update,
      {
        new: true,
        session: options?.session,
      }
    );
  }
}
