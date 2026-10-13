import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import { WALLET_TRANSACTION_CATEGORY, WALLET_TRANSACTION_TYPE } from "@/constants/payout";
import { IWalletRepository } from "@/core/interfaces/repositories/IWalletRepository";
import { IWalletTransactionRepository } from "@/core/interfaces/repositories/IWalletTransactionRepository";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { IWalletService } from "@/core/interfaces/services/IWalletService";
import { RepositoryOptions } from "@/core/types/repository";
import { TYPES } from "@/di/types";
import { WalletResponseDto, WalletTransactionResponseDto } from "@/dtos/responses/wallet.dto";
import { CursorPaginatedResult } from "@/types/common/pagination";
import {
  CreditBookingEarningsParams,
  WalletTransactionListQuery,
} from "@/types/wallet/wallet.query";

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(TYPES.WalletRepository) private _walletRepository: IWalletRepository,
    @inject(TYPES.WalletTransactionRepository)
    private _walletTransactionRepository: IWalletTransactionRepository,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork
  ) {}
  async getWallet(workerId: string): Promise<WalletResponseDto> {
    const wallet = await this._walletRepository.findOrCreateByWorkerId(workerId);
    return WalletResponseDto.fromEntity(wallet);
  }
  async creditBookingEarnings(
    params: CreditBookingEarningsParams,
    options?: RepositoryOptions
  ): Promise<void> {
    const { workerId, bookingId, amount, description } = params;
    if (amount <= 0) return;

    const performCredit = async (opts: RepositoryOptions) => {
      const wallet = await this._walletRepository.creditEarnings(workerId, amount, opts);
      await this._walletTransactionRepository.create(
        {
          walletId: new Types.ObjectId(wallet._id),
          workerId: new Types.ObjectId(workerId),
          bookingId: new Types.ObjectId(bookingId),
          amount: amount,
          type: WALLET_TRANSACTION_TYPE.CREDIT,
          category: WALLET_TRANSACTION_CATEGORY.EARNING,
          description: description,
        },
        opts
      );
    };
    if (options) {
      await performCredit(options);
    } else {
      await this._unitOfWork.execute(async (opts) => {
        await performCredit(opts);
      });
    }
  }

  async getTransactions(
    workerId: string,
    query: WalletTransactionListQuery
  ): Promise<CursorPaginatedResult<WalletTransactionResponseDto>> {
    const { data, nextCursor } = await this._walletTransactionRepository.listByWorkerId(
      workerId,
      query
    );
    return {
      data: WalletTransactionResponseDto.fromEntities(data),
      nextCursor,
    };
  }
}
