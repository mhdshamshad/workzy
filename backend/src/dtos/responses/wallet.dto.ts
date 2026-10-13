import {
  WalletPayoutStatus,
  WalletTransactionCategory,
  WalletTransactionType,
} from "@/constants/payout";
import { IWorkerPayout } from "@/types/payout/payout.entity";
import { IWalletTransaction } from "@/types/wallet/wallet-transaction.entity";
import { IWallet } from "@/types/wallet/wallet.entity";

export class WalletResponseDto {
  withdrawableBalance!: number;
  pendingBalance!: number;
  totalEarned!: number;

  payoutStatus!: WalletPayoutStatus;
  payout?: IWorkerPayout;

  static fromEntity(wallet: IWallet): WalletResponseDto {
    const dto = new WalletResponseDto();
    dto.withdrawableBalance = wallet.withdrawableBalance;
    dto.pendingBalance = wallet.pendingBalance;
    dto.totalEarned = wallet.totalEarned;
    dto.payoutStatus = wallet.payoutStatus;
    dto.payout = wallet.payout;
    return dto;
  }
}

export class WalletTransactionResponseDto {
  id!: string;
  transactionId!: string;
  walletId!: string;
  workerId!: string;
  bookingId?: string;
  payoutId?: string;
  amount!: number;
  type!: WalletTransactionType;
  category!: WalletTransactionCategory;
  description!: string;
  createdAt!: Date;

  static fromEntity(entity: IWalletTransaction): WalletTransactionResponseDto {
    const dto = new WalletTransactionResponseDto();
    dto.id = entity._id.toString();
    dto.transactionId = entity.transactionId;
    dto.walletId = entity.walletId.toString();
    dto.workerId = entity.workerId.toString();
    dto.bookingId = entity.bookingId?.toString();
    dto.payoutId = entity.payoutId?.toString();
    dto.amount = entity.amount;
    dto.type = entity.type;
    dto.category = entity.category;
    dto.description = entity.description;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: IWalletTransaction[]): WalletTransactionResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}
