import { DisputeReason, DisputeResolution, DisputeStatus, Role } from "@/constants";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { IEvidenceItem } from "@/types/booking/booking.entity";
import { DisputeDetails, DisputeListItem } from "@/types/dispute/dispute.projection";
import { resolveStorageUrl } from "@/utils/storage.utils";

export class DisputeListItemDto {
  id!: string;
  disputeId!: string;
  bookingId!: string;
  user!: {
    id: string;
    name: string;
    profileImage?: string;
  };
  worker!: {
    id: string;
    name: string;
    profileImage?: string;
  };
  raisedBy!: Role;
  status!: DisputeStatus;
  reason!: DisputeReason;
  createdAt!: Date;

  static async fromEntity(
    entity: DisputeListItem,
    storageService: IStorageService
  ): Promise<DisputeListItemDto> {
    const dto = new DisputeListItemDto();
    const { bookingId, userId, workerId, _id, disputeId, createdAt, raisedBy, reason, status } =
      entity;

    dto.id = _id.toString();
    dto.disputeId = disputeId;
    dto.bookingId = bookingId._id.toString();
    dto.user = {
      id: userId._id.toString(),
      name: userId.name,
      profileImage: await resolveStorageUrl(userId.profileImage, storageService),
    };
    dto.worker = {
      id: workerId._id.toString(),
      name: workerId.displayName,
      profileImage: await resolveStorageUrl(workerId.profileImage, storageService),
    };
    dto.raisedBy = raisedBy;
    dto.status = status;
    dto.reason = reason;
    dto.createdAt = createdAt;
    return dto;
  }

  static async fromEntities(
    entities: DisputeListItem[],
    storageService: IStorageService
  ): Promise<DisputeListItemDto[]> {
    return Promise.all(entities.map((entity) => this.fromEntity(entity, storageService)));
  }
}

export class DisputeResponseDto {
  id!: string;
  disputeId!: string;
  bookingId!: string;
  serviceName!: string;
  user!: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  worker!: {
    id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  raisedBy!: Role;
  status!: DisputeStatus;
  reason!: DisputeReason;
  resolution?: DisputeResolution;
  description!: string;

  evidence!: IEvidenceItem[];
  refundedAmount?: number;

  adminNote?: string;
  resolvedAt?: Date;
  createdAt!: Date;

  static async fromEntity(
    entity: DisputeDetails,
    storageService: IStorageService
  ): Promise<DisputeResponseDto> {
    const dto = new DisputeResponseDto();
    const {
      bookingId,
      userId,
      workerId,
      _id,
      disputeId,
      createdAt,
      raisedBy,
      reason,
      status,
      description,
      evidence,
      resolution,
      refundedAmount,
      adminNote,
      resolvedAt,
    } = entity;

    dto.id = _id.toString();
    dto.disputeId = disputeId;
    dto.bookingId = bookingId._id.toString();
    dto.serviceName = bookingId.snapshot.category.name;
    dto.user = {
      id: userId._id.toString(),
      name: userId.name,
      phone: userId.phone,
      profileImage: await resolveStorageUrl(userId.profileImage, storageService),
    };
    dto.worker = {
      id: workerId._id.toString(),
      name: workerId.displayName,
      phone: workerId.phone,
      profileImage: await resolveStorageUrl(workerId.profileImage, storageService),
    };
    dto.raisedBy = raisedBy;
    dto.status = status;
    dto.reason = reason;
    dto.description = description;
    dto.evidence = evidence;
    dto.resolution = resolution;
    dto.refundedAmount = refundedAmount;
    dto.adminNote = adminNote;
    dto.resolvedAt = resolvedAt;
    dto.createdAt = createdAt;
    return dto;
  }
}

export interface DisputeStatsResponse {
  total: number;
  pending: number;
  under_review: number;
  resolved: number;
  dismissed: number;
}
