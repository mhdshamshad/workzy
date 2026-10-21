import { useState } from 'react';

import PageHeader from '@/components/molecules/PageHeader';
import { ROLE, type BookingFilterStatus } from '@/constants';
import { useBookings } from '@/features/booking';
import { BookingList } from '@/features/booking/components/BookingList';
import { BookingStatusTabs } from '@/features/booking/components/BookingStatusTabs';
import CompleteReworkModal from '@/features/booking/components/rework/CompleteReworkModal';
import ScheduleReworkModal from '@/features/booking/components/rework/ScheduleReworkModal';
import { DisputeModal } from '@/features/dispute';
import type { BookingDetails, BookingListItem } from '@/types/booking';

import WorkerAcceptModal from '../components/WorkerAcceptModal';
import WorkerCompleteModal from '../components/WorkerCompleteModal';
import WorkerConfirmStatusModal from '../components/WorkerConfirmStatusModal';
import WorkerExtraChargeModal from '../components/WorkerExtraChargeModal';
import WorkerRejectModal from '../components/WorkerRejectModal';
import WorkerReviewReplyModal from '../components/WorkerReviewModal';
import WorkerStartJobModal from '../components/WorkerStartJobModal';
import { useWorkerBookingHandler } from '../hooks/useWorkerBooking';

export default function WorkerBookingsPage() {
  const [disputeBId, setDisputeBId] = useState<string | null>(null);
  const [status, setStatus] = useState<BookingFilterStatus>('all');
  const [scheduleReworkB, setScheduleReworkB] = useState<BookingListItem | BookingDetails | null>(
    null
  );
  const [completeReworkB, setCompleteReworkB] = useState<BookingListItem | BookingDetails | null>(
    null
  );

  const { accept, start, reject, finish, extraCharge, review, enRoute, reached } =
    useWorkerBookingHandler();
  const { extraChargeBId, setExtraChargeBId, handleExtraCharge, isRequestingExtraCharge } =
    extraCharge;
  const { setFinishBId, finishBId, isCompleting, handleFinishJob } = finish;
  const { setAcceptBId, acceptBId, isAccepting, handleAcceptBooking } = accept;
  const { rejectBId, setRejectBId, handleRejectBooking, isRejecting } = reject;
  const { setStartB, startB, isStarting, handleStartJob } = start;
  const { reviewData, isReplying, setReviewData, handleReviewReply } = review;
  const { enRouteBId, setEnRouteBId, handleMarkEnRoute, isEnRoutePending } = enRoute;
  const { reachedBId, setReachedBId, handleMarkReached, isReachedPending } = reached;

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useBookings({ status });

  const bookings = data?.pages.flatMap(p => p.bookings) ?? [];

  return (
    <div className="py-6 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="My Jobs" description="Manage your service bookings" />
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
        role={ROLE.WORKER}
        onAccept={id => setAcceptBId(id)}
        onEnRoute={id => setEnRouteBId(id)}
        onReached={id => setReachedBId(id)}
        onStart={booking => setStartB(booking)}
        onReject={id => setRejectBId(id)}
        onComplete={id => setFinishBId(id)}
        onReqExtra={id => setExtraChargeBId(id)}
        // onCancel={id => reject(id)}
        onReview={data => setReviewData({ id: data.id, reviewId: data.reviewId })}
        onScheduleReworkSlot={booking => setScheduleReworkB(booking)}
        onCompleteRework={booking => setCompleteReworkB(booking)}
        detailBasePath="/worker/bookings"
        onDispute={id => setDisputeBId(id)}
      />
      <WorkerConfirmStatusModal
        open={!!enRouteBId}
        onClose={() => setEnRouteBId(null)}
        onConfirm={async () => {
          if (enRouteBId) {
            await handleMarkEnRoute(enRouteBId);
          }
        }}
        isSubmitting={isEnRoutePending}
        type="en_route"
      />
      <WorkerConfirmStatusModal
        open={!!reachedBId}
        onClose={() => setReachedBId(null)}
        onConfirm={async () => {
          if (reachedBId) {
            await handleMarkReached(reachedBId);
          }
        }}
        isSubmitting={isReachedPending}
        type="reached"
      />
      <WorkerAcceptModal
        isSubmitting={isAccepting}
        onSubmit={handleAcceptBooking}
        open={!!acceptBId}
        bookingId={acceptBId}
        onClose={() => setAcceptBId(null)}
      />
      <WorkerRejectModal
        isSubmitting={isRejecting}
        onSubmit={handleRejectBooking}
        open={!!rejectBId}
        bookingId={rejectBId}
        onClose={() => setRejectBId(null)}
      />
      <WorkerCompleteModal
        isSubmitting={isCompleting}
        onSubmit={handleFinishJob}
        open={!!finishBId}
        bookingId={finishBId}
        onClose={() => setFinishBId(null)}
      />
      <WorkerExtraChargeModal
        isSubmitting={isRequestingExtraCharge}
        onSubmit={handleExtraCharge}
        open={!!extraChargeBId}
        bookingId={extraChargeBId}
        onClose={() => setExtraChargeBId(null)}
      />
      <WorkerStartJobModal
        isSubmitting={isStarting}
        onSubmit={handleStartJob}
        open={!!startB}
        booking={startB}
        onClose={() => setStartB(null)}
      />

      {reviewData?.reviewId && (
        <WorkerReviewReplyModal
          onClose={() => setReviewData(null)}
          onSubmit={handleReviewReply}
          open={!!reviewData}
          reviewId={reviewData?.reviewId}
          isReplying={isReplying}
        />
      )}

      <DisputeModal
        open={!!disputeBId}
        role={ROLE.WORKER}
        onClose={() => setDisputeBId(null)}
        bookingId={disputeBId}
      />

      {scheduleReworkB && (
        <ScheduleReworkModal
          isOpen={!!scheduleReworkB}
          booking={scheduleReworkB}
          onClose={() => setScheduleReworkB(null)}
        />
      )}

      {completeReworkB && (
        <CompleteReworkModal
          isOpen={!!completeReworkB}
          booking={completeReworkB}
          onClose={() => setCompleteReworkB(null)}
        />
      )}
    </div>
  );
}
