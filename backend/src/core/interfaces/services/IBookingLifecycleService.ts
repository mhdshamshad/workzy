import { CompleteBookingDTO } from "@/dtos/requests/booking.dto";

export interface IBookingLifecycleService {
  cancelBooking(bookingId: string, userId: string, reason: string): Promise<void>;
  acceptBooking(bookingId: string, workerId: string): Promise<void>;
  rejectBooking(data: { bookingId: string; workerId: string; reason: string }): Promise<void>;
  markEnRoute(bookingId: string, workerId: string): Promise<void>;
  markReached(bookingId: string, workerId: string): Promise<void>;
  startJob(bookingId: string, workerId: string, otp: string): Promise<void>;
  completeJob(bookingId: string, workerId: string, data: CompleteBookingDTO): Promise<void>;
  approveBooking(bookingId: string, userId: string): Promise<void>;
  expireBooking(): Promise<void>;
}
