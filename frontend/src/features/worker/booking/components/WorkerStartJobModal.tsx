import { PlayCircle, Info, Eye } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { AppModal } from '@/components/molecules/AppModal';
import type { BookingDetails, BookingListItem } from '@/types/booking';
import { formatDate, formatTime12 } from '@/utils/time.format';

interface WorkerStartJobModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, otp: string) => Promise<void>;
  booking: BookingListItem | BookingDetails | null;
  isSubmitting?: boolean;
}
const validateOtp = (value: string) => {
  if (!value) {
    return 'OTP is required';
  }
  if (!/^\d+$/.test(value)) {
    return 'OTP must contain only numbers';
  }
  if (value.length !== 6) {
    return 'OTP must be exactly 6 digits';
  }
  return '';
};

export default function WorkerStartJobModal({
  open,
  onClose,
  onSubmit,
  booking,
  isSubmitting = false,
}: WorkerStartJobModalProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  if (!booking) {
    return null;
  }
  const { category, date, startTime } = booking;

  const handleSubmit = async () => {
    const validationError = validateOtp(otp);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    await onSubmit(booking.id, otp);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Start Job"
      canCloseOnOutsideClick={!isSubmitting}
      className="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="blue"
            onClick={handleSubmit}
            loading={isSubmitting}
            iconLeft={<PlayCircle size={16} />}
          >
            Confirm & Start
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 rounded-xl border bg-blue-500/15 text-blue-400 border-blue-500/30">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            Starting the job will notify the client that you have arrived and work is commencing.
            The status will change to "In Progress".
          </p>
        </div>

        <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Service</span>
            <span className="text-sm font-semibold text-foreground">{category.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Scheduled Date</span>
            <span className="font-medium text-foreground">{formatDate(date)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Scheduled Time</span>
            <span className="font-medium text-foreground">{formatTime12(startTime)}</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Location</span>
            <span className="font-medium text-foreground text-right max-w-50 truncate">
              {booking.addressLabel}
            </span>
          </div>
        </div>
        <div>
          <Label>Enter OTP from Client</Label>
          <Input
            error={error}
            value={otp}
            leftIcon={<Eye size={16} />}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) {
                setOtp(value);
                setError('');
              }
            }}
            placeholder="Enter 6-digit OTP"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </AppModal>
  );
}
