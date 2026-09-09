import { BOOKING_API } from '@/constants/apiRoutes/booking.routes';
import type { BookigCompleteForm } from '@/features/worker/booking/components/WorkerCompleteModal';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';

export type DayCompleteData = BookigCompleteForm;

export const BookingDayService = {
  checkIn: async (bookingId: string, dayIndex: number): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(BOOKING_API.DAY_CHECK_IN(bookingId, dayIndex));
    return { message: res.data.message };
  },

  verifyOtp: async (
    bookingId: string,
    dayIndex: number,
    otp: string
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(BOOKING_API.DAY_VERIFY_OTP(bookingId, dayIndex), {
      otp,
    });
    return { message: res.data.message };
  },

  completeDay: async (
    bookingId: string,
    dayIndex: number,
    data: DayCompleteData
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(
      BOOKING_API.DAY_COMPLETE(bookingId, dayIndex),
      data
    );
    return { message: res.data.message };
  },

  skipDay: async (
    bookingId: string,
    dayIndex: number,
    reason: string
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(BOOKING_API.DAY_SKIP(bookingId, dayIndex), {
      reason,
    });
    return { message: res.data.message };
  },
};
