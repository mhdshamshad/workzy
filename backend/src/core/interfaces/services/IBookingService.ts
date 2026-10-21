import {
  CancelRescheduleDto,
  CompleteBookingDTO,
  CompleteReworkDTO,
  CreatebookingDTO,
  ExtraChargeDTO,
  RequestRescheduleDto,
  RequestReworkDTO,
  RespondRescheduleDto,
  ScheduleReworkSlotDTO,
} from "@/dtos/requests/booking.dto";
import { BookingListItemDTO, BookingResponseDTO } from "@/dtos/responses/booking.dto";
import { BookingListQuery } from "@/types/booking/booking.query";
import { CursorPaginatedResult } from "@/types/common/pagination";

export interface IBookingService {
  getBookings(input: BookingListQuery): Promise<CursorPaginatedResult<BookingListItemDTO>>;
  getBookingDetails(bookingId: string): Promise<BookingResponseDTO>;

  createBooking(userId: string, data: CreatebookingDTO): Promise<{ url: string }>;
  cancelBooking(bookingId: string, userId: string, reason: string): Promise<void>;
  acceptBooking(bookingId: string, workerId: string): Promise<void>;
  markEnRoute(bookingId: string, workerId: string): Promise<void>;
  markReached(bookingId: string, workerId: string): Promise<void>;
  startJob(bookingId: string, workerId: string, otp: string): Promise<void>;
  rejectBooking(data: { bookingId: string; workerId: string; reason: string }): Promise<void>;
  completeJob(bookingId: string, workerId: string, data: CompleteBookingDTO): Promise<void>;
  requestExtraCharge(bookingId: string, workerId: string, data: ExtraChargeDTO): Promise<void>;
  approveBooking(bookingId: string, userId: string): Promise<void>;
  payExtraCharge(bookingId: string, userId: string): Promise<{ url: string }>;
  rejectExtraCharge(bookingId: string, userId: string): Promise<void>;

  requestReschedule(
    bookingId: string,
    initiatorId: string,
    data: RequestRescheduleDto
  ): Promise<void>;
  respondReschedule(
    bookingId: string,
    responderId: string,
    data: RespondRescheduleDto
  ): Promise<string>;
  cancelReschedule(
    bookingId: string,
    initiatorId: string,
    data: CancelRescheduleDto
  ): Promise<void>;

  requestRework(bookingId: string, userId: string, data: RequestReworkDTO): Promise<void>;
  scheduleReworkSlot(
    bookingId: string,
    workerId: string,
    data: ScheduleReworkSlotDTO
  ): Promise<void>;
  rescheduleReworkSlot(
    bookingId: string,
    workerId: string,
    data: ScheduleReworkSlotDTO
  ): Promise<void>;
  sendReworkCompletionOtp(bookingId: string, workerId: string): Promise<void>;
  completeRework(bookingId: string, workerId: string, data: CompleteReworkDTO): Promise<void>;
}
