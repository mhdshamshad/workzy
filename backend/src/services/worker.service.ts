import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import {
  DEFAULT_WORKER_COVER_IMAGE,
  DOCUMENT_STATUS,
  HTTPSTATUS,
  NOTIFICATION_TEMPLATES,
  ROLE,
  StripeAccountStatus,
  UPCOMING_BOOKING_STATUSES,
  WORKER,
  WORKER_JOIN_DOCUMENT_KEY_MAP,
  WORKER_STATUS,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IUserRepository } from "@/core/interfaces/repositories/IUserRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { INotificationService } from "@/core/interfaces/services/INotificationService";
import { IPaymentService } from "@/core/interfaces/services/IPaymentService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { IWorkerService } from "@/core/interfaces/services/IWorkerService";
import { TYPES } from "@/di/types";
import {
  WorkerDocumentReviewRequestDTO,
  WorkerReviewRequestDTO,
} from "@/dtos/requests/admin/worker-review.dto";
import { JoinUsDTO } from "@/dtos/requests/joinUs.dto";
import { WorkerProfileRequestDto } from "@/dtos/requests/worker.profile.dto";
import { WorkerListResponseDto } from "@/dtos/responses/admin/worker.dto";
import { PublicWorkerListResponseDto } from "@/dtos/responses/worker/worker-public.response.dto";
import { NearbyWorkerResponseDTO } from "@/dtos/responses/worker/worker.nearby.response.dto";
import {
  WorkerDetailsResponseDto,
  WorkerProfileResponseDTO,
} from "@/dtos/responses/worker/worker.profile.dto";
import { CursorPaginatedResult, PaginatedResult } from "@/types/common/pagination";
import { IWorker, IWorkerDocument } from "@/types/worker/worker.entity";
import { WorkerStatsSummary } from "@/types/worker/worker.projection";
import {
  NearbyWorkerListQuery,
  PublicWorkerListQuery,
  WorkerListQuery,
} from "@/types/worker/worker.query";
import { WorkerDashboardAnalytics } from "@/types/worker/workerDashboard.types";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";
import { extractKeyFromUrl } from "@/utils/upload";

@injectable()
export class WorkerService implements IWorkerService {
  constructor(
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.BookingRepository) private _bookingRepository: IBookingRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.S3Service) private _s3Service: IS3Service,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.PaymentService) private _paymentservice: IPaymentService,
    @inject(TYPES.NotificationService) private _notificationService: INotificationService
  ) {}

  getWorkerByUserId = async (userId: string): Promise<IWorker | null> => {
    return this._workerRepository.getWorkerByUserId(userId);
  };

  // worker listing - admin side
  async listWorkers(query: WorkerListQuery): Promise<PaginatedResult<WorkerListResponseDto>> {
    const { data, total } = await this._workerRepository.listWorkers(query);
    return {
      data: WorkerListResponseDto.fromEntities(data),
      total,
    };
  }

  async listNearbyWorkers(query: NearbyWorkerListQuery): Promise<NearbyWorkerResponseDTO[]> {
    const workers = await this._workerRepository.listNearbyWorkers(query);
    return NearbyWorkerResponseDTO.fromEntities(workers);
  }

  async listPublicWorkers(
    serviceId: string,
    query: PublicWorkerListQuery
  ): Promise<CursorPaginatedResult<PublicWorkerListResponseDto>> {
    const { data, nextCursor } = await this._workerRepository.listPublicWorkers(serviceId, query);
    return {
      data: PublicWorkerListResponseDto.fromEntities(data),
      nextCursor,
    };
  }

  async getWorkerProfile(workerId: string): Promise<WorkerProfileResponseDTO> {
    const worker = await this._workerRepository.getWorkerProfile(workerId);
    if (!worker) {
      throw new CustomError(WORKER.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    return WorkerProfileResponseDTO.fromEntity(worker);
  }

  async getWorkerProfileDetails(workerId: string): Promise<WorkerDetailsResponseDto> {
    const worker = await this._workerRepository.findById(workerId);
    if (!worker) {
      throw new CustomError(WORKER.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    return WorkerDetailsResponseDto.fromEntity(worker, this._s3Service);
  }

  async updateWorkerProfile(
    workerId: string,
    data: WorkerProfileRequestDto
  ): Promise<WorkerDetailsResponseDto> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);
    const { coverImage } = data;
    if (coverImage === DEFAULT_WORKER_COVER_IMAGE || coverImage === null) {
      data.coverImage = null;
    }
    const updatedWorker = await this._workerRepository.update(workerId, data);
    if (!updatedWorker) {
      throw new CustomError(WORKER.UPDATE_FAILED, HTTPSTATUS.BAD_REQUEST);
    }

    if (worker?.coverImage && coverImage !== worker.coverImage) {
      await this._s3Service.deleteFile(worker.coverImage);
    }
    return await WorkerDetailsResponseDto.fromEntity(updatedWorker, this._s3Service);
  }

  async updateWorkerPhone(workerId: string, phone: string): Promise<boolean> {
    const worker = await this._workerRepository.findByIdAndUpdate(workerId, { phone: phone });
    if (!worker) {
      throw new CustomError(WORKER.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    return true;
  }

  async updateProfileImage(workerId: string, url: string): Promise<string> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);

    const updateWorker = await this._workerRepository.update(workerId, { profileImage: url });
    if (!updateWorker?.profileImage) {
      throw new CustomError(WORKER.UPDATE_FAILED, HTTPSTATUS.BAD_REQUEST);
    }
    if (worker.profileImage?.includes("public/worker/profiles")) {
      await this._s3Service.deleteFile(worker.profileImage);
    }
    return updateWorker.profileImage;
  }

  async getMyWorkerProfile(userId: string): Promise<WorkerDetailsResponseDto | null> {
    const worker = await this._workerRepository.getWorkerByUserId(userId);
    if (!worker) {
      return null;
    }
    return await WorkerDetailsResponseDto.fromEntity(worker, this._s3Service);
  }

  async createWorkerProfile(userId: string, data: JoinUsDTO): Promise<WorkerDetailsResponseDto> {
    const isAlredyWorker = await this._workerRepository.findOne({ userId });
    if (isAlredyWorker) {
      throw new CustomError(WORKER.ALREADY_EXISTS, HTTPSTATUS.BAD_REQUEST);
    }

    const documents: IWorkerDocument[] = Object.entries(data.documents).map(([key, url]) => ({
      type: WORKER_JOIN_DOCUMENT_KEY_MAP[key as keyof typeof WORKER_JOIN_DOCUMENT_KEY_MAP],
      url: extractKeyFromUrl(url),
      status: DOCUMENT_STATUS.PENDING,
      uploadedAt: new Date(),
    }));

    const worker = await this._workerRepository.create({
      ...data,
      userId: new Types.ObjectId(userId),
      documents,
    });

    return WorkerDetailsResponseDto.fromEntity(worker, this._s3Service);
  }

  async reSubmitWorkerDocument(
    workerId: string,
    data: JoinUsDTO
  ): Promise<WorkerDetailsResponseDto> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);
    const documents: IWorkerDocument[] = [];
    const deleteKeys: string[] = [];

    for (const [key, url] of Object.entries(data.documents)) {
      const type = WORKER_JOIN_DOCUMENT_KEY_MAP[key as keyof typeof WORKER_JOIN_DOCUMENT_KEY_MAP];
      const newKey = extractKeyFromUrl(url);
      const existing = worker.documents.find((doc) => doc.type === type);

      if (existing) {
        if (existing.url !== newKey) {
          deleteKeys.push(existing.url);
          documents.push({
            type,
            _id: existing._id,
            url: newKey,
            status: DOCUMENT_STATUS.PENDING,
            rejectReason: undefined,
            verifiedAt: undefined,
            uploadedAt: new Date(),
          });
        } else {
          documents.push(existing);
        }
      }
    }

    const updates: Partial<IWorker> = {
      displayName: data.displayName,
      tagline: data.tagline,
      about: data.about,
      experience: data.experience,
      location: data.location,
      profileImage: data.profileImage,
      phone: data.phone,
      languages: data.languages,
      documents,
      status: WORKER_STATUS.PENDING,
      rejectReason: undefined,
    };

    const updatedWorker = await this._workerRepository.findByIdAndUpdate(workerId, updates);

    if (!updatedWorker) {
      throw new CustomError(WORKER.DOCUMENT_UPDATE_ERROR);
    }

    if (deleteKeys.length > 0) {
      void Promise.allSettled(deleteKeys.map((url) => this._s3Service.deleteFile(url)));
    }

    return WorkerDetailsResponseDto.fromEntity(updatedWorker, this._s3Service);
  }

  async getStripeStatus(
    workerId: string
  ): Promise<{ status: StripeAccountStatus; stripeAccountId: string | null }> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);
    return {
      status: worker.stripeAccountStatus,
      stripeAccountId: worker.stripeAccountId ?? null,
    };
  }

  async connectStripe(workerId: string): Promise<string> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);

    if (worker.status !== WORKER_STATUS.VERIFIED) {
      throw new CustomError(WORKER.NOT_AVAILABLE, HTTPSTATUS.FORBIDDEN);
    }

    return this._paymentservice.createStripeConnectLink(worker);
  }

  async getWorkerDashboardAnalytics(workerId: string): Promise<WorkerDashboardAnalytics> {
    return await this._bookingRepository.getWorkerDashboardAnalytics(workerId);
  }

  async toggleWorkerStatus(workerId: string, reason: string): Promise<string> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);

    const isVerified = worker.status === WORKER_STATUS.VERIFIED;

    if (worker.status !== WORKER_STATUS.SUSPENDED && !isVerified) {
      throw new CustomError(WORKER.INVALID_STATUS_TOGGLE, HTTPSTATUS.FORBIDDEN);
    }
    const newStatus = isVerified ? WORKER_STATUS.SUSPENDED : WORKER_STATUS.VERIFIED;
    const updated = await this._workerRepository.updateWorkerStatus(workerId, newStatus, reason);
    if (isVerified) {
      await this._redisService.set(`blocked_user:${worker.userId.toString()}`, "1");
    } else {
      await this._redisService.delete(`blocked_user:${worker.userId.toString()}`);
    }

    if (!updated) {
      throw new CustomError(WORKER.STATUS_UPDATE_FAILED, HTTPSTATUS.INTERNAL_SERVER_ERROR);
    }
    const message = isVerified ? WORKER.BLOCK_SUCCESS : WORKER.UNBLOCK_SUCCESS;

    void this._notificationService.createNotification(
      workerId,
      isVerified
        ? NOTIFICATION_TEMPLATES.ACCOUNT_BLOCKED()
        : NOTIFICATION_TEMPLATES.ACCOUNT_UNBLOCKED()
    );

    return message;
  }

  async getWorkerStats(workerId: string): Promise<WorkerStatsSummary> {
    const [worker, revenue, upcomingBookings] = await Promise.all([
      getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND),
      this._bookingRepository.getWorkerRevenueStats(workerId),
      this._bookingRepository.countDocuments({
        workerId: new Types.ObjectId(workerId),
        status: UPCOMING_BOOKING_STATUSES,
      }),
    ]);
    const {
      jobStats: { completed, accepted, offered },
      reviewStats,
    } = worker;
    const { grossRevenue, platformRevenue, workerEarnings } = revenue;
    return {
      totalBookings: offered,
      completedBookings: completed,
      completionRate: accepted > 0 ? Number(((completed / accepted) * 100).toFixed(1)) : 0,
      upcomingBookings,
      totalReviews: reviewStats.reviewCount,
      rating: reviewStats.averageRating,
      grossRevenue,
      platformRevenue,
      workerEarnings,
    };
  }

  async reviewWorker(
    workerId: string,
    data: WorkerReviewRequestDTO
  ): Promise<WorkerDetailsResponseDto> {
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);
    const { documents, status, rejectReason } = data;

    const allVerified = documents.every((doc) => doc.status === DOCUMENT_STATUS.VERIFIED);

    if (!allVerified && status === WORKER_STATUS.VERIFIED) {
      throw new CustomError("the documents are should be verified ");
    }

    const updatedDocuments = worker.documents.map((existingDoc) => {
      const incoming = documents.find((doc) => doc.id === existingDoc._id?.toString());
      if (!incoming) return existingDoc;

      return {
        _id: existingDoc._id,
        type: existingDoc.type,
        uploadedAt: existingDoc.uploadedAt,
        url: existingDoc.url,
        status: incoming.status,
        rejectReason: incoming.rejectReason,
        verifiedAt:
          incoming.status === WORKER_STATUS.VERIFIED ? new Date() : existingDoc.verifiedAt,
      };
    });

    const updatedWorker = await this._workerRepository.findByIdAndUpdate(workerId, {
      status,
      rejectReason: rejectReason,
      documents: updatedDocuments,
    });
    if (!updatedWorker) {
      throw new CustomError(WORKER.VERIFY_ERROR);
    }
    if (status === WORKER_STATUS.VERIFIED) {
      await this._userRepository.findByIdAndUpdate(worker.userId.toString(), { role: ROLE.WORKER });
      void this._notificationService.createNotification(
        worker.userId.toString(),
        NOTIFICATION_TEMPLATES.WORKER_VERIFIED()
      );
    } else if (status === WORKER_STATUS.NEEDS_REVISION) {
      void this._notificationService.createNotification(
        worker.userId.toString(),
        NOTIFICATION_TEMPLATES.WORKER_REVISION(rejectReason ?? "No reason provided")
      );
    } else if (status === WORKER_STATUS.REJECTED) {
      void this._notificationService.createNotification(
        worker.userId.toString(),
        NOTIFICATION_TEMPLATES.WORKER_REJECTED(rejectReason ?? "No reason provided")
      );
    }
    return WorkerDetailsResponseDto.fromEntity(updatedWorker, this._s3Service);
  }

  async reviewWorkerDocument(
    workerId: string,
    documentId: string,
    data: WorkerDocumentReviewRequestDTO
  ): Promise<WorkerDetailsResponseDto> {
    const { status, rejectReason } = data;
    const worker = await getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND);
    const document = worker.documents.find((doc) => doc._id?.toString() === documentId);

    if (!document) {
      throw new CustomError(WORKER.DOCUMENT_NOTFOUND);
    }
    const isVerified = status === DOCUMENT_STATUS.VERIFIED;
    const isRejected = status === DOCUMENT_STATUS.REJECTED;

    if (document.status === DOCUMENT_STATUS.VERIFIED) {
      throw new CustomError(WORKER.DOCUMENT_ALREADY_VERIFIED);
    }
    if (document.status === DOCUMENT_STATUS.REJECTED) {
      throw new CustomError(WORKER.DOCUMENT_ALREADY_REJECTED);
    }

    const updatedDocuments = worker.documents.map((doc) => {
      if (doc._id?.toString() === documentId) {
        return {
          _id: doc._id,
          type: doc.type,
          url: doc.url,
          uploadedAt: doc.uploadedAt,
          verifiedAt: isVerified ? new Date() : doc.verifiedAt,
          status: data.status,
          rejectReason: data.rejectReason,
        };
      }
      return doc;
    });

    const updatedWorker = await this._workerRepository.findByIdAndUpdate(workerId, {
      documents: updatedDocuments,
    });

    if (!updatedWorker) {
      throw new CustomError(WORKER.DOCUMENT_UPDATE_ERROR);
    }

    void this._notificationService.createNotification(
      worker.userId.toString(),
      isVerified
        ? NOTIFICATION_TEMPLATES.WORKER_DOCUMENT_VERIFIED(document.type)
        : isRejected
          ? NOTIFICATION_TEMPLATES.WORKER_DOCUMENT_REJECTED(
              document.type,
              rejectReason ?? "No reason provided"
            )
          : NOTIFICATION_TEMPLATES.WORKER_DOCUMENT_IN_REVIEW(document.type)
    );
    return await WorkerDetailsResponseDto.fromEntity(updatedWorker, this._s3Service);
  }
}
