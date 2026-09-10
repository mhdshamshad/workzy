import { ExtraChargeDTO } from "@/dtos/requests/booking.dto";

export interface IBookingExtraChargeService {
  requestExtraCharge(bookingId: string, workerId: string, data: ExtraChargeDTO): Promise<void>;
  payExtraCharge(bookingId: string, userId: string): Promise<{ url: string }>;
  rejectExtraCharge(bookingId: string, userId: string): Promise<void>;
}
