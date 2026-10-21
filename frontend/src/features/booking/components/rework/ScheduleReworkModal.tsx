import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { AppModal } from '@/components/molecules/AppModal';
import { MediaThumbnailGrid } from '@/components/molecules/MediaThumbnailGrid';
import DateSelector from '@/features/slots/components/DateSelector';
import TimeSlotSelector from '@/features/slots/components/TimeSlotSelector';
import { useRescheduleDates, useRescheduleSlots } from '@/features/slots/hooks/useSlot';
import type { BookingDetails, BookingListItem } from '@/types/booking';
import type { AvailableSlot } from '@/types/slot';
import { handleApiError } from '@/utils/handleApiError';
import { formatTimeRange } from '@/utils/time.format';

import { useRescheduleReworkSlot, useScheduleReworkSlot } from '../../hooks/useBooking';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | BookingListItem;
}

type ReworkStep = 'date' | 'slots';

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 30 : -30 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -30 : 30 }),
};

export default function ScheduleReworkModal({ isOpen, onClose, booking }: Props) {
  const rework = booking.rework;
  const isReschedule = rework?.status === 'scheduled' || !!rework?.scheduledSlot;
  const scheduledSlot = rework?.scheduledSlot;

  const defaultDate = scheduledSlot?.date
    ? dayjs(scheduledSlot.date).format('YYYY-MM-DD')
    : rework?.preferredDate
      ? dayjs(rework.preferredDate).format('YYYY-MM-DD')
      : dayjs().add(1, 'day').format('YYYY-MM-DD');

  const [step, setStep] = useState<ReworkStep>('date');
  const [direction, setDirection] = useState<number>(1);
  const [date, setDate] = useState(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [startTime, setStartTime] = useState(scheduledSlot?.startTime || '');
  const [endTime, setEndTime] = useState(scheduledSlot?.endTime || '');
  const [isManualTime, setIsManualTime] = useState(false);

  const {
    data: datesData,
    isLoading: isDatesLoading,
    error: datesError,
    refetch: refetchDates,
  } = useRescheduleDates(booking.id);

  const {
    data: slotsData,
    isLoading: isSlotsLoading,
    error: slotsError,
    refetch: refetchSlots,
  } = useRescheduleSlots({
    bookingId: booking.id,
    date: date || '',
  });

  const isFullDay = datesData?.isFullDay ?? false;
  const { mutateAsync: scheduleSlot, isPending: isSchedulePending } = useScheduleReworkSlot();
  const { mutateAsync: rescheduleSlot, isPending: isReschedulePending } = useRescheduleReworkSlot();
  const isPending = isSchedulePending || isReschedulePending;

  useEffect(() => {
    if (isOpen) {
      setStep('date');
      setDirection(1);
      const initial = scheduledSlot?.date
        ? dayjs(scheduledSlot.date).format('YYYY-MM-DD')
        : rework?.preferredDate
          ? dayjs(rework.preferredDate).format('YYYY-MM-DD')
          : dayjs().add(1, 'day').format('YYYY-MM-DD');
      setDate(initial);
      setSelectedSlot(null);
      setStartTime(scheduledSlot?.startTime || '');
      setEndTime(scheduledSlot?.endTime || '');
      setIsManualTime(false);
    }
  }, [isOpen, rework?.preferredDate, scheduledSlot]);

  useEffect(() => {
    if (isFullDay && !startTime) {
      setStartTime('09:00');
      setEndTime('18:00');
    }
  }, [isFullDay, startTime]);

  const handleDateSelect = (newDate: string) => {
    setDate(newDate);
    setSelectedSlot(null);
    if (!isManualTime) {
      if (isFullDay) {
        setStartTime('09:00');
        setEndTime('18:00');
      } else {
        setStartTime('');
        setEndTime('');
      }
    }
  };

  const handleSlotSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
  };

  const goToStep = (newStep: ReworkStep) => {
    if (newStep === 'slots' && !date) {
      toast.error('Please pick a date first');
      return;
    }
    setDirection(newStep === 'slots' ? 1 : -1);
    setStep(newStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Please pick a date for the rework');
      return;
    }
    if (!startTime || !endTime) {
      toast.error('Please select an appointment slot');
      return;
    }
    if (startTime >= endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    try {
      const payload = {
        date,
        startTime,
        endTime,
      };

      if (isReschedule) {
        const res = await rescheduleSlot({ id: booking.id, data: payload });
        toast.success(res.message);
      } else {
        const res = await scheduleSlot({ id: booking.id, data: payload });
        toast.success(res.message);
      }
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const preferredDateStr = rework?.preferredDate
    ? dayjs(rework.preferredDate).format('YYYY-MM-DD')
    : null;

  const footer = (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="text-xs text-muted-foreground truncate">
        {step === 'date' ? (
          date ? (
            <span className="font-medium text-foreground">
              Selected Date: {dayjs(date).format('ddd, DD MMM YYYY')}
            </span>
          ) : (
            <span>Pick a date to proceed</span>
          )
        ) : date && startTime && endTime ? (
          <span className="font-medium text-foreground">
            {dayjs(date).format('DD MMM')}: {formatTimeRange(startTime, endTime)}
          </span>
        ) : (
          <span>Select an available slot</span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {step === 'slots' ? (
          <>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => goToStep('date')}
              iconLeft={<ChevronLeft size={14} />}
            >
              Back
            </Button>
            <Button
              variant={isReschedule ? 'warning' : 'blue'}
              loading={isPending}
              disabled={isPending || !date || !startTime || !endTime}
              onClick={handleSubmit}
              iconLeft={isReschedule ? <RotateCcw size={14} /> : <Calendar size={14} />}
            >
              {isReschedule ? 'Confirm Reschedule' : 'Confirm Schedule'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" disabled={isPending} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="blue"
              disabled={!date}
              onClick={() => goToStep('slots')}
              iconRight={<ChevronRight size={14} />}
            >
              Choose Slot
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      title={isReschedule ? 'Change Rework Slot' : 'Schedule Rework Appointment'}
      canCloseOnOutsideClick={!isPending}
      footer={footer}
      className="max-w-xl"
    >
      <div className="space-y-4 py-1 text-sm text-foreground">
        {/* Step Indicator Navigation */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-1.5">
          <button
            type="button"
            onClick={() => goToStep('date')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              step === 'date'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === 'date'
                  ? 'bg-primary text-primary-foreground'
                  : date
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {date && step !== 'date' ? '✓' : '1'}
            </div>
            <span>1. Select Date</span>
          </button>

          <div className="h-4 w-px bg-border/80 mx-1" />

          <button
            type="button"
            onClick={() => goToStep('slots')}
            disabled={!date}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              !date
                ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                : step === 'slots'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                step === 'slots'
                  ? 'bg-primary text-primary-foreground'
                  : startTime && endTime
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {startTime && endTime && step !== 'slots' ? '✓' : '2'}
            </div>
            <span>2. Select Time Slot</span>
          </button>
        </div>

        {/* Existing Scheduled Slot Callout (if rescheduling) */}
        {isReschedule && scheduledSlot && (
          <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <span className="font-semibold">Current Scheduled Slot:</span>{' '}
                <span>
                  {dayjs(scheduledSlot.date).format('ddd, DD MMM YYYY')} (
                  {formatTimeRange(scheduledSlot.startTime, scheduledSlot.endTime)})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Animated Steps Container */}
        <AnimatePresence mode="wait" custom={direction}>
          {step === 'date' ? (
            <motion.div
              key="step-date"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Customer Rework Details */}
              {rework?.reason && (
                <div className="rounded-lg border border-border bg-card/60 p-3 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <Wrench size={13} className="text-primary" />
                    <span>Customer's Rework Request:</span>
                  </div>
                  <p className="text-foreground leading-relaxed pl-4 border-l-2 border-primary/40">
                    {rework.reason}
                  </p>
                  {rework.preferredDate && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Clock size={13} />
                        Customer Preferred Date: {dayjs(rework.preferredDate).format('DD MMM YYYY')}
                      </span>
                      {date !== preferredDateStr && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[11px] px-2 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          onClick={() => handleDateSelect(preferredDateStr!)}
                        >
                          Use this date
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Attached Evidence */}
              {rework?.evidence && rework.evidence.length > 0 && (
                <div className="space-y-1.5">
                  <MediaThumbnailGrid
                    label="Attached Evidence from Customer"
                    items={rework.evidence}
                  />
                </div>
              )}

              {/* Date Selection Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    Pick a Rework Date
                  </span>
                  {date && (
                    <span className="text-xs text-muted-foreground">
                      Selected:{' '}
                      <strong className="text-foreground">
                        {dayjs(date).format('DD MMM YYYY')}
                      </strong>
                    </span>
                  )}
                </div>

                <DateSelector
                  isLoading={isDatesLoading}
                  error={datesError}
                  refetch={refetchDates}
                  dates={datesData?.dates ?? {}}
                  selectedDate={date}
                  onDateSelect={handleDateSelect}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-slots"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Selected Date Header Bar */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-muted-foreground block">
                      Appointment Date
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {dayjs(date).format('dddd, DD MMMM YYYY')}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary gap-1"
                  onClick={() => goToStep('date')}
                >
                  Change Date
                </Button>
              </div>

              {/* Slot Selector or Manual Time */}
              {isFullDay ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Full Day Project Service
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      This service is configured for full day. The appointment is scheduled for the
                      entire working hours of {dayjs(date).format('DD MMM YYYY')}.
                    </p>
                  </div>
                </div>
              ) : isManualTime ? (
                <div className="space-y-3 rounded-xl border border-border p-3.5 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Custom Time Window</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-primary"
                      onClick={() => setIsManualTime(false)}
                    >
                      Use available slots
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Start Time</Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">End Time</Label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Clock size={13} className="text-primary" />
                      Select an Available Time Slot
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                      onClick={() => setIsManualTime(true)}
                    >
                      <SlidersHorizontal size={12} />
                      Custom time
                    </Button>
                  </div>

                  <TimeSlotSelector
                    isLoading={isSlotsLoading}
                    error={slotsError}
                    refetch={refetchSlots}
                    slots={slotsData?.slots ?? []}
                    selectedDate={date}
                    selectedSlot={selectedSlot}
                    onSelectSlot={handleSlotSelect}
                    estimatedDuration={(booking.duration || 60) * (booking.itemCount || 1)}
                  />

                  {startTime && endTime && (
                    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          Chosen Slot: {formatTimeRange(startTime, endTime)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        {dayjs(date).format('ddd, DD MMM YYYY')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppModal>
  );
}
