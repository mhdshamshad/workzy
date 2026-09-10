import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import { HOME_SECTION, HTTPSTATUS, PURPOSE_POLICY, REFRESH_TOKEN_TTL_SECONDS } from "@/constants";
import { IHomeLayoutRepository } from "@/core/interfaces/repositories/IHomeLayoutRepository";
import { IHomeSectionRepository } from "@/core/interfaces/repositories/IHomeSectionRepository";
import {
  IHomeSectionService,
  ListSectionsResult,
  ListType,
} from "@/core/interfaces/services/IHomeSectionService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { IS3Service } from "@/core/interfaces/services/IS3Service";
import { TYPES } from "@/di/types";
import {
  HomeSectionRequestDTO,
  HomeSectionUpdateRequestDTO,
} from "@/dtos/requests/admin/homeSection.dto";
import { HomeSectionResponseDTO } from "@/dtos/responses/admin/homeSection.response.dto";
import { HomeSectionDataType } from "@/types/home";
import { buildHomeSectionFilter } from "@/utils/admin/filters/homeSection.filter";
import CustomError from "@/utils/customError";
import { getEntityOrThrow } from "@/utils/getEntityOrThrow";
import { extractKeyFromUrl } from "@/utils/upload";

@injectable()
export class HomeSectionService implements IHomeSectionService {
  constructor(
    @inject(TYPES.HomeSectionRepository) private _homeSectionRepository: IHomeSectionRepository,
    @inject(TYPES.HomeLayoutRepository) private _homeLayoutRepository: IHomeLayoutRepository,
    @inject(TYPES.RedisService) private _redisService: IRedisService,
    @inject(TYPES.S3Service) private _s3Service: IS3Service
  ) {}
  async createSection(payload: HomeSectionRequestDTO): Promise<HomeSectionResponseDTO> {
    const exists = await this._homeSectionRepository.findOne({ name: payload.name });
    if (exists) {
      throw new CustomError(HOME_SECTION.EXISTS, HTTPSTATUS.FORBIDDEN);
    }

    const data = this.sanitizeHomeSectionData(
      payload.data as Record<string, unknown>
    ) as unknown as HomeSectionDataType;

    const section = await this._homeSectionRepository.create({
      name: payload.name,
      type: payload.type,
      data,
    });
    await this._redisService.clearPattern("sections:list");
    return HomeSectionResponseDTO.fromEntity(section);
  }
  async updateSection(
    sectionId: string,
    payload: HomeSectionUpdateRequestDTO
  ): Promise<HomeSectionResponseDTO> {
    const section = await getEntityOrThrow(
      this._homeSectionRepository,
      sectionId,
      HOME_SECTION.NOT_FOUND
    );

    const alreadyExist = await this._homeSectionRepository.findOne({
      name: payload.name,
      _id: { $ne: new Types.ObjectId(sectionId) },
    });
    if (alreadyExist) throw new CustomError(HOME_SECTION.EXISTS, HTTPSTATUS.FORBIDDEN);

    if (section.type !== payload.type) {
      const layout = await this._homeLayoutRepository.findOne({
        key: "HOME",
        "items.sectionId": sectionId,
      });
      if (layout) {
        throw new CustomError(HOME_SECTION.IN_LAYOUT_CANNOT_CHANGE_TYPE, HTTPSTATUS.FORBIDDEN);
      }
    }

    const newData = this.sanitizeHomeSectionData(
      payload.data as Record<string, unknown>
    ) as unknown as HomeSectionDataType;

    const oldKeys = this.extractManagedKeys(section.data);
    const newKeys = this.extractManagedKeys(newData);

    const newSet = new Set(newKeys);

    const removed = oldKeys.filter((k) => !newSet.has(k));

    const updated = await this._homeSectionRepository.update(sectionId, {
      name: payload.name,
      type: payload.type,
      data: newData,
    });

    if (!updated) {
      if (!updated) throw new CustomError(HOME_SECTION.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    await Promise.allSettled(removed.map((k) => this._s3Service.deleteFile(k)));

    await this._redisService.clearPattern("sections:list");
    await this._redisService.clearPattern("layout:admin");
    await this._redisService.clearPattern("home:public");
    return HomeSectionResponseDTO.fromEntity(updated);
  }

  async toggleStatus(sectionId: string): Promise<{ message: string }> {
    const section = await getEntityOrThrow(
      this._homeSectionRepository,
      sectionId,
      HOME_SECTION.NOT_FOUND
    );
    await this.preventIfInLayout(section.id, "disable");
    const newStatus = !section.isActive;
    const message = newStatus ? HOME_SECTION.ENABLED : HOME_SECTION.DISABLED;

    const updated = await this._homeSectionRepository.update(sectionId, { isActive: newStatus });

    if (!updated) {
      if (!updated) throw new CustomError(HOME_SECTION.NOT_FOUND, HTTPSTATUS.NOT_FOUND);
    }
    await this._redisService.clearPattern("sections:list");
    return { message };
  }

  async deleteSection(sectionId: string): Promise<string> {
    const section = await getEntityOrThrow(
      this._homeSectionRepository,
      sectionId,
      HOME_SECTION.NOT_FOUND
    );
    await this.preventIfInLayout(section.id, "delete");

    const urlKeys = this.extractManagedKeys(section.data);
    const deleted = await this._homeSectionRepository.delete(sectionId);
    if (!deleted) throw new CustomError(HOME_SECTION.NOT_FOUND, HTTPSTATUS.NOT_FOUND);

    await Promise.allSettled(urlKeys.map((k) => this._s3Service.deleteFile(k)));
    await this._redisService.clearPattern("sections:list");
    return HOME_SECTION.DELETED;
  }
  private async preventIfInLayout(
    sectionId: Types.ObjectId,
    action: "delete" | "disable"
  ): Promise<void> {
    const layout = await this._homeLayoutRepository.findOne({
      key: "HOME",
      "items.sectionId": sectionId,
    });

    if (layout) {
      const message =
        action === "delete"
          ? HOME_SECTION.IN_LAYOUT_CANNOT_DELETE
          : HOME_SECTION.IN_LAYOUT_CANNOT_DISABLE;

      throw new CustomError(message, HTTPSTATUS.FORBIDDEN);
    }
  }

  async listSections(
    page: number,
    limit: number,
    search: string,
    status: string,
    type: ListType
  ): Promise<ListSectionsResult> {
    const cacheKey = `sections:list:${type}:${status}:${page}:${limit}:${search}`;
    const cachedData = await this._redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const skip = (page - 1) * limit;

    const filter = buildHomeSectionFilter(search, status, type);

    const [rows, total] = await Promise.all([
      this._homeSectionRepository.getAllSections(skip, limit, filter),
      this._homeSectionRepository.countDocuments(filter),
    ]);
    const response = {
      sections: HomeSectionResponseDTO.fromEntities(rows),
      total,
    };
    await this._redisService.setWithTTL(
      cacheKey,
      JSON.stringify(response),
      REFRESH_TOKEN_TTL_SECONDS
    );
    return response;
  }

  private sanitizeHomeSectionData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === "categoryId" && typeof value === "string" && Types.ObjectId.isValid(value)) {
        sanitized[key] = new Types.ObjectId(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          typeof item === "object" && item !== null
            ? this.sanitizeHomeSectionData(item as Record<string, unknown>)
            : item
        );
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeHomeSectionData(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private extractManagedKeys(data: unknown): string[] {
    const keys: string[] = [];

    const walk = (v: unknown) => {
      if (typeof v === "string") {
        if (this.isManagedHomeKey(extractKeyFromUrl(v))) keys.push(v);
        return;
      }

      if (Array.isArray(v)) {
        v.forEach(walk);
        return;
      }

      if (v && typeof v === "object") {
        Object.values(v as Record<string, unknown>).forEach(walk);
      }
    };

    walk(data);
    return keys;
  }

  private isManagedHomeKey(value: string): boolean {
    return (
      value.startsWith(PURPOSE_POLICY.HOME_BANNER_IMAGE.folder) ||
      value.startsWith(PURPOSE_POLICY.HOME_HOW_IT_WORKS_IMAGE.folder) ||
      value.startsWith(PURPOSE_POLICY.HOME_WHY_CHOOSE_IMAGE.folder) ||
      value.startsWith(PURPOSE_POLICY.HOME_TESTIMONIAL_IMAGE.folder)
    );
  }
}
