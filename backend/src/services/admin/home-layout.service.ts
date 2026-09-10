import { inject, injectable } from "inversify";
import { Types } from "mongoose";

import { HOME_LAYOUT, HTTPSTATUS, REFRESH_TOKEN_TTL_SECONDS } from "@/constants";
import { HomeSectionType, SINGLETON_HOME_TYPES } from "@/constants/home";
import { IHomeLayoutRepository } from "@/core/interfaces/repositories/IHomeLayoutRepository";
import { IHomeSectionRepository } from "@/core/interfaces/repositories/IHomeSectionRepository";
import { IHomeLayoutService, SaveItem } from "@/core/interfaces/services/IHomeLayoutService";
import { IRedisService } from "@/core/interfaces/services/IRedisService";
import { TYPES } from "@/di/types";
import { HomeLayoutResponseDTO } from "@/dtos/responses/admin/homeLayout.response.dto";
import CustomError from "@/utils/customError";

@injectable()
export class HomeLayoutService implements IHomeLayoutService {
  constructor(
    @inject(TYPES.HomeLayoutRepository) private _layoutRepo: IHomeLayoutRepository,
    @inject(TYPES.HomeSectionRepository) private _sectionRepo: IHomeSectionRepository,
    @inject(TYPES.RedisService) private _redisService: IRedisService
  ) {}
  async getLayout(): Promise<HomeLayoutResponseDTO> {
    const cacheKey = "layout:admin";
    const cachedData = await this._redisService.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const homeLayout = await this._layoutRepo.getLayout();
    const response = HomeLayoutResponseDTO.fromEntity(homeLayout);
    await this._redisService.setWithTTL(
      cacheKey,
      JSON.stringify(response),
      REFRESH_TOKEN_TTL_SECONDS
    );
    return response;
  }
  async saveLayout(items: SaveItem[]): Promise<HomeLayoutResponseDTO> {
    this.validateNoDuplicates(items);

    const objectIds = items.map((item) => new Types.ObjectId(item.sectionId));
    const sections = await this._sectionRepo.find({ _id: { $in: objectIds } });

    if (sections.length !== objectIds.length) {
      throw new CustomError(HOME_LAYOUT.SECTIONS_NOT_EXIST, HTTPSTATUS.BAD_REQUEST);
    }
    const disabledSection = sections.find((s) => !s.isActive);
    if (disabledSection) {
      throw new CustomError(
        HOME_LAYOUT.SECTION_DISABLED(disabledSection.name),
        HTTPSTATUS.BAD_REQUEST
      );
    }

    this.validateSingletonTypes(sections.map((s) => s.type));

    const normalizedItems = items
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item, index) => ({
        sectionId: new Types.ObjectId(item.sectionId),
        order: index + 1,
      }));

    await this._layoutRepo.findOneAndUpdate({ key: "HOME" }, { items: normalizedItems });
    await this._redisService.clearPattern("layout:admin");
    await this._redisService.clearPattern("home:public");

    const layout = await this._layoutRepo.getLayout();
    return HomeLayoutResponseDTO.fromEntity(layout);
  }

  private validateNoDuplicates(items: SaveItem[]): void {
    const sectionIds = items.map((item) => item.sectionId);
    const uniqueIds = new Set(sectionIds);

    if (uniqueIds.size !== sectionIds.length) {
      throw new CustomError(HOME_LAYOUT.DUPLICATE_SECTIONS, HTTPSTATUS.BAD_REQUEST);
    }
  }

  private validateSingletonTypes(sectionTypes: HomeSectionType[]): void {
    const singletonSet = new Set(SINGLETON_HOME_TYPES);
    const seenSingletons = new Set<HomeSectionType>();

    for (const type of sectionTypes) {
      if (!singletonSet.has(type)) continue;
      if (seenSingletons.has(type)) {
        throw new CustomError(HOME_LAYOUT.ONLY_ONE_ALLOWED(type), HTTPSTATUS.BAD_REQUEST);
      }
      seenSingletons.add(type);
    }
  }
}
