import { PayoutMethod, PayoutRequestStatus } from "@/constants/payout";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { IPayoutSnapshot } from "@/types/payout/payout.entity";
import { PayoutListItem } from "@/types/payout/payout.projection";

export class PayoutResponseDto {
  id!: string;
  worker!: {
    id: string;
    displayName: string;
    profileImage?: string;
    phone: string;
  };
  amount!: number;
  status!: PayoutRequestStatus;
  method!: PayoutMethod;
  payoutSnapshot!: IPayoutSnapshot;
  withdrawableBalanceAfter!: number;

  processedAt?: Date;
  referenceId?: string;
  receiptUrl?: string;
  rejectionReason?: string;
  createdAt!: Date;

  static async fromEntity(
    entity: PayoutListItem,
    s3Service: IS3Service
  ): Promise<PayoutResponseDto> {
    const dto = new PayoutResponseDto();
    dto.id = entity._id.toString();
    const worker = entity.workerId;
    dto.worker = {
      id: worker._id.toString(),
      displayName: worker.displayName,
      phone: worker.phone,
      profileImage: worker.profileImage,
    };
    dto.amount = entity.amount;
    dto.status = entity.status;
    dto.method = entity.method;
    dto.payoutSnapshot = entity.payoutSnapshot;
    dto.withdrawableBalanceAfter = entity.withdrawableBalanceAfter;

    dto.processedAt = entity.processedAt;
    dto.referenceId = entity.referenceId;
    dto.receiptUrl = entity.receiptUrl
      ? await s3Service.generateSignedUrl(entity.receiptUrl)
      : undefined;
    dto.rejectionReason = entity.rejectionReason;
    dto.createdAt = entity.createdAt;

    return dto;
  }

  static async fromEntities(
    entities: PayoutListItem[],
    s3Service: IS3Service
  ): Promise<PayoutResponseDto[]> {
    return Promise.all(entities.map((entity) => this.fromEntity(entity, s3Service)));
  }
}
