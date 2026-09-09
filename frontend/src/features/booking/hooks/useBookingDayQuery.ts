import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { bookingKeys } from '@/features/booking/hooks/useBooking';
import { BookingDayService, type DayCompleteData } from '@/services/booking-day.service';

export function useDayCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, dayIndex }: { bookingId: string; dayIndex: number }) =>
      BookingDayService.checkIn(bookingId, dayIndex),
    onSuccess: (res, { bookingId }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success(res.message);
    },
  });
}

export function useVerifyDayOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      dayIndex,
      otp,
    }: {
      bookingId: string;
      dayIndex: number;
      otp: string;
    }) => BookingDayService.verifyOtp(bookingId, dayIndex, otp),
    onSuccess: (res, { bookingId }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success(res.message);
    },
  });
}

export function useDayComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      dayIndex,
      data,
    }: {
      bookingId: string;
      dayIndex: number;
      data: DayCompleteData;
    }) => BookingDayService.completeDay(bookingId, dayIndex, data),
    onSuccess: (res, { bookingId }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success(res.message);
    },
  });
}

export function useDaySkip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      dayIndex,
      reason,
    }: {
      bookingId: string;
      dayIndex: number;
      reason: string;
    }) => BookingDayService.skipDay(bookingId, dayIndex, reason),
    onSuccess: (res, { bookingId }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      toast.success(res.message);
    },
  });
}
