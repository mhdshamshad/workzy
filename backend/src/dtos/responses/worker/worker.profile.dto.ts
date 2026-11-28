import { DEFAULT_WORKER_COVER_IMAGE, WorkerStatus } from "@/constants";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import {
  IAvailabilitySlots,
  IGeoLocation,
  IReviewStats,
  IWorker,
  IWorkerDocument,
} from "@/types/worker/worker.entity";
import { WorkerProfile } from "@/types/worker/worker.projection";
import { getTodayKey } from "@/utils/time.utils";

export class WorkerProfileResponseDTO {
  id!: string;
  displayName!: string;
  tagline!: string;
  about!: string;
  experience!: number;
  profileImage?: string;
  coverImage!: string;
  availability!: IAvailabilitySlots;
  addressLabel!: string;
  reviewStats!: Omit<IReviewStats, "totalRating">;
  isAvailableToday!: boolean;
  languages!: string[];
  jobStats!: {
    offered: number;
    accepted: number;
    completed: number;
    noResponse: number;
    complitionRate: number;
  };

  static fromEntity(entity: WorkerProfile): WorkerProfileResponseDTO {
    const dto = new WorkerProfileResponseDTO();
    const { completed, accepted, noResponse, offered } = entity.jobStats;
    const { averageRating, breakdown, reviewCount } = entity.reviewStats;

    dto.id = entity._id.toString();
    dto.displayName = entity.displayName;
    dto.tagline = entity.tagline || "";
    dto.about = entity.about || "";
    dto.experience = entity.experience || 0;
    dto.profileImage = entity.profileImage;
    dto.coverImage = entity.coverImage || DEFAULT_WORKER_COVER_IMAGE;
    dto.addressLabel = entity.location.addressLabel ?? "";
    dto.jobStats = {
      accepted,
      completed,
      noResponse,
      offered,
      complitionRate: accepted > 0 ? Number(((completed / accepted) * 100).toFixed(1)) : 0,
    };
    dto.availability = entity.availability;
    dto.isAvailableToday = entity.availability[getTodayKey()].length > 0;
    dto.languages = entity.languages ?? [];
    dto.reviewStats = {
      averageRating: Math.round((averageRating ?? 0) * 10) / 10,
      breakdown,
      reviewCount,
    };
    return dto;
  }
}

type WorkerDocumentDto = Omit<IWorkerDocument, "_id"> & { id?: string };

export class WorkerDetailsResponseDto {
  id!: string;
  displayName!: string;
  tagline!: string;
  about!: string;
  experience!: number;
  phone!: string;
  profileImage?: string;
  coverImage!: string;
  location!: IGeoLocation;
  status!: WorkerStatus;
  documents!: WorkerDocumentDto[];
  availability!: IAvailabilitySlots;
  languages!: string[];
  rejectReason?: string;
  suspensionReason?: string;
  createdAt!: Date;

  static async fromEntity(
    entity: IWorker,
    storageService: IStorageService
  ): Promise<WorkerDetailsResponseDto> {
    const dto = new WorkerDetailsResponseDto();

    dto.id = entity._id.toString();
    dto.displayName = entity.displayName;
    dto.tagline = entity.tagline || "";
    dto.about = entity.about || "";
    dto.phone = entity.phone;
    dto.experience = entity.experience || 0;
    dto.profileImage = entity?.profileImage;
    dto.coverImage = entity.coverImage || DEFAULT_WORKER_COVER_IMAGE;

    dto.documents = await Promise.all(
      entity.documents.map(
        async (doc): Promise<WorkerDocumentDto> => ({
          id: doc._id?.toString() ?? "",
          url: await storageService.generateSignedUrl(doc.url),
          status: doc.status,
          type: doc.type,
          uploadedAt: doc.uploadedAt,
          rejectReason: doc.rejectReason,
          verifiedAt: doc.verifiedAt,
        })
      )
    );

    dto.location = entity.location;
    dto.status = entity.status;
    dto.availability = entity.availability;
    dto.languages = entity.languages ?? [];
    dto.rejectReason = entity.rejectReason;
    dto.suspensionReason = entity.suspensionReason;
    dto.createdAt = entity.createdAt;

    return dto;
  }
}
