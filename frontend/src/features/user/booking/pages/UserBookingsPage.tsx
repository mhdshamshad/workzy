import { useState } from 'react';

import PageHeader from '@/components/molecules/PageHeader';
import { ROLE, type BookingFilterStatus } from '@/constants';
import { useBookings } from '@/features/booking';
import { BookingList } from '@/features/booking/components/BookingList';
import { BookingStatusTabs } from '@/features/booking/components/BookingStatusTabs';
import RequestReworkModal from '@/features/booking/components/rework/RequestReworkModal';
import { DisputeModal } from '@/features/dispute';
import type { BookingDetails, BookingListItem } from '@/types/booking';

import ApproveModal from '../components/bookingActions/ApproveModal';
import CancelModal from '../components/bookingActions/CancelModal';
import ExtraChargeModal from '../components/bookingActions/ExtraChargeModal';
import ReviewModal from '../components/bookingActions/ReviewModal';
import { useUserBookingHandler } from '../hooks/useUserBooking';

export default function UserBookingsPage() {
  const [status, setStatus] = useState<BookingFilterStatus>('all');
  const [disputeBId, setDisputeBId] = useState<string | null>(null);
  const [reworkB, setReworkB] = useState<BookingListItem | BookingDetails | null>(null);
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBookings({ status });

  const { cancel, approve, payExtra, review } = useUserBookingHandler();
  const { cancelB, isCancelling, setCancelB, handleCancelBooking } = cancel;
  const { payExtraBId, setPayExtraBId, isPayingExtra, handlePayExtra } = payExtra;
  const { approveBId, setApproveBId, isApproving, handleApproveBooking } = approve;
  const { reviewData, setReviewData, handleSubmitReview } = review;

  const bookings = data?.pages.flatMap(p => p.bookings) ?? [];

  return (
    <div className="section-container py-8">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="My Bookings" description="Track and manage your service bookings" />
      </div>
      <BookingStatusTabs active={status} onChange={setStatus} />
      <BookingList
        bookings={bookings}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={!!hasNextPage}
        fetchNextPage={fetchNextPage}
        refetch={refetch}
        role={ROLE.USER}
        onCancel={booking => setCancelB(booking)}
        onApprove={id => setApproveBId(id)}
        onPayExtra={id => setPayExtraBId(id)}
        onReview={data => setReviewData({ id: data.id, reviewId: data.reviewId })}
        onDispute={id => setDisputeBId(id)}
        onRequestRework={booking => setReworkB(booking)}
        detailBasePath="/bookings"
      />
      <CancelModal
        open={!!cancelB}
        booking={cancelB}
        onClose={() => setCancelB(null)}
        onSubmit={handleCancelBooking}
        isSubmitting={isCancelling}
      />
      <ApproveModal
        open={!!approveBId}
        onClose={() => setApproveBId(null)}
        bookingId={approveBId}
        onSubmit={handleApproveBooking}
        isSubmitting={isApproving}
      />
      <ExtraChargeModal
        open={!!payExtraBId}
        bookingId={payExtraBId}
        onClose={() => setPayExtraBId(null)}
        onPayAmount={handlePayExtra}
        isSubmitting={isPayingExtra}
      />
      <ReviewModal
        bookingId={reviewData?.id}
        onClose={() => setReviewData(null)}
        open={true}
        reviewId={reviewData?.reviewId}
        onSubmit={handleSubmitReview}
      />
      <DisputeModal
        open={!!disputeBId}
        role={ROLE.USER}
        onClose={() => setDisputeBId(null)}
        bookingId={disputeBId}
      />
      {reworkB && (
        <RequestReworkModal isOpen={!!reworkB} booking={reworkB} onClose={() => setReworkB(null)} />
      )}
    </div>
  );
}
