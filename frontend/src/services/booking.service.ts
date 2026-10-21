import type { Role } from '@/constants';
import { BOOKING_API } from '@/constants/apiRoutes/booking.routes';
import type { bookingRescheduleFormType } from '@/features/booking/validation/bookingRescheduleFormData';
import type { CompleteReworkFormType } from '@/features/booking/validation/completeReworkFormData';
import type { RequestReworkFormType } from '@/features/booking/validation/requestReworkFormData';
import type { bookingFormData } from '@/features/user/booking/validation/bookingFormData';
import type { BookigCompleteForm } from '@/features/worker/booking/components/WorkerCompleteModal';
import type { ExtraChargeFormType } from '@/features/worker/booking/validation/extraChargeSchema';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';
import type {
  BookingDetails,
  BookingListingResponse,
  BookingListQuery,
  ScheduleReworkSlotPayload,
} from '@/types/booking';

const BookingService = {
  getBookings: async (params: BookingListQuery): Promise<BookingListingResponse> => {
    const res = await api.get<ApiResponse<BookingListingResponse>>(BOOKING_API.ROOT, { params });
    return res.data.data;
  },
  getBookingDetails: async (bookingId: string): Promise<BookingDetails> => {
    const res = await api.get<ApiResponse<BookingDetails>>(BOOKING_API.BY_ID(bookingId));
    return res.data.data;
  },
  createBooking: async (data: bookingFormData): Promise<{ url: string }> => {
    const res = await api.post<ApiResponse<{ url: string }>>(BOOKING_API.ROOT, data);
    return res.data.data;
  },
  acceptBooking: async (bookingId: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.ACCEPT(bookingId));
    return { message: res.data.message };
  },
  cancelBooking: async (bookingId: string, reason: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.CANCEL(bookingId), { reason });
    return { message: res.data.message };
  },

  rejectBooking: async (bookingId: string, reason: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.REJECT(bookingId), { reason });
    return { message: res.data.message };
  },
  startJob: async ({
    bookingId,
    otp,
  }: {
    bookingId: string;
    otp: string;
  }): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.START(bookingId), { otp });
    return { message: res.data.message };
  },
  completeJob: async (
    bookingId: string,
    data: BookigCompleteForm
  ): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.COMPLETE(bookingId), data);
    return { message: res.data.message };
  },
  approveBooking: async (bookingId: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.APPROVE(bookingId));
    return { message: res.data.message };
  },
  markEnRoute: async (bookingId: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.EN_ROUTE(bookingId));
    return { message: res.data.message };
  },
  markReached: async (bookingId: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.MARK_REACHED(bookingId));
    return { message: res.data.message };
  },
  payExtraCharge: async (bookingId: string): Promise<{ url: string }> => {
    const res = await api.patch<ApiResponse<{ url: string }>>(
      BOOKING_API.EXTRA_CHARGE_PAY(bookingId)
    );
    return res.data.data;
  },
  rejectExtraCharge: async (bookingId: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.EXTRA_CHARGE_REJECT(bookingId));
    return { message: res.data.message };
  },
  requestExtraCharge: async (
    bookingId: string,
    data: ExtraChargeFormType
  ): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.EXTRA_CHARGE(bookingId), data);
    return { message: res.data.message };
  },
  disputeBooking: async (bookingId: string, reason: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.DISPUTE(bookingId), { reason });
    return { message: res.data.message };
  },
  requestReschedule: async (
    bookingId: string,
    data: bookingRescheduleFormType
  ): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.RESCHEDULE(bookingId), data);
    return { message: res.data.message };
  },
  respondReschedule: async (
    bookingId: string,
    data: { status: 'accepted' | 'rejected'; role: Role }
  ): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<null>>(BOOKING_API.RESCHEDULE_RESPOND(bookingId), data);
    return { message: res.data.message };
  },
  cancelReschedule: async (
    bookingId: string,
    data: { requestedBy: Role }
  ): Promise<{ message: string }> => {
    const res = await api.delete<ApiResponse<null>>(BOOKING_API.RESCHEDULE(bookingId), { data });
    return { message: res.data.message };
  },
  requestRework: async (
    bookingId: string,
    data: RequestReworkFormType
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(BOOKING_API.REWORK_REQUEST(bookingId), data);
    return { message: res.data.message };
  },
  scheduleReworkSlot: async (
    bookingId: string,
    data: ScheduleReworkSlotPayload
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(
      BOOKING_API.REWORK_SCHEDULE_SLOT(bookingId),
      data
    );
    return { message: res.data.message };
  },
  rescheduleReworkSlot: async (
    bookingId: string,
    data: ScheduleReworkSlotPayload
  ): Promise<{ message: string }> => {
    const res = await api.put<ApiResponse<null>>(
      BOOKING_API.REWORK_RESCHEDULE_SLOT(bookingId),
      data
    );
    return { message: res.data.message };
  },
  sendReworkOtp: async (bookingId: string): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(BOOKING_API.REWORK_SEND_OTP(bookingId));
    return { message: res.data.message };
  },
  completeRework: async (
    bookingId: string,
    data: CompleteReworkFormType
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(BOOKING_API.REWORK_COMPLETE(bookingId), data);
    return { message: res.data.message };
  },
};

export default BookingService;
