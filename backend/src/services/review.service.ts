import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import {
  AUTH,
  BOOKING,
  BOOKING_STATUS,
  HTTPSTATUS,
  REDIS_EXPIRY_SECONDS,
  REVIEW,
} from "@/constants";
import { IBookingRepository } from "@/core/interfaces/repositories/IBookingRepository";
import { IReviewRepository } from "@/core/interfaces/repositories/IReviewRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IReviewService } from "@/core/interfaces/services/IReviewService";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { IUnitOfWork } from "@/core/interfaces/services/IUnitOfWork";
import { TYPES } from "@/di/types";
import { CreateReviewDto, UpdateReviewDto, ReviewReplyDto } from "@/dtos/requests/review.dto";
import {
  ReviewAdminDto,
  ReviewWorkerDto,
  ReviewResponseDto,
  ReviewUserDto,
  WorkerReviewStatsDto,
} from "@/dtos/responses/review.dto";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { ReviewListQuery, ReviewListQueryInput } from "@/types/review/review.query";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject(TYPES.ReviewRepository) private _reviewRepo: IReviewRepository,
    @inject(TYPES.BookingRepository) private _bookingRepo: IBookingRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.StorageService) private _storageService: IStorageService,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.UnitOfWork) private _unitOfWork: IUnitOfWork
  ) {}

  async createReview(userId: string, reviewData: CreateReviewDto): Promise<ReviewResponseDto> {
    const { bookingId, rating, reviewText, media } = reviewData;
    const booking = await getEntityOrThrow(this._bookingRepo, bookingId, BOOKING.NOT_FOUND);
    const { status, reviewId, workerId, serviceId, categoryId } = booking;
    if (userId !== booking.userId.toString()) {
      throw new CustomError(AUTH.UNAUTHORIZED, HTTPSTATUS.UNAUTHORIZED);
    }
    if (status !== BOOKING_STATUS.COMPLETED && status !== BOOKING_STATUS.APPROVED) {
      throw new CustomError(REVIEW.INVALID_BOOKING_STATUS, HTTPSTATUS.BAD_REQUEST);
    }
    if (reviewId) {
      throw new CustomError(REVIEW.ALREADY_EXISTS, HTTPSTATUS.BAD_REQUEST);
    }
    const review = await this._reviewRepo.create({
      bookingId: new Types.ObjectId(booking._id),
      userId: booking.userId,
      workerId: workerId,
      serviceId: serviceId,
      categoryId: categoryId,
      rating,
      reviewText,
      media,
      createdAt: new Date(),
    });

    await this._unitOfWork.execute(async (options) => {
      await this._bookingRepo.findByIdAndUpdate(
        bookingId,
        { hasVisibleReview: true, reviewId: review._id },
        options
      );
      await this._workerRepository.incrementRating(workerId.toString(), rating);
    });

    await this._redisService.clearPattern("reviews");
    return ReviewResponseDto.fromEntity(review);
  }

  async updateReview(reviewId: string, updateData: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await getEntityOrThrow(this._reviewRepo, reviewId, REVIEW.NOT_FOUND);
    const oldUrls = review.media?.map((m) => m.url) ?? [];
    const newUrls = updateData.media?.map((m) => m.url) ?? [];

    const removedUrls = oldUrls.filter((url) => !newUrls.includes(url));
    const updated = await this._reviewRepo.update(reviewId, {
      ...updateData,
      isEdited: true,
    });
    if (updateData.rating && updateData.rating !== review.rating) {
      await this._workerRepository.adjustRating(
        String(review.workerId),
        review.rating,
        updateData.rating
      );
    }
    if (!updated) {
      throw new CustomError(REVIEW.UPDATE_ERROR, HTTPSTATUS.BAD_REQUEST);
    }
    await this._redisService.clearPattern("reviews");
    if (removedUrls.length > 0) {
      void Promise.allSettled(removedUrls.map((url) => this._storageService.deleteFile(url))).then(
        () => {}
      );
    }
    return ReviewResponseDto.fromEntity(updated);
  }

  async getReviewById(reviewId: string): Promise<ReviewResponseDto> {
    const review = await this._reviewRepo.findById(reviewId);
    if (!review) {
      throw new CustomError("review not found", HTTPSTATUS.BAD_REQUEST);
    }
    return ReviewResponseDto.fromEntity(review);
  }

  async addReplyToReview(
    reviewId: string,
    data: ReviewReplyDto,
    workerId: string
  ): Promise<ReviewResponseDto> {
    const review = await this._reviewRepo.findOneAndUpdate(
      {
        _id: new Types.ObjectId(reviewId),
        workerId: new Types.ObjectId(workerId),
      },
      {
        reply: {
          message: data.message,
          repliedAt: new Date(),
        },
      }
    );
    if (!review) {
      throw new CustomError(REVIEW.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    await this._redisService.clearPattern("reviews");
    return ReviewResponseDto.fromEntity(review);
  }

  async toggleReviewVisibility(reviewId: string): Promise<string> {
    const review = await getEntityOrThrow(this._reviewRepo, reviewId, REVIEW.NOT_FOUND);
    const newStatus = !review.isHidden;

    await this._unitOfWork.execute(async (options) => {
      await this._reviewRepo.update(reviewId, { isHidden: newStatus }, options);
      await this._bookingRepo.update(
        review.bookingId.toString(),
        { hasVisibleReview: !newStatus },
        options
      );
      if (newStatus) {
        await this._workerRepository.decrementRating(review.workerId.toString(), review.rating);
      } else {
        await this._workerRepository.incrementRating(review.workerId.toString(), review.rating);
      }
    });
    await this._redisService.clearPattern("reviews");
    return newStatus ? REVIEW.HIDDEN : REVIEW.UNHIDDEN;
  }

  async listReviews(input: ReviewListQuery): Promise<CursorPaginatedResult<ReviewAdminDto>> {
    const { data, nextCursor } = await this._reviewRepo.getAllReviews(input);
    return {
      data: await ReviewAdminDto.fromEntities(data, this._storageService),
      nextCursor,
    };
  }

  async getUserReviews(
    userId: string,
    input: ReviewListQueryInput
  ): Promise<CursorPaginatedResult<ReviewUserDto>> {
    const { limit, cursor, rating, sortBy, sortOrder, status } = input;
    const cacheKey = `reviews:${userId}:${status}:${limit}:${cursor ?? "first"}:${sortBy}:${sortOrder}:${rating ?? "all"}`;
    const cachedData = await this._redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const { data, nextCursor } = await this._reviewRepo.getAllReviews({
      userId,
      ...input,
    });
    const response = {
      data: await ReviewUserDto.fromEntities(data, this._storageService),
      nextCursor,
    };
    await this._redisService.set(cacheKey, JSON.stringify(response), REDIS_EXPIRY_SECONDS);
    return response;
  }

  async getWorkerReviews(
    workerId: string,
    input: ReviewListQueryInput
  ): Promise<CursorPaginatedResult<ReviewWorkerDto>> {
    const { limit, cursor, rating, sortBy, sortOrder, status } = input;
    const cacheKey = `reviews:${workerId}:${status}:${limit}:${cursor ?? "first"}:${sortBy}:${sortOrder}:${rating ?? "all"}`;
    const cachedData = await this._redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const { data, nextCursor } = await this._reviewRepo.getAllReviews({
      workerId,
      ...input,
    });
    const response = {
      data: await ReviewWorkerDto.fromEntities(data, this._storageService),
      nextCursor,
    };
    await this._redisService.set(cacheKey, JSON.stringify(response), REDIS_EXPIRY_SECONDS);
    return response;
  }

  async getWorkerReviewStats(workerId: string): Promise<WorkerReviewStatsDto> {
    const reviews = await this._workerRepository.getWorkerReviewStats(workerId);
    return WorkerReviewStatsDto.fromEntity(reviews);
  }
}
