import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import {
  CATEGORY,
  DOCUMENT_STATUS,
  HTTPSTATUS,
  REDIS_EXPIRY_SECONDS,
  SERVICE,
  SERVICE_TYPE,
  WORKER,
} from "@/constants";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { IServiceRepository } from "@/core/interfaces/repositories/IServiceRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IServiceManagement } from "@/core/interfaces/services/IServiceManagement";
import { TYPES } from "@/di/types";
import { ServiceRequestDTO } from "@/dtos/requests/service.dto";
import { PublicServiceListResponseDto, ServiceResponseDto } from "@/dtos/responses/service.dto";
import { CategoryOption, ICategory } from "@/types/category";
import { CursorPaginatedResult } from "@/types/common/pagination";
import { PublicServiceListQuery, ServiceListQuery } from "@/types/service/service.query";
import { IWorkerDocument } from "@/types/worker/worker.entity";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";
import { formatDuration } from "@/utils/time.convert";

@injectable()
export class ServiceManagement implements IServiceManagement {
  constructor(
    @inject(TYPES.CategoryRepository) private _categoryRepository: ICategoryRepository,
    @inject(TYPES.ServiceRepository) private _serviceRepository: IServiceRepository,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository
  ) {}

  async createService(workerId: string, data: ServiceRequestDTO): Promise<ServiceResponseDto> {
    const { parentCategoryId, categoryId, ...rest } = data;
    const [isAlredyExists, category, parentCategory, worker] = await Promise.all([
      this._serviceRepository.findOne({ workerId, categoryId: categoryId }),
      getEntityOrThrow(this._categoryRepository, categoryId, CATEGORY.NOT_FOUND),
      getEntityOrThrow(this._categoryRepository, parentCategoryId, CATEGORY.NOT_FOUND),
      getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND),
    ]);

    if (isAlredyExists) {
      throw new CustomError(SERVICE.ALREADY_EXISTS, HTTPSTATUS.CONFLICT);
    }
    if (!category) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }

    this.validateCategoryDocuments(worker.documents, category, parentCategory);
    this.validateServiceRate(category, data.rate);
    this.validateServiceTiming(category, data);

    const service = await this._serviceRepository.create({
      ...rest,
      workerId: new Types.ObjectId(workerId),
      categoryId: category.id,
    });
    const [serviceData] = await Promise.all([
      this._serviceRepository.getServiceById(service._id),
      this._redisService.clearPattern(`worker:${workerId}:services`),
    ]);

    if (!serviceData) {
      throw new CustomError(SERVICE.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    return ServiceResponseDto.fromEntity(serviceData);
  }

  async updateService(
    workerId: string,
    serviceId: string,
    data: ServiceRequestDTO
  ): Promise<ServiceResponseDto> {
    const { parentCategoryId, categoryId, ...rest } = data;
    const [service, category, parentCategory, worker] = await Promise.all([
      await getEntityOrThrow(this._serviceRepository, serviceId, SERVICE.NOT_FOUND),
      getEntityOrThrow(this._categoryRepository, categoryId, CATEGORY.NOT_FOUND),
      getEntityOrThrow(this._categoryRepository, parentCategoryId, CATEGORY.NOT_FOUND),
      getEntityOrThrow(this._workerRepository, workerId, WORKER.NOT_FOUND),
    ]);

    if (!service.workerId.equals(workerId)) {
      throw new CustomError(WORKER.UNAUTHORIZED, HTTPSTATUS.FORBIDDEN);
    }

    this.validateCategoryDocuments(worker.documents, category, parentCategory);
    this.validateServiceRate(category, data.rate);
    this.validateServiceTiming(category, data);

    const updatedService = await this._serviceRepository.findByIdAndUpdate(serviceId, { ...rest });
    const [serviceData] = await Promise.all([
      this._serviceRepository.getServiceById(service?._id),
      this._redisService.clearPattern(`worker:${workerId}:services`),
    ]);
    if (!updatedService || !serviceData) {
      throw new CustomError(SERVICE.UPDATE_ERROR, HTTPSTATUS.NOT_FOUND);
    }
    return ServiceResponseDto.fromEntity(serviceData);
  }

  async updateServiceStatus(
    workerId: string,
    serviceId: string
  ): Promise<{ message: string; newStatus: boolean }> {
    const service = await getEntityOrThrow(this._serviceRepository, serviceId, SERVICE.NOT_FOUND);

    if (!service.workerId.equals(workerId)) {
      throw new CustomError(WORKER.UNAUTHORIZED, HTTPSTATUS.FORBIDDEN);
    }
    const newStatus = !service.isAvailable;

    await this._serviceRepository.update(service.id, { isAvailable: newStatus });
    const message = newStatus ? SERVICE.UNBLOCKED : SERVICE.BLOCKED;
    await this._redisService.clearPattern(`worker:${workerId}:services`);
    return { newStatus, message };
  }

  private validateServiceRate(category: ICategory, rate: number): void {
    const { baseRate, priceVarianceLimit } = category;
    const deviation = (baseRate * priceVarianceLimit) / 100;
    const minPrice = baseRate - deviation;
    const maxPrice = baseRate + deviation;
    if (rate < minPrice || rate > maxPrice) {
      throw new CustomError(SERVICE.PRICE_OUT_OF_RANGE, HTTPSTATUS.BAD_REQUEST);
    }
  }

  private validateCategoryDocuments(
    documents: IWorkerDocument[] = [],
    category: ICategory,
    parentCategory: ICategory
  ): void {
    const requiredDocTypes = Array.from(
      new Set([
        ...(parentCategory?.requiredDocuments || []),
        ...(category?.requiredDocuments || []),
      ])
    );

    if (requiredDocTypes.length === 0) {
      return;
    }
    const missingDocs = requiredDocTypes.filter((docType) => {
      const doc = documents.find((d) => d.type === docType);
      return !doc || doc.status !== DOCUMENT_STATUS.VERIFIED;
    });

    if (missingDocs.length > 0) {
      throw new CustomError(
        `Missing required verified documents for this service category: ${missingDocs.join(", ")}`,
        HTTPSTATUS.BAD_REQUEST
      );
    }
  }

  private validateServiceTiming(category: ICategory, data: ServiceRequestDTO): void {
    const { estimatedDuration, bufferTime } = data;

    const baseDuration = category.estimatedDuration ?? 60;
    const minDuration = Math.ceil(baseDuration * 0.7);
    const maxDuration = Math.floor(baseDuration * 1.5);

    if (estimatedDuration < minDuration || estimatedDuration > maxDuration) {
      throw new CustomError(
        SERVICE.DURATION_OUT_OF_RANGE(formatDuration(minDuration), formatDuration(maxDuration)),
        HTTPSTATUS.BAD_REQUEST
      );
    }
    if (category.serviceType === SERVICE_TYPE.INSPECTION && bufferTime < 15) {
      throw new CustomError(SERVICE.INSPECTION_MIN_BUFFER(15), HTTPSTATUS.BAD_REQUEST);
    }
    if (bufferTime > estimatedDuration) {
      throw new CustomError(SERVICE.BUFFER_EXCEEDS_DURATION, HTTPSTATUS.BAD_REQUEST);
    }
    const categoryBuffer = category.bufferTime;
    if (categoryBuffer && categoryBuffer > 0 && bufferTime > categoryBuffer * 2) {
      throw new CustomError(
        SERVICE.BUFFER_EXCEEDS_CATEGORY_DEFAULT(formatDuration(categoryBuffer * 2)),
        HTTPSTATUS.BAD_REQUEST
      );
    }
  }

  async listWorkerPublicServices(
    workerId: string,
    query: PublicServiceListQuery
  ): Promise<CursorPaginatedResult<PublicServiceListResponseDto>> {
    const { data, nextCursor } = await this._serviceRepository.listWorkerPublicServices(
      workerId,
      query
    );
    return {
      data: PublicServiceListResponseDto.fromEntities(data),
      nextCursor,
    };
  }

  async getWorkerServices(
    workerId: string,
    query: ServiceListQuery
  ): Promise<CursorPaginatedResult<ServiceResponseDto>> {
    const { limit, status, categoryId, cursor, search } = query;
    const cacheKey = `worker:${workerId}:services:${cursor?._id}:${cursor?.createdAt}:${limit}:${search}:${status}:${categoryId}`;
    const cached = await this._redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const { data, nextCursor } = await this._serviceRepository.listWorkerServices(workerId, query);
    const result = { nextCursor, data: ServiceResponseDto.fromEntities(data) };
    await this._redisService.set(cacheKey, JSON.stringify(result), REDIS_EXPIRY_SECONDS);
    return result;
  }

  async getWorkerServiceCategories(workerId: string): Promise<CategoryOption[]> {
    return this._serviceRepository.getWorkerServiceCategories(workerId);
  }
}
