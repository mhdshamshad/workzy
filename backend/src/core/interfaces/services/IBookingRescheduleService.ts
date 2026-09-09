import {
  CancelRescheduleDto,
  RequestRescheduleDto,
  RespondRescheduleDto,
} from "@/dtos/requests/booking.dto";

export interface IBookingRescheduleService {
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
}
