import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { createDescriptionRule } from '@/lib/validation/rules';
import type { BookingDetails, BookingListItem } from '@/types/booking';
import { formatDate, formatTime12 } from '@/utils/time.format';

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  booking: BookingListItem | BookingDetails | null;
  isSubmitting?: boolean;
}

const cancelReasonSchema = createDescriptionRule('Reason');

export default function CancelModal({
  open,
  onClose,
  onSubmit,
  booking,
  isSubmitting = false,
}: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
      setError('');
    }
  }, [open]);

  if (!booking) {
    return null;
  }
  const { category, date, startTime, endTime, totalDays, endDate } = booking;
  const isMultiday = totalDays > 1;

  const handleConfirm = async () => {
    const result = cancelReasonSchema.safeParse(reason);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid reason');
      return;
    }
    setError('');
    await onSubmit(result?.data as string);
  };
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setReason(value);
    if (error) {
      const result = cancelReasonSchema.safeParse(value);
      setError(result.success ? '' : (result.error.issues[0]?.message ?? 'Invalid reason'));
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
        Keep Booking
      </Button>
      <Button
        variant="red"
        disabled={!reason.trim() || isSubmitting}
        onClick={handleConfirm}
        loading={isSubmitting}
      >
        {' '}
        Cancel Booking
      </Button>
    </div>
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Cancel Booking"
      canCloseOnOutsideClick={!isSubmitting}
      className="max-w-lg"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 rounded-xl border bg-amber-500/15 text-amber-500 border-amber-500/30 ">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            Cancelling may incur a fee depending on timing. Payment will be refunded as per our
            policy.
          </p>
        </div>
        <div className="bg-muted/60 border border-border rounded-xl p-3 flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Booking</p>
          <p className="text-sm font-medium text-foreground">
            {category.name} — {formatDate(date)} —
            {isMultiday
              ? `${formatDate(endDate)} ${totalDays}Days`
              : `${formatTime12(startTime)} — ${formatTime12(endTime)}`}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Reason</Label>
          <Textarea
            value={reason}
            onChange={handleReasonChange}
            placeholder="Tell us why you're cancelling…"
            disabled={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </AppModal>
  );
}
