import { DayCompleteDTO } from "@/dtos/requests/booking.dto";

export interface IBookingDayService {
  checkInDay(bookingId: string, dayIndex: number, workerId: string): Promise<void>;
  verifyDayOtp(bookingId: string, dayIndex: number, workerId: string, otp: string): Promise<void>;
  completeDay(
    bookingId: string,
    dayIndex: number,
    workerId: string,
    data: DayCompleteDTO
  ): Promise<void>;
  skipDay(bookingId: string, dayIndex: number, workerId: string, reason: string): Promise<void>;
}
