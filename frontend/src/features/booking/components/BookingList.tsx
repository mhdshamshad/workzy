import { AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import { ROLE } from '@/constants';
import BookingCard from '@/features/booking/components/BookingCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { BookingDetails, BookingListItem } from '@/types/booking';

import { BookingCardSkeleton } from './BookingCardSkeleton';

interface BookingListProps {
  bookings: BookingListItem[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  role: (typeof ROLE)[keyof typeof ROLE];
  onAccept?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onStart?: (booking: BookingListItem | BookingDetails) => void;
  onCancel?: (booking: BookingListItem | BookingDetails) => void;
  onReached?: (id: string) => void;
  onComplete?: (id: string) => void;
  onDispute?: (id: string) => void;
  onEnRoute?: (id: string) => void;
  onReqExtra?: (id: string) => void;
  onPayExtra?: (id: string) => void;
  onReview?: (data: { id: string; reviewId?: string }) => void;
  onRequestRework?: (booking: BookingListItem | BookingDetails) => void;
  onScheduleReworkSlot?: (booking: BookingListItem | BookingDetails) => void;
  onCompleteRework?: (booking: BookingListItem | BookingDetails) => void;
  detailBasePath?: string;
  workerId?: string;
  userId?: string;
}

export function BookingList({
  bookings,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  refetch,
  role,
  onAccept,
  onReached,
  onReject,
  onEnRoute,
  onStart,
  onCancel,
  onComplete,
  onReqExtra,
  onApprove,
  onReview,
  onPayExtra,
  onDispute,
  onRequestRework,
  onScheduleReworkSlot,
  onCompleteRework,
  detailBasePath = '/bookings',
  workerId,
  userId,
}: BookingListProps) {
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <BookingCardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load bookings"
        description="Something went wrong while fetching your bookings."
        onRetry={refetch}
      />
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="w-6 h-6" />}
        title="No bookings found"
        description="Your bookings will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {bookings.map(booking => (
          <BookingCard
            key={booking?.id}
            booking={booking}
            role={role}
            detailPath={`${detailBasePath}/${booking?.id}`}
            workerId={workerId}
            userId={userId}
            handlers={{
              onAccept,
              onStart,
              onCancel,
              onReached,
              onEnRoute,
              onReject,
              onComplete,
              onReqExtra,
              onApprove,
              onDispute,
              onPayExtra,
              onReview,
              onRequestRework,
              onScheduleReworkSlot,
              onCompleteRework,
            }}
          />
        ))}
      </AnimatePresence>
      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex flex-col gap-3">
          <BookingCardSkeleton />
        </div>
      )}
    </div>
  );
}
