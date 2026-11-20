import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import { CATEGORY, HTTPSTATUS } from "@/constants";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { ICategoryManagementService } from "@/core/interfaces/services/admin/ICategoryManagementService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IStorageService } from "@/core/interfaces/services/IStorageService";
import { TYPES } from "@/di/types";
import { CategoryRequestDTO } from "@/dtos/requests/category.dto";
import { CategoryResponseDTO } from "@/dtos/responses/admin/category.response.dto";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class CategoryManagementService implements ICategoryManagementService {
  constructor(
    @inject(TYPES.CategoryRepository) private _categoryRepository: ICategoryRepository,
    @inject(TYPES.StorageService) private _storageService: IStorageService,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}

  async createCategory(data: CategoryRequestDTO): Promise<CategoryResponseDTO> {
    const { parentId, ...rest } = data;

    const isAlreadyExists = await this._categoryRepository.findOne({
      name: data.name,
      parentId: parentId || null,
    });

    if (isAlreadyExists) {
      throw new CustomError(CATEGORY.EXISTS, HTTPSTATUS.FORBIDDEN);
    }

    const sanitizedData = this.sanitizeByLevel(rest);

    const parentObjectId = await this.validateAndResolveParent(parentId || null, data.level);

    const newCategory = await this._categoryRepository.create({
      ...sanitizedData,
      parentId: parentObjectId,
    });
    await this._redisService.clearPattern("categories:list");
    return CategoryResponseDTO.fromEntity(newCategory);
  }

  async updateCategory(categoryId: string, data: CategoryRequestDTO): Promise<CategoryResponseDTO> {
    const { parentId, ...rest } = data;

    const [category, isAlreadyExists] = await Promise.all([
      getEntityOrThrow(this._categoryRepository, categoryId, CATEGORY.NOT_FOUND),
      this._categoryRepository.findOne({
        name: data.name,
        parentId: parentId || null,
        _id: { $ne: new mongoose.Types.ObjectId(categoryId) },
      }),
    ]);

    if (isAlreadyExists) {
      throw new CustomError(CATEGORY.EXISTS, HTTPSTATUS.FORBIDDEN);
    }
    const removedUrls: string[] = [];

    if (category.imageUrl !== data.imageUrl) {
      removedUrls.push(category.imageUrl);
    }
    if (category.iconUrl !== data.iconUrl) {
      removedUrls.push(category.iconUrl);
    }

    const parentObjectId = await this.validateAndResolveParent(parentId || null, category.level);
    const sanitizedData = this.sanitizeByLevel(rest);

    const updatedCategory = await this._categoryRepository.update(categoryId, {
      ...sanitizedData,
      parentId: parentObjectId,
    });
    if (!updatedCategory) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    if (removedUrls.length > 0) {
      void Promise.allSettled(removedUrls.map((url) => this._storageService.deleteFile(url)));
    }
    await this._redisService.clearPattern("categories:list");
    return CategoryResponseDTO.fromEntity(updatedCategory);
  }

  async toggleCategoryStatus(categoryId: string): Promise<{ message: string; newStatus: boolean }> {
    const category = await getEntityOrThrow(
      this._categoryRepository,
      categoryId,
      CATEGORY.NOT_FOUND
    );
    const newStatus = !category.isAvailable;

    const updatedCategory = await this._categoryRepository.update(category.id, {
      isAvailable: newStatus,
    });
    if (!updatedCategory) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    const message = updatedCategory.isAvailable ? CATEGORY.UNBLOCKED : CATEGORY.BLOCKED;
    await this._redisService.clearPattern("categories:list");

    return { newStatus, message };
  }

  private async validateAndResolveParent(
    parentId: string | null,
    level: number
  ): Promise<mongoose.Types.ObjectId | null> {
    if (!parentId) {
      return null;
    }

    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }

    const parentCategory = await this._categoryRepository.findById(parentId);
    if (!parentCategory) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }

    if (level !== parentCategory.level + 1) {
      throw new CustomError(CATEGORY.INVALID_LEVEL, HTTPSTATUS.BAD_REQUEST);
    }
    return new mongoose.Types.ObjectId(parentId);
  }

  private sanitizeByLevel(data: Partial<CategoryRequestDTO>): Partial<CategoryRequestDTO> {
    if (!data.parentId) return data;

    const {
      serviceType: _serviceType,
      pricingMode: _pricingMode,
      allowSuddenBooking: _allowSuddenBooking,
      allowBulkOffers: _allowBulkOffers,
      travelRatePerKM: _travelRatePerKM,
      bufferTime: _bufferTime,
      estimatedDuration: _estimatedDuration,
      priceVarianceLimit: _rateDeviationPercent,
      ...sanitized
    } = data;

    return sanitized;
  }
}
