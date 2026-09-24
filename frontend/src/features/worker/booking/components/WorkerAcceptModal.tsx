import { CheckCircle2, Info, MapPin, IndianRupee } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { AppModal } from '@/components/molecules/AppModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookingDetails } from '@/hooks/useBookingDetails';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatTime12 } from '@/utils/time.format';

interface WorkerAcceptModalProps {
  open: boolean;
  bookingId: string | null;
  onClose: () => void;
  onSubmit: (id: string) => Promise<void>;
  isSubmitting?: boolean;
}

export default function WorkerAcceptModal({
  open,
  onClose,
  onSubmit,
  bookingId,
  isSubmitting = false,
}: WorkerAcceptModalProps) {
  const { booking, error, isLoading } = useBookingDetails(bookingId);

  if (isLoading) {
    return (
      <AppModal open={open} onClose={onClose} title="Accept Booking">
        <Skeleton className="h-40 w-full" />
      </AppModal>
    );
  }
  if (error || !booking) {
    return null;
  }
  const { id, category, dates, address, total, platformFee, platformFeePercent } = booking;
  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Accept Booking"
      canCloseOnOutsideClick={!isSubmitting}
      className="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="green"
            onClick={() => onSubmit(id)}
            loading={isSubmitting}
            iconLeft={<CheckCircle2 size={16} />}
          >
            Confirm & Accept
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 rounded-xl bg-blue-500/15 text-blue-400 border-blue-500/30">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            By accepting, you commit to being available at the scheduled time. The client will be
            notified immediately.
          </p>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service</span>
            <span className="text-sm font-semibold">{category?.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="text-sm font-medium">{formatDate(dates[0].date, 'calendar')}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Time</span>
            <span className="text-sm font-medium">{formatTime12(dates[0].startTime)}</span>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin size={14} className="mt-0.5" />
              <span>{address?.label}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Client Total Paid</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="flex justify-between text-xs text-red-400">
              <span>Platform Fee ({platformFeePercent}%)</span>
              <span>-{formatCurrency(platformFee)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm font-medium text-primary flex items-center gap-1">
                <IndianRupee size={12} />
                Your Net Earnings
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(total - platformFee)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
