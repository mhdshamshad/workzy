import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import { CATEGORY, HTTPSTATUS, REDIS_EXPIRY_SECONDS } from "@/constants";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { ICategoryService } from "@/core/interfaces/services/ICategoryService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { TYPES } from "@/di/types";
import { CategoryResponseDTO } from "@/dtos/responses/admin/category.response.dto";
import {
  CategoryAncestorResponseDTO,
  CategoryLiteDTO,
  CategoryServicesResponseDTO,
  CategorySuggestionResponseDTO,
  CategoryTrendingResponseDTO,
  PublicCategoryResponseDTO,
} from "@/dtos/responses/category.dto";
import { ICategory, PublicCategoriesParams } from "@/types/category";
import { buildCategoryFilter } from "@/utils/admin/filters/buildCategoryFilter";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject(TYPES.CategoryRepository) private _categoryRepository: ICategoryRepository,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}

  async getCategories(
    page: number,
    limit: number,
    search: string,
    status: string,
    parentId: string | null
  ): Promise<{ categories: CategoryResponseDTO[]; total: number }> {
    const cacheKey = `categories:list:${parentId || "root"}:${status}:${page}:${limit}:${search || "all"}`;

    const cachedData = await this._redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
      throw new CustomError("Invalid ParentId", HTTPSTATUS.BAD_REQUEST);
    }

    const skip = (page - 1) * limit;
    const query = buildCategoryFilter(search, status, parentId);

    const [categoriesRow, total] = await Promise.all([
      this._categoryRepository.getAllCategories(skip, limit, search, status, parentId),
      this._categoryRepository.countDocuments(query),
    ]);

    const categories = CategoryResponseDTO.fromEntities(categoriesRow as ICategory[]);
    const response = { categories, total };
    await this._redisService.set(cacheKey, JSON.stringify(response));

    return response;
  }

  async getCategoryById(categoryId: string): Promise<CategoryResponseDTO> {
    const category = await getEntityOrThrow(
      this._categoryRepository,
      categoryId,
      CATEGORY.NOT_FOUND
    );
    return CategoryResponseDTO.fromEntity(category);
  }

  async getCategoryAncestors(categoryId: string): Promise<CategoryAncestorResponseDTO[]> {
    const ancestors = await this._categoryRepository.findAncestors(categoryId);
    return CategoryAncestorResponseDTO.fromEntities(ancestors);
  }

  async getCategoriesByLevel(level: number, parentId: string | null): Promise<CategoryLiteDTO[]> {
    if (![1, 2, 3].includes(level)) {
      throw new CustomError(CATEGORY.INVALID_LEVEL, HTTPSTATUS.BAD_REQUEST);
    }

    if ((level === 1 && parentId !== null) || (level > 1 && !parentId)) {
      throw new CustomError(CATEGORY.MISS_MATCH);
    }
    if (parentId) {
      const parent = await getEntityOrThrow(this._categoryRepository, parentId);
      if (parent.level !== level - 1) {
        throw new CustomError(CATEGORY.INVALID_LEVEL);
      }
    }
    const categories = await this._categoryRepository.findCategoriesByLevel(level, parentId);
    return CategoryLiteDTO.fromEntities(categories);
  }

  async getCategorySuggestions(
    search: string,
    limit: number
  ): Promise<CategorySuggestionResponseDTO[]> {
    if (!search.trim()) return [];
    const categories = await this._categoryRepository.findSuggestions(search, limit);
    return CategorySuggestionResponseDTO.fromEntities(categories);
  }

  async getTrendingCategories(limit: number): Promise<CategoryTrendingResponseDTO[]> {
    const cacheKey = `categories:trending:${limit}`;

    const cachedData = await this._redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const categoriesFiltered = await this._categoryRepository.findCategoriesByLevel(1, null);
    const response = CategoryTrendingResponseDTO.fromEntities(categoriesFiltered.slice(0, limit));

    await this._redisService.set(cacheKey, JSON.stringify(response), 600);
    return response;
  }

  async getPublicCategories(
    filters: PublicCategoriesParams
  ): Promise<{ categories: PublicCategoryResponseDTO[]; nextCursor: string | null }> {
    const { categoryId, sortBy, limit, cursor } = filters;

    const cacheKey = `public:services:${categoryId || "all"}:${limit}:${sortBy || "newest"}:${cursor || "none"}`;
    const cachedData = await this._redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const { data, nextCursor } = await this._categoryRepository.findPublicCategories(filters);
    const categories = PublicCategoryResponseDTO.fromEntities(data);
    const response = { categories, nextCursor };
    await this._redisService.set(cacheKey, JSON.stringify(response), REDIS_EXPIRY_SECONDS);

    return response;
  }

  async getServicesByCategory(
    categoryId: string,
    limit: number
  ): Promise<CategoryServicesResponseDTO[]> {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new CustomError("Invalid categoryId", HTTPSTATUS.BAD_REQUEST);
    }
    const categories = await this._categoryRepository.findServicesByCategory(categoryId, limit);
    return CategoryServicesResponseDTO.fromEntities(categories);
  }
}
