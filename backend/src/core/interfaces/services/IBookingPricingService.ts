import { BookingContext } from "@/types/booking/booking.entity";
import { BulkDiscountType } from "@/types/service/service.entity";

export interface IBookingPricingService {
  getBookingContext(
    workerId: string,
    serviceId: string,
    lat: number,
    lng: number
  ): Promise<BookingContext>;
  getBestDiscount(discounts: BulkDiscountType[] | null, count: number): BulkDiscountType | null;
}
