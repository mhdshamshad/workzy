import dayjs from 'dayjs';
import { Clock, CalendarDays, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { ROLE, type Role } from '@/constants';
import type { BookingDetails } from '@/types/booking';
import { handleApiError } from '@/utils/handleApiError';
import { formatTimeRange } from '@/utils/time.format';

import { useCancelReschedule, useRespondReschedule } from '../hooks/useReschedule';

interface Props {
  booking: BookingDetails;
  role: Role;
  onClose: () => void;
}
type ResponseOption = 'accepted' | 'rejected';

export default function ReschedulePendingView({ booking, role, onClose }: Props) {
  const { rescheduleRequest } = booking;
  const { mutateAsync: respond, isPending: isResponding } = useRespondReschedule();
  const { mutateAsync: cancel, isPending: isCancelling } = useCancelReschedule();
  const [selected, setSelected] = useState<ResponseOption | null>(null);

  if (!rescheduleRequest) {
    return null;
  }

  const { requestedBy, newDate, newStartTime, newEndTime, reason, requestedAt, status } =
    rescheduleRequest;

  const oldSlot = booking.dates.find(d => d.date);
  const oldDateStr = oldSlot ? dayjs(oldSlot.date).format('dddd, MMM DD YYYY') : 'Unknown';
  const oldTimeStr = oldSlot ? formatTimeRange(oldSlot.startTime, oldSlot.endTime) : 'Unknown';

  const isRequester = requestedBy === role;
  const isResponder = !isRequester && role !== ROLE.ADMIN;
  const isLoading = isResponding || isCancelling;

  const requesterLabel = requestedBy === ROLE.USER ? 'Customer' : 'Worker';
  const newDateStr = dayjs(newDate).format('dddd, MMM DD YYYY');

  const handleRespond = async () => {
    if (!selected) {
      return;
    }
    try {
      const { message } = await respond({
        bookingId: booking.id,
        data: { status: selected, role },
      });
      toast.success(message);
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const handleCancel = async () => {
    try {
      const { message } = await cancel({ bookingId: booking.id, requestedBy: role });
      toast.success(message);
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const options: { value: ResponseOption; label: string; icon: React.ReactNode }[] = [
    {
      value: 'accepted',
      label: 'Accept',
      icon: <CheckCircle2 size={15} />,
    },
    {
      value: 'rejected',
      label: 'Reject',
      icon: <XCircle size={15} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-200 dark:border-amber-900/40">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Reschedule Pending
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Requested by {requesterLabel} · {dayjs(requestedAt).format('MMM DD, hh:mm A')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Current Schedule
          </p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            {oldDateStr}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {oldTimeStr}
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-500/10 dark:border-blue-900/40 p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
            Proposed Schedule
          </p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {newDateStr}
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Clock className="w-4 h-4" />
            {formatTimeRange(newStartTime, newEndTime)}
          </div>
        </div>
      </div>

      {reason && (
        <div className="space-y-1">
          <Label className="text-muted-foreground uppercase tracking-wide text-xs">Reason</Label>
          <div className="text-sm bg-muted p-2 rounded-md min-h-24 leading-6">{reason}</div>
        </div>
      )}

      {isResponder && status === 'pending' && (
        <div className="flex flex-col gap-3 -pt-2">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-border">
            {options.map(opt => {
              const isSelected = selected === opt.value;
              const isAccept = opt.value === 'accepted';
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setSelected(isSelected ? null : opt.value)}
                  className={`
                    flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                    ${
                      isSelected
                        ? isAccept
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-red-500 text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-border mt-4">
        <Button
          onClick={onClose}
          type="button"
          disabled={isLoading}
          variant="secondary"
          size="md"
          className="shrink-0 "
        >
          Close
        </Button>
        {isResponder && status === 'pending' && (
          <Button
            fullWidth
            disabled={!selected || isLoading}
            loading={isResponding}
            onClick={handleRespond}
            className={`
                font-semibold transition-colors duration-200
                ${
                  selected === 'accepted'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : selected === 'rejected'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'opacity-50 cursor-not-allowed'
                }
                `}
          >
            {selected === 'accepted'
              ? 'Confirm Acceptance'
              : selected === 'rejected'
                ? 'Confirm Rejection'
                : 'Select a response above'}
          </Button>
        )}
        {isRequester && status === 'pending' && (
          <Button
            variant="red"
            fullWidth
            loading={isCancelling}
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancel Request
          </Button>
        )}
      </div>
    </div>
  );
}
