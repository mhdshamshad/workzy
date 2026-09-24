import { Info, MapPin, Navigation } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { AppModal } from '@/components/molecules/AppModal';

interface WorkerConfirmStatusModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting?: boolean;
  type: 'en_route' | 'reached';
}

export default function WorkerConfirmStatusModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
  type,
}: WorkerConfirmStatusModalProps) {
  const isEnRoute = type === 'en_route';
  const title = isEnRoute ? 'Confirm En Route' : 'Confirm Arrival';
  const confirmText = isEnRoute ? "Yes, I'm on my way" : "Yes, I've arrived";
  const buttonVariant = isEnRoute ? 'blue' : 'green';

  const handleSubmit = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      canCloseOnOutsideClick={!isSubmitting}
      className="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleSubmit}
            loading={isSubmitting}
            iconLeft={isEnRoute ? <Navigation size={16} /> : <MapPin size={16} />}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 p-3 rounded-xl border bg-blue-500/15 text-blue-400 border-blue-500/30">
          <Info size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed">
            {isEnRoute
              ? 'This will notify the customer that you are on your way to their location.'
              : 'This will notify the customer that you have arrived at their location and are ready to begin.'}
          </p>
        </div>
        <p className="text-sm text-muted-foreground px-1">
          Are you sure you want to update the booking status to{' '}
          <strong className={isEnRoute ? 'text-blue-400' : 'text-green-400'}>
            {isEnRoute ? 'En Route' : 'Reached'}
          </strong>
          ?
        </p>
      </div>
    </AppModal>
  );
}
