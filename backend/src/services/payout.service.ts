import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import { HTTPSTATUS, PAYOUT_MESSAGES, WORKER } from "@/constants";
import {
  MIN_PAYOUT_AMOUNT,
  PAYOUT_METHOD_STATUS,
  PAYOUT_REQUEST_STATUS,
  WALLET_TRANSACTION_CATEGORY,
  WALLET_TRANSACTION_TYPE,
  PAYOUT_METHOD,
  WALLET_PAYOUT_STATUS,
  PayoutMethod,
  PayoutMethodStatus,
} from "@/constants/payout";
import { IPayoutRepository } from "@/core/interfaces/repositories/IPayoutRepository";
import { IWalletRepository } from "@/core/interfaces/repositories/IWalletRepository";
import { IWalletTransactionRepository } from "@/core/interfaces/repositories/IWalletTransactionRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IPayoutService } from "@/core/interfaces/services/IPayoutService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { TYPES } from "@/di/types";
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
import { IBankDetails, IPayout, IPayoutSnapshot, IUpiDetails } from "@/types/payout/payout.entity";
import { PayoutListQuery } from "@/types/payout/payout.query";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class PayoutService implements IPayoutService {
  constructor(
    @inject(TYPES.PayoutRepository) private _payoutRepository: IPayoutRepository,
    @inject(TYPES.WalletRepository) private _walletRepository: IWalletRepository,
    @inject(TYPES.WalletTransactionRepository)
    private _walletTransactionRepo: IWalletTransactionRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork,
    @inject(TYPES.S3Service) private _s3Service: IS3Service
  ) {}

  async updateBankDetails(workerId: string, data: BankDetailsDto): Promise<WalletResponseDto> {
    const { accountHolderName, accountNumber, ifscCode, bankName } = data;
    const [wallet, worker] = await Promise.all([
      this._walletRepository.findOrCreateByWorkerId(workerId),
      getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND),
    ]);
    const existingBankDetails = wallet.payout?.bankDetails;
    const isSame =
      existingBankDetails &&
      existingBankDetails.accountHolderName === accountHolderName &&
      existingBankDetails.accountNumber === accountNumber &&
      existingBankDetails.ifscCode === ifscCode &&
      existingBankDetails.bankName === bankName;

    if (isSame) {
      return WalletResponseDto.fromEntity(wallet);
    }
    const primaryMethod = wallet.payout?.primaryMethod;
    const bankDetails: IBankDetails = {
      ...data,
      status: PAYOUT_METHOD_STATUS.PENDING,
    };

    const updatedWallet = await this._unitOfWork.execute(async (options) => {
      if (worker.payoutStatus !== WALLET_PAYOUT_STATUS.PENDING) {
        await this._workerRepository.update(workerId, {
          payoutStatus: WALLET_PAYOUT_STATUS.PENDING,
        });
      }
      return await this._walletRepository.updateBankDetails(
        workerId,
        bankDetails,
        primaryMethod ? undefined : PAYOUT_METHOD.BANK,
        options
      );
    });
    if (!updatedWallet) {
      throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND);
    }
    return WalletResponseDto.fromEntity(updatedWallet);
  }

  async updateUpiDetails(workerId: string, data: UpiDetailsDto): Promise<WalletResponseDto> {
    const [wallet, worker] = await Promise.all([
      this._walletRepository.findOrCreateByWorkerId(workerId),
      getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND),
    ]);
    const isSame = wallet.payout?.upiDetails?.upiId === data.upiId;
    if (isSame) {
      return WalletResponseDto.fromEntity(wallet);
    }
    const primaryMethod = wallet.payout?.primaryMethod;
    const upiDetails: IUpiDetails = {
      ...data,
      status: PAYOUT_METHOD_STATUS.PENDING,
    };
    const updatedWallet = await this._unitOfWork.execute(async (options) => {
      if (worker.payoutStatus !== WALLET_PAYOUT_STATUS.PENDING) {
        await this._workerRepository.update(workerId, {
          payoutStatus: WALLET_PAYOUT_STATUS.PENDING,
        });
      }
      return await this._walletRepository.updateUpiDetails(
        workerId,
        upiDetails,
        primaryMethod ? undefined : PAYOUT_METHOD.UPI,
        options
      );
    });
    if (!updatedWallet) {
      throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND);
    }
    return WalletResponseDto.fromEntity(updatedWallet);
  }

  async setPrimaryMethod(workerId: string, data: setPrimaryMethodDto): Promise<WalletResponseDto> {
    const wallet = await this._walletRepository.setPrimaryMethod(workerId, data.method);
    if (!wallet) {
      throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND);
    }
    return WalletResponseDto.fromEntity(wallet);
  }

  async removeBankDetails(workerId: string): Promise<WalletResponseDto> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);
    const wallet = await this._unitOfWork.execute(async (options) => {
      const wallet = await this._walletRepository.removePayoutMethod(
        workerId,
        PAYOUT_METHOD.BANK,
        options
      );
      if (!wallet) {
        throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND);
      }
      if (worker.payoutStatus !== wallet.payoutStatus) {
        await this._workerRepository.findByIdAndUpdate(
          workerId,
          {
            payoutStatus: wallet.payoutStatus,
          },
          options
        );
      }
      return wallet;
    });
    return WalletResponseDto.fromEntity(wallet);
  }

  async removeUpiDetails(workerId: string): Promise<WalletResponseDto> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);
    const wallet = await this._unitOfWork.execute(async (options) => {
      const wallet = await this._walletRepository.removePayoutMethod(
        workerId,
        PAYOUT_METHOD.UPI,
        options
      );
      if (!wallet) {
        throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND);
      }
      if (worker.payoutStatus !== wallet.payoutStatus) {
        await this._workerRepository.findByIdAndUpdate(
          workerId,
          {
            payoutStatus: wallet.payoutStatus,
          },
          options
        );
      }
      return wallet;
    });
    return WalletResponseDto.fromEntity(wallet);
  }

  async getPayoutRequests(
    query: PayoutListQuery
  ): Promise<CursorPaginatedResult<PayoutResponseDto>> {
    const { data, nextCursor } = await this._payoutRepository.findPayoutRequests(query);

    return {
      data: await PayoutResponseDto.fromEntities(data, this._s3Service),
      nextCursor,
    };
  }
  async requestPayout(workerId: string, data: RequestPayoutDto): Promise<IPayout> {
    const { amount } = data;

    if (amount < MIN_PAYOUT_AMOUNT) {
      throw new CustomError(PAYOUT_MESSAGES.BELOW_MINIMUM, HTTPSTATUS.BAD_REQUEST);
    }

    return this._unitOfWork.execute(async (options) => {
      const wallet = await this._walletRepository.moveToPending(workerId, amount, options);
      if (!wallet) {
        throw new CustomError(PAYOUT_MESSAGES.INSUFFICIENT_BALANCE, HTTPSTATUS.BAD_REQUEST);
      }

      const payout = wallet.payout;
      if (!payout?.primaryMethod) {
        throw new CustomError(PAYOUT_MESSAGES.NOT_CONFIGURED, HTTPSTATUS.BAD_REQUEST);
      }
      const isBank = payout.primaryMethod === PAYOUT_METHOD.BANK;
      const details = isBank ? payout.bankDetails : payout.upiDetails;
      if (!details) {
        throw new CustomError(PAYOUT_MESSAGES.NOT_CONFIGURED, HTTPSTATUS.BAD_REQUEST);
      }
      if (details.status !== PAYOUT_METHOD_STATUS.VERIFIED) {
        throw new CustomError(
          `Selected payout method (${isBank ? "Bank Transfer" : "UPI"}) is pending verification or not yet approved.`,
          HTTPSTATUS.BAD_REQUEST
        );
      }

      const payoutSnapshot: IPayoutSnapshot = isBank
        ? {
            accountHolderName: payout.bankDetails!.accountHolderName,
            accountNumber: payout.bankDetails!.accountNumber,
            ifscCode: payout.bankDetails!.ifscCode,
            bankName: payout.bankDetails!.bankName,
          }
        : {
            upiId: payout.upiDetails!.upiId,
          };

      return this._payoutRepository.create(
        {
          workerId: new Types.ObjectId(workerId),
          amount,
          method: payout.primaryMethod,
          payoutSnapshot,
          withdrawableBalanceAfter: wallet.withdrawableBalance,
        },
        options
      );
    });
  }

  async approvePayout(
    payoutId: string,
    adminUserId: string,
    data: ApprovePayoutDto
  ): Promise<void> {
    const { referenceId, receiptUrl } = data;

    await this._unitOfWork.execute(async (options) => {
      const payout = await this._payoutRepository.findOneAndUpdate(
        {
          _id: new Types.ObjectId(payoutId),
          status: PAYOUT_REQUEST_STATUS.PENDING,
        },
        {
          status: PAYOUT_REQUEST_STATUS.APPROVED,
          processedAt: new Date(),
          processedBy: new Types.ObjectId(adminUserId),
          referenceId,
          receiptUrl,
        },
        options
      );
      if (!payout) {
        throw new CustomError(PAYOUT_MESSAGES.REQUEST_NOT_FOUND, HTTPSTATUS.NOT_FOUND);
      }
      const wallet = await this._walletRepository.resolvePendingPayout(
        payout.workerId.toString(),
        payout.amount,
        "approved",
        options
      );
      if (!wallet) {
        throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND, HTTPSTATUS.NOT_FOUND);
      }
      await this._walletTransactionRepo.create(
        {
          walletId: new Types.ObjectId(wallet._id.toString()),
          workerId: new Types.ObjectId(payout.workerId.toString()),
          payoutId: new Types.ObjectId(payout._id.toString()),
          amount: payout.amount,
          type: WALLET_TRANSACTION_TYPE.DEBIT,
          category: WALLET_TRANSACTION_CATEGORY.PAYOUT,
          description: `Payout via ${payout.method.toUpperCase()} - UTR ${referenceId}`,
        },
        options
      );
    });
  }

  async rejectPayout(payoutId: string, adminUserId: string, data: RejectPayoutDto): Promise<void> {
    await this._unitOfWork.execute(async (options) => {
      const payout = await this._payoutRepository.findOneAndUpdate(
        {
          _id: new Types.ObjectId(payoutId),
          status: PAYOUT_REQUEST_STATUS.PENDING,
        },
        {
          status: PAYOUT_REQUEST_STATUS.REJECTED,
          processedAt: new Date(),
          processedBy: new Types.ObjectId(adminUserId),
          rejectionReason: data.reason,
        },
        options
      );
      if (!payout) {
        throw new CustomError(PAYOUT_MESSAGES.REQUEST_NOT_FOUND, HTTPSTATUS.NOT_FOUND);
      }
      const wallet = await this._walletRepository.resolvePendingPayout(
        payout.workerId.toString(),
        payout.amount,
        "rejected",
        options
      );
      if (!wallet) {
        throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND, HTTPSTATUS.NOT_FOUND);
      }
    });
  }

  async updatePayoutMethodStatus(
    workerId: string,
    method: PayoutMethod,
    status: PayoutMethodStatus,
    rejectReason?: string
  ): Promise<WalletResponseDto> {
    const wallet = await this._unitOfWork.execute(async (options) => {
      const [worker, wallet] = await Promise.all([
        getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND),
        this._walletRepository.updatePayoutMethodStatus(
          workerId,
          method,
          status,
          rejectReason,
          options
        ),
      ]);
      if (!wallet) {
        throw new CustomError(PAYOUT_MESSAGES.WALLET_NOT_FOUND, HTTPSTATUS.NOT_FOUND);
      }
      if (worker.payoutStatus !== wallet.payoutStatus) {
        await this._workerRepository.findByIdAndUpdate(
          workerId,
          { payoutStatus: wallet.payoutStatus },
          options
        );
      }
      return wallet;
    });
    return WalletResponseDto.fromEntity(wallet);
  }
}
