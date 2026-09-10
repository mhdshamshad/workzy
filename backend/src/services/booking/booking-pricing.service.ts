import { inject, injectable } from "inversify";

import {
  CATEGORY,
  HTTPSTATUS,
  PricingMode,
  SERVICE,
  STRIPE_ACCOUNT_STATUS,
  WORKER,
  WORKER_STATUS,
} from "@/constants";
import { ICategoryRepository } from "@/core/interfaces/repositories/ICategoryRepository";
import { IServiceRepository } from "@/core/interfaces/repositories/IServiceRepository";
import { IWorkerRepository } from "@/core/interfaces/repositories/IWorkerRepository";
import { IBookingPricingService } from "@/core/interfaces/services/IBookingPricingService";
import { TYPES } from "@/di/types";
import { BookingContext } from "@/types/booking/booking.entity";
import { BulkDiscountType } from "@/types/service/service.entity";
import CustomError from "@/utils/customError";
import { calculateDistanceKm } from "@/utils/geo";

@injectable()
export class BookingPricingService implements IBookingPricingService {
  constructor(
    @inject(TYPES.ServiceRepository) private _serviceRepository: IServiceRepository,
    @inject(TYPES.WorkerRepository) private _workerRepository: IWorkerRepository,
    @inject(TYPES.CategoryRepository) private _categoryRepository: ICategoryRepository
  ) {}

  getBestDiscount(discounts: BulkDiscountType[] | null, count: number): BulkDiscountType | null {
    if (!discounts || !discounts?.length) {
      return null;
    }
    const eligible = discounts.filter((d) => count >= d.count);
    if (!eligible.length) {
      return null;
    }
    return eligible.reduce((a, b) => (a.percent > b.percent ? a : b));
  }

  async getBookingContext(
    workerId: string,
    serviceId: string,
    lat: number,
    lng: number
  ): Promise<BookingContext> {
    const [service, worker] = await Promise.all([
      this._serviceRepository.findById(serviceId),
      this._workerRepository.findById(workerId),
    ]);
    if (!service) {
      throw new CustomError(SERVICE.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    if (!worker || worker.status !== WORKER_STATUS.VERIFIED) {
      throw new CustomError(WORKER.NOT_AVAILABLE, HTTPSTATUS.BAD_REQUEST);
    }
    const category = await this._categoryRepository.findById(service.categoryId);
    if (!category) {
      throw new CustomError(CATEGORY.NOT_FOUND, HTTPSTATUS.BAD_REQUEST);
    }
    const workerStripeId = worker.stripeAccountId;
    if (!workerStripeId || worker.stripeAccountStatus !== STRIPE_ACCOUNT_STATUS.ACTIVE) {
      throw new CustomError(WORKER.STRIPE_NOT_ACTIVE, HTTPSTATUS.BAD_REQUEST);
    }

    const rate = service.rate ?? category.baseRate;
    const estimatedDuration = service.estimatedDuration ?? category.estimatedDuration ?? 60;
    const bufferTime = service.bufferTime ?? category.bufferTime ?? 15;
    const platformFeePercent = category.platformFee ?? 0;
    const travelRatePerKM = category.travelRatePerKM ?? 0;
    const pricingMode = category.pricingMode as PricingMode;

    const distanceKm = calculateDistanceKm(
      { lat: worker.location.coordinates[1], lng: worker.location.coordinates[0] },
      { lat, lng }
    );
    const travelCost = Math.min(
      Math.round(distanceKm * (travelRatePerKM ?? 0)),
      service.maxTravelCost ?? Infinity
    );

    return {
      worker: {
        name: worker.displayName,
        phone: worker.phone,
      },
      service,
      category,
      pricingMode,
      rate,
      workerStripeId,
      estimatedDuration,
      bufferTime,
      platformFeePercent,
      travelRatePerKM,
      distanceKm,
      travelCost,
    };
  }
}
