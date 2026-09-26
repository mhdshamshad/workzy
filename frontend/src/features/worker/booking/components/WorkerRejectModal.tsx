import { AlertTriangle, MapPin, IndianRupee } from 'lucide-react';
import { useEffect, useState } from 'react';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingDetails } from '@/hooks/useBookingDetails';
import { createDescriptionRule } from '@/lib/validation/rules';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatTime12 } from '@/utils/time.format';

interface WorkerRejectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  bookingId: string | null;
  isSubmitting?: boolean;
}
const rejectReasonSchema = createDescriptionRule('Reason');
export default function WorkerRejectModal({
  open,
  onClose,
  onSubmit,
  bookingId,
  isSubmitting = false,
}: WorkerRejectModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const { booking: bookingDetails, isLoading } = useBookingDetails(bookingId || null);

  if (!bookingDetails) {
    return null;
  }
  const { category, date, startTime } = bookingDetails;

  const handleConfirm = async () => {
    const result = rejectReasonSchema.safeParse(reason);
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
      const result = rejectReasonSchema.safeParse(value);
      setError(result.success ? '' : (result.error.issues[0]?.message ?? 'Invalid reason'));
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
        Go Back
      </Button>
      <Button
        variant="red"
        disabled={!reason.trim() || isSubmitting}
        onClick={handleConfirm}
        loading={isSubmitting}
      >
        Reject Booking
      </Button>
    </div>
  );

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Reject Booking"
      canCloseOnOutsideClick={!isSubmitting}
      className="max-w-lg"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 rounded-xl border bg-amber-500/15 text-amber-500 border-amber-500/30">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            Rejecting a booking might impact your profile rating if done too frequently. Please
            provide a valid reason.
          </p>
        </div>
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Booking</span>
            <span className="font-semibold text-red-900">{category.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Time</span>
            <span className="text-red-900 font-medium">
              {formatDate(date)} • {formatTime12(startTime)}
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : bookingDetails ? (
            <>
              <div className="pt-2 border-t border-red-100 space-y-2">
                <div className="flex items-start gap-2 text-xs text-red-700">
                  <MapPin size={14} className="mt-0.5" />
                  <span>{bookingDetails.address?.label}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-red-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-red-800 flex items-center gap-1">
                    <IndianRupee size={12} />
                    Losing Earnings
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(bookingDetails.total - bookingDetails.platformFee)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Reason for Rejection</Label>
          <Textarea
            value={reason}
            onChange={handleReasonChange}
            placeholder="e.g., I'm unavailable at this time, location is too far..."
            disabled={isSubmitting}
            error={error}
          />
        </div>
      </div>
    </AppModal>
  );
}
