import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { bookingKeys, useAcceptBooking } from '@/features/booking/hooks/useBooking';
import { useAddReviewReply } from '@/features/review';
import BookingService from '@/services/booking.service';
import type { BookingDetails, BookingListItem } from '@/types/booking';

import type { BookigCompleteForm } from '../components/WorkerCompleteModal';
import type { ExtraChargeFormType } from '../validation/extraChargeSchema';

export function useMarkEnRoute() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => BookingService.markEnRoute(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success(res.message);
    },
  });
}

export function useMarkReached() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => BookingService.markReached(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
      toast.success(res.message);
    },
  });
}

export function useStartJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) =>
      BookingService.startJob({ bookingId: id, otp }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      BookingService.rejectBooking(id, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useFinishJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BookigCompleteForm }) =>
      BookingService.completeJob(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useExtraCharge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExtraChargeFormType }) =>
      BookingService.requestExtraCharge(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.lists() });
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useWorkerBookingHandler() {
  const [acceptBId, setAcceptBId] = useState<string | null>(null);
  const [rejectBId, setRejectBId] = useState<string | null>(null);
  const [finishBId, setFinishBId] = useState<string | null>(null);
  const [extraChargeBId, setExtraChargeBId] = useState<string | null>(null);
  const [startB, setStartB] = useState<BookingListItem | BookingDetails | null>(null);
  const [reviewData, setReviewData] = useState<{ id: string; reviewId?: string } | null>(null);
  const [enRouteBId, setEnRouteBId] = useState<string | null>(null);
  const [reachedBId, setReachedBId] = useState<string | null>(null);
  const { mutateAsync: accept, isPending: isAccepting } = useAcceptBooking();
  const { mutateAsync: startJobMutate, isPending: isStarting } = useStartJob();
  const { mutateAsync: rejectBookingMutate, isPending: isRejecting } = useRejectBooking();
  const { mutateAsync: finishJobMutate, isPending: isCompleting } = useFinishJob();
  const { mutateAsync: requestExtraChargeMutate, isPending: isRequestingExtraCharge } =
    useExtraCharge();
  const { mutateAsync: replyToReview, isPending: isReplying } = useAddReviewReply();
  const { mutateAsync: markEnRoute, isPending: isEnRoutePending } = useMarkEnRoute();
  const { mutateAsync: markReached, isPending: isReachedPending } = useMarkReached();

  async function handleAcceptBooking(id: string) {
    const res = await accept(id);
    if (res?.message) {
      toast.success(res.message);
    }
    setAcceptBId(null);
  }

  async function handleStartJob(id: string, otp: string) {
    const res = await startJobMutate({ id, otp });
    if (res?.message) {
      toast.success(res.message);
    }
    setStartB(null);
  }

  async function handleRejectBooking(reason: string) {
    if (!rejectBId) {
      return;
    }
    const res = await rejectBookingMutate({ id: rejectBId, reason });
    if (res?.message) {
      toast.success(res.message);
    }
    setRejectBId(null);
  }

  async function handleFinishJob(data: BookigCompleteForm) {
    if (!finishBId) {
      return;
    }
    const res = await finishJobMutate({ id: finishBId, data });
    if (res?.message) {
      toast.success(res.message);
    }
    setFinishBId(null);
  }

  async function handleExtraCharge(data: ExtraChargeFormType) {
    if (!extraChargeBId) {
      return;
    }
    const res = await requestExtraChargeMutate({ id: extraChargeBId, data });
    if (res?.message) {
      toast.success(res.message);
    }
    setExtraChargeBId(null);
  }

  async function handleReviewReply(message: string) {
    if (!reviewData?.reviewId) {
      return;
    }
    const res = await replyToReview({ reviewId: reviewData.reviewId, message });
    if (res?.message) {
      toast.success(res.message);
    }
    setReviewData(null);
  }

  async function handleMarkEnRoute(id: string) {
    await markEnRoute(id);
    setEnRouteBId(null);
  }

  async function handleMarkReached(id: string) {
    await markReached(id);
    setReachedBId(null);
  }

  return {
    accept: {
      acceptBId,
      setAcceptBId,
      handleAcceptBooking,
      isAccepting,
    },
    start: {
      startB,
      setStartB,
      handleStartJob,
      isStarting,
    },
    reject: {
      rejectBId,
      setRejectBId,
      handleRejectBooking,
      isRejecting,
    },
    finish: {
      finishBId,
      setFinishBId,
      handleFinishJob,
      isCompleting,
    },
    extraCharge: {
      extraChargeBId,
      setExtraChargeBId,
      handleExtraCharge,
      isRequestingExtraCharge,
    },
    review: {
      reviewData,
      setReviewData,
      handleReviewReply,
      isReplying,
    },
    enRoute: {
      enRouteBId,
      setEnRouteBId,
      handleMarkEnRoute,
      isEnRoutePending,
    },
    reached: {
      reachedBId,
      setReachedBId,
      handleMarkReached,
      isReachedPending,
    },
  };
}
