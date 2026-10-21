import { useMutation, useQueryClient } from '@tanstack/react-query';

import BookingService from '@/services/booking.service';
import type { ScheduleReworkSlotPayload } from '@/types/booking';

import type { CompleteReworkFormType } from '../validation/completeReworkFormData';
import type { RequestReworkFormType } from '../validation/requestReworkFormData';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  user: (status: string) => [...bookingKeys.lists(), 'user', status] as const,
  worker: (status: string) => [...bookingKeys.lists(), 'worker', status] as const,
  admin: (filters: string) => [...bookingKeys.lists(), 'admin', filters] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

export function useAcceptBooking() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => BookingService.acceptBooking(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

type CancelBookingPayload = {
  id: string;
  reason: string;
};

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: CancelBookingPayload) => BookingService.cancelBooking(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useApproveBooking() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => BookingService.approveBooking(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function usePayExtraCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BookingService.payExtraCharge(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useRequestRework() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, { id: string; data: RequestReworkFormType }>({
    mutationFn: ({ id, data }) => BookingService.requestRework(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useScheduleReworkSlot() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, { id: string; data: ScheduleReworkSlotPayload }>({
    mutationFn: ({ id, data }) => BookingService.scheduleReworkSlot(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useRescheduleReworkSlot() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, { id: string; data: ScheduleReworkSlotPayload }>({
    mutationFn: ({ id, data }) => BookingService.rescheduleReworkSlot(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useSendReworkOtp() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => BookingService.sendReworkOtp(id),
  });
}

export function useCompleteRework() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, { id: string; data: CompleteReworkFormType }>({
    mutationFn: ({ id, data }) => BookingService.completeRework(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}
