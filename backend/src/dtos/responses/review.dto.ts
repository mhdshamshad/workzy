import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { IReview } from "@/types/review/review.entity";
import { ReviewListItem } from "@/types/review/review.projection";
import { IReviewStats } from "@/types/worker/worker.entity";
import { resolveStorageUrl } from "@/utils/storage.utils";

export class ReviewResponseDto {
  id!: string;
  bookingId!: string;
  userId!: string;
  workerId!: string;
  serviceId!: string;
  categoryId!: string;
  rating!: number;
  reviewText?: string;
  media?: {
    url: string;
    type: "image" | "video";
  }[];
  reply?: {
    message: string;
    repliedAt: Date;
  };
  isEdited!: boolean;
  isHidden!: boolean;
  createdAt!: Date;

  static fromEntity(entity: IReview): ReviewResponseDto {
    const dto = new ReviewResponseDto();

    dto.id = entity._id.toString();
    dto.bookingId = entity.bookingId.toString();
    dto.userId = entity.userId.toString();
    dto.workerId = entity.workerId.toString();
    dto.serviceId = entity.serviceId.toString();
    dto.categoryId = entity.categoryId.toString();
    dto.rating = entity.rating;
    dto.reviewText = entity.reviewText;
    dto.media = entity.media;
    dto.reply = entity.reply;
    dto.isEdited = entity.isEdited;
    dto.isHidden = entity.isHidden;
    dto.createdAt = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: IReview[]): ReviewResponseDto[] {
    return entities.map((entity) => this.fromEntity(entity));
  }
}

class ReviewBaseDto {
  id!: string;
  bookingId!: string;
  serviceId!: string;
  category!: {
    id: string;
    name: string;
  };
  rating!: number;
  reviewText?: string;
  media?: {
    url: string;
    type: "image" | "video";
  }[];
  reply?: {
    message: string;
    repliedAt: Date;
  };
  isEdited!: boolean;
  createdAt!: Date;
  static baseMap(entity: ReviewListItem): ReviewBaseDto {
    const dto = new ReviewBaseDto();

    dto.id = entity._id.toString();
    dto.bookingId = entity.bookingId._id.toString();
    dto.serviceId = entity.serviceId.toString();
    dto.category = {
      id: entity.categoryId.toString(),
      name: entity.bookingId.snapshot.category.name,
    };

    dto.rating = entity.rating;
    dto.reviewText = entity.reviewText;
    dto.media = entity.media;
    dto.reply = entity.reply;
    dto.isEdited = entity.isEdited;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}

export class ReviewUserDto extends ReviewBaseDto {
  worker!: {
    id: string;
    name: string;
    profileImage?: string;
  };
  static async fromEntity(
    entity: ReviewListItem,
    storageService: IStorageService
  ): Promise<ReviewUserDto> {
    const dto = new ReviewUserDto();
    Object.assign(dto, ReviewUserDto.baseMap(entity));
    const worker = entity.workerId;

    dto.worker = {
      id: worker._id.toString(),
      name: entity.bookingId.snapshot.worker.name,
      profileImage: worker.profileImage
        ? await resolveStorageUrl(worker.profileImage, storageService)
        : undefined,
    };
    return dto;
  }
  static async fromEntities(
    entities: ReviewListItem[],
    storageService: IStorageService
  ): Promise<ReviewUserDto[]> {
    return Promise.all(entities.map((entity) => this.fromEntity(entity, storageService)));
  }
}

export class ReviewWorkerDto extends ReviewBaseDto {
  user!: {
    id: string;
    name: string;
    profileImage?: string;
  };
  static async fromEntity(
    entity: ReviewListItem,
    storageService: IStorageService
  ): Promise<ReviewWorkerDto> {
    const dto = new ReviewWorkerDto();
    Object.assign(dto, ReviewWorkerDto.baseMap(entity));
    const user = entity.userId;

    dto.user = {
      id: user._id.toString(),
      name: entity.bookingId.snapshot.user.name,
      profileImage: user.profileImage
        ? await resolveStorageUrl(user.profileImage, storageService)
        : undefined,
    };
    return dto;
  }
  static async fromEntities(
    entities: ReviewListItem[],
    storageService: IStorageService
  ): Promise<ReviewWorkerDto[]> {
    return Promise.all(entities.map((entity) => this.fromEntity(entity, storageService)));
  }
}

export class ReviewAdminDto extends ReviewBaseDto {
  isHidden!: boolean;
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
  static async fromEntity(
    entity: ReviewListItem,
    storageService: IStorageService
  ): Promise<ReviewAdminDto> {
    const dto = new ReviewAdminDto();
    Object.assign(dto, ReviewAdminDto.baseMap(entity));
    const user = entity.userId;
    const worker = entity.workerId;
    const snapshot = entity.bookingId.snapshot;

    dto.isHidden = entity.isHidden;
    dto.worker = {
      id: worker._id.toString(),
      name: snapshot.worker.name,
      profileImage: worker.profileImage
        ? await resolveStorageUrl(worker.profileImage, storageService)
        : undefined,
    };
    dto.user = {
      id: user._id.toString(),
      name: snapshot.user.name,
      profileImage: user.profileImage
        ? await resolveStorageUrl(user.profileImage, storageService)
        : undefined,
    };
    return dto;
  }
  static async fromEntities(
    entities: ReviewListItem[],
    storageService: IStorageService
  ): Promise<ReviewAdminDto[]> {
    return Promise.all(entities.map((entity) => this.fromEntity(entity, storageService)));
  }
}

export class WorkerReviewStatsDto {
  averageRating!: number;
  reviewCount!: number;
  breakdown!: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };

  static fromEntity(entity: IReviewStats | null): WorkerReviewStatsDto {
    const dto = new WorkerReviewStatsDto();
    dto.averageRating = entity?.averageRating ?? 0;
    dto.reviewCount = entity?.reviewCount ?? 0;
    dto.breakdown = entity?.breakdown ?? {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };
    return dto;
  }
}
