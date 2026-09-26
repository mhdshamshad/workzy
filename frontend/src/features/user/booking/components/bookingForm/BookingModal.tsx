import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import Button from '@/components/atoms/Button';
import { AppModal } from '@/components/molecules/AppModal';
import { BOOKING_STEPS, PRICING_MODE, STEP_LABELS, type BookingStep } from '@/constants';
import type { PublicWorkerListItem } from '@/types/worker';

import { useBooking } from '../../hooks/useBooking';
import CountStep from '../bookingForm/CountStep';
import DateStep from '../bookingForm/DateStep';
import InstructionsStep from '../bookingForm/InstructionsStep';
import ReviewStep from '../bookingForm/ReviewStep';
import SlotsStep from '../bookingForm/SlotsStep';
import StepIndicator from '../bookingForm/StepIndicator';

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  worker: PublicWorkerListItem;
}

export default function BookingModal({ open, onClose, worker }: BookingModalProps) {
  const isPerUnit = worker.pricingMode === PRICING_MODE.PER_UNIT;
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const steps = useMemo<BookingStep[]>(
    () => [
      ...(isPerUnit ? [BOOKING_STEPS.COUNT] : []),
      BOOKING_STEPS.DATE,
      BOOKING_STEPS.SLOTS,
      BOOKING_STEPS.INSTRUCTIONS,
      BOOKING_STEPS.REVIEW,
    ],
    [isPerUnit]
  );

  const step = steps[stepIndex];

  const {
    booking,
    setBooking,
    pricing,
    lat,
    lng,
    isReleasing,
    isReserving,
    isBooking,
    handleDateSelect,
    handleSlotSelect,
    handleReserve,
    handleConfirm,
    handleClose,
  } = useBooking(worker);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= steps.length) {
      return;
    }
    setDirection(idx > stepIndex ? 1 : -1);
    setStepIndex(idx);
  };

  const canNext = (): boolean => {
    switch (step) {
      case BOOKING_STEPS.COUNT:
        return booking.itemCount >= 1;
      case BOOKING_STEPS.DATE:
        return !!booking.date;
      case BOOKING_STEPS.SLOTS:
        return !!booking.slot;
      case BOOKING_STEPS.INSTRUCTIONS:
      case BOOKING_STEPS.REVIEW:
        return true;
      default:
        return false;
    }
  };

  const handleContinue = async () => {
    if (step === BOOKING_STEPS.SLOTS) {
      const ok = await handleReserve();
      if (!ok) {
        return;
      }
      goTo(stepIndex + 1);
      return;
    }
    if (step === BOOKING_STEPS.REVIEW) {
      await handleConfirm();
      return;
    }
    goTo(stepIndex + 1);
  };

  const onClose_ = async () => {
    await handleClose();
    setStepIndex(0);
    onClose();
  };

  const isLastStep = stepIndex === steps.length - 1;

  const footer = (
    <div className="flex gap-3">
      {stepIndex > 0 && (
        <Button
          variant="outline"
          onClick={() => goTo(stepIndex - 1)}
          disabled={isReleasing || isReserving || isBooking}
          iconLeft={<ChevronLeft className="w-4 h-4" />}
          className="shrink-0"
        >
          Back
        </Button>
      )}
      <div className="flex-1">
        {isLastStep ? (
          <Button variant="green" fullWidth loading={isBooking} onClick={handleConfirm}>
            Confirm Booking
          </Button>
        ) : (
          <Button
            variant="primary"
            fullWidth
            disabled={!canNext() || isReserving}
            onClick={handleContinue}
            loading={isReserving}
            iconRight={<ChevronRight className="w-4 h-4" />}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <AppModal
      open={open}
      onClose={onClose_}
      title="Book a Service"
      description={worker.displayName}
      isDescriptionHidden={false}
      canCloseOnOutsideClick={!isReleasing && !isReserving && !isBooking}
      footer={footer}
      className="md:max-w-md"
    >
      <StepIndicator steps={steps} current={step} labels={STEP_LABELS} />
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
          {step === BOOKING_STEPS.COUNT && (
            <CountStep worker={worker} booking={booking} setBooking={setBooking} />
          )}
          {step === BOOKING_STEPS.DATE && (
            <DateStep
              worker={worker}
              booking={booking}
              lat={lat}
              lng={lng}
              onDateSelect={handleDateSelect}
            />
          )}
          {step === BOOKING_STEPS.SLOTS && (
            <SlotsStep
              worker={worker}
              booking={booking}
              lat={lat}
              lng={lng}
              onSelectSlot={handleSlotSelect}
            />
          )}
          {step === BOOKING_STEPS.INSTRUCTIONS && (
            <InstructionsStep
              booking={booking}
              setBooking={setBooking}
              onSkip={() => goTo(stepIndex + 1)}
            />
          )}
          {step === BOOKING_STEPS.REVIEW && (
            <ReviewStep worker={worker} booking={booking} pricing={pricing} />
          )}
        </motion.div>
      </AnimatePresence>
    </AppModal>
  );
}
