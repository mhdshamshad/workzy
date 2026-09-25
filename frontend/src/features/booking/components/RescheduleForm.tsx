import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import Select from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import { RESCHEDULE_STEPS, type RescheduleStep } from '@/constants';
import DateSelector from '@/features/slots/components/DateSelector';
import TimeSlotSelector from '@/features/slots/components/TimeSlotSelector';
import StepIndicator from '@/features/user/booking/components/bookingForm/StepIndicator';
import type { BookingDetails } from '@/types/booking';
import { formatTimeRange } from '@/utils/time.format';

import type { useRescheduleFlow } from '../hooks/useRescheduleFlow';
import type { bookingRescheduleFormType } from '../validation/bookingRescheduleFormData';

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

interface Props {
  booking: BookingDetails;
  ctx: ReturnType<typeof useRescheduleFlow>;
  onSubmit: (data: bookingRescheduleFormType) => Promise<void>;
  isRescheduling: boolean;
}

export default function RescheduleForm({ booking, ctx, onSubmit, isRescheduling }: Props) {
  const {
    flow,
    step,
    steps,
    stepIndex,
    direction,
    isFullDay,
    isLoading,
    dates,
    datesError,
    isDatesLoading,
    refetchDates,
    slots,
    slotsError,
    isSlotsLoading,
    refetchSlots,
    slotOptions,
    form,
    goTo,
    canNext,
    handleDateSelect,
    handleSlotSelect,
    handleContinue,
  } = ctx;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  return (
    <>
      <StepIndicator
        steps={steps}
        current={step}
        labels={
          Object.fromEntries(
            Object.values(RESCHEDULE_STEPS).map(s => [s, s.charAt(0).toUpperCase() + s.slice(1)])
          ) as Record<RescheduleStep, string>
        }
      />
      <form id="reschedule-form" onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {step === RESCHEDULE_STEPS.DATE && (
              <DateSelector
                isLoading={isDatesLoading}
                error={datesError}
                refetch={refetchDates}
                dates={dates ?? {}}
                selectedDate={flow.date}
                onDateSelect={handleDateSelect}
              />
            )}
            {step === RESCHEDULE_STEPS.SLOTS && (
              <TimeSlotSelector
                isLoading={isSlotsLoading}
                error={slotsError}
                refetch={refetchSlots}
                slots={slots}
                selectedDate={flow.date}
                selectedSlot={flow.slot ?? null}
                onSelectSlot={handleSlotSelect}
                estimatedDuration={booking.duration * booking.itemCount}
              />
            )}
            {step === RESCHEDULE_STEPS.PREVIEW && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex flex-col gap-1">
                  <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                    New Schedule
                  </p>
                  <p className="text-sm font-semibold text-emerald-800">
                    {dayjs(flow.date).format('dddd, MMM DD YYYY')}
                  </p>
                  {!isFullDay && flow.slot && (
                    <p className="text-xs text-emerald-700">
                      {formatTimeRange(flow.slot.startTime, flow.slot.endTime)}
                    </p>
                  )}
                  {isFullDay && <p className="text-xs text-emerald-700">Full day</p>}
                </div>
                <div className="space-y-1">
                  <Label>Slot to Change</Label>
                  <Select
                    value={watch('oldSlotId')}
                    placeholder="Select current scheduled date"
                    options={
                      slotOptions
                        .filter(v => booking.dates.some(slot => slot.date === v.date))
                        .map(val => ({
                          label: `${dayjs(val.date).format('dddd, MMM DD YYYY')} ${isFullDay ? '' : formatTimeRange(val.startTime, val.endTime)}`,
                          value: val.id,
                        })) ?? []
                    }
                    error={errors.oldSlotId?.message}
                    onChange={val => setValue('oldSlotId', val, { shouldValidate: true })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Reason</Label>
                  <Textarea
                    {...register('reason')}
                    error={errors.reason?.message}
                    placeholder="e.g. Need to shift by a day due to travel..."
                    className="text-sm bg-muted/40 min-h-27.5"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </form>
      <div className="flex gap-3 pt-4 border-t border-border mt-4">
        <Button
          onClick={() => goTo(stepIndex - 1)}
          type="button"
          disabled={stepIndex === 0 || isLoading}
          variant="secondary"
          iconLeft={<ChevronLeft className="w-4 h-4" />}
          className="shrink-0"
        >
          Back
        </Button>
        {step === RESCHEDULE_STEPS.PREVIEW ? (
          <Button
            type="submit"
            form="reschedule-form"
            fullWidth
            variant="green"
            disabled={!canNext() || isLoading}
          >
            {isRescheduling ? 'Submitting...' : 'Confirm Reschedule'}
          </Button>
        ) : (
          <Button
            type="button"
            fullWidth
            onClick={() => handleContinue()}
            disabled={!canNext() || isLoading}
            iconRight={<ChevronRight className="w-4 h-4" />}
          >
            {isLoading ? 'Please wait...' : 'Continue'}
          </Button>
        )}
      </div>
    </>
  );
}
