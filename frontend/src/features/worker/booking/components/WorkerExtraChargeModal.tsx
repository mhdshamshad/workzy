import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCheck, Clock, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { ImageUpload } from '@/components/molecules/ImageUpload';
import { UploadPurposes } from '@/constants';
import { useBookingDetails } from '@/hooks/useBookingDetails';
import { cn } from '@/lib/utils';

import { ExtraChargeSchema, type ExtraChargeFormType } from '../validation/extraChargeSchema';

interface WorkerExtraChargeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExtraChargeFormType) => Promise<void>;
  bookingId: string | null;
  isSubmitting?: boolean;
}

export default function WorkerExtraChargeModal({
  open,
  onClose,
  onSubmit,
  bookingId,
}: WorkerExtraChargeModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { booking } = useBookingDetails(bookingId);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExtraChargeFormType>({
    resolver: zodResolver(ExtraChargeSchema),
    mode: 'onChange',
    defaultValues: {
      reason: '',
      amount: 0,
      evidenceUrl: '',
    },
  });

  useEffect(() => {
    if (!open) {
      setHasInitialized(false);
      return;
    }

    if (open && booking && !hasInitialized) {
      if (booking.extraCharge) {
        reset({
          reason: booking.extraCharge.reason,
          amount: booking.extraCharge.amount,
          evidenceUrl: booking.extraCharge.evidenceUrl || '',
        });
        setIsEditMode(false);
      } else {
        reset({
          reason: '',
          amount: 0,
          evidenceUrl: '',
        });
        setIsEditMode(true);
      }
      setHasInitialized(true);
    }
  }, [open, booking, hasInitialized, reset]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };
  if (!booking) {
    return null;
  }
  const { extraCharge } = booking;

  const onFormSubmit = async (data: ExtraChargeFormType) => {
    await onSubmit(data);
    setIsEditMode(false);
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={isSubmitting || isUploading} onClick={handleClose}>
        {isEditMode ? 'Cancel' : 'Close'}
      </Button>
      {extraCharge && extraCharge.status === 'pending' && !isEditMode && (
        <Button onClick={() => setIsEditMode(true)}>Edit</Button>
      )}
      {isEditMode && (
        <Button
          variant="warning"
          disabled={isSubmitting || isUploading}
          onClick={handleSubmit(onFormSubmit)}
          loading={isSubmitting}
        >
          Request Extra Charge
        </Button>
      )}
    </div>
  );

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title={isEditMode ? 'Request Extra Charge' : 'Extra Charge Request'}
      canCloseOnOutsideClick={!isSubmitting && !isUploading}
      className="max-w-lg"
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        {!isEditMode ? (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-xl border mb-2',
              booking.extraCharge?.status === 'approved'
                ? 'bg-green-500/10 text-green-600 border-green-500/20'
                : booking.extraCharge?.status === 'rejected'
                  ? 'bg-red-500/10 text-red-600 border-red-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
            )}
          >
            {booking.extraCharge?.status === 'approved' ? (
              <CheckCheck size={16} />
            ) : booking.extraCharge?.status === 'rejected' ? (
              <XCircle size={16} />
            ) : (
              <Clock size={16} />
            )}
            <span className="text-sm font-semibold capitalize">
              Status: {booking.extraCharge?.status}
            </span>
          </div>
        ) : (
          <div className="flex gap-3 p-3 rounded-xl border bg-amber-500/15 text-amber-500 border-amber-500/30">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Extra charges must be reviewed and approved by the client.{' '}
              <strong>Minimum amount is ₹60</strong> (Stripe requirement). Provide a clear reason
              and evidence.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label>Amount (₹)</Label>
          <Input
            className="px-3"
            type="number"
            placeholder="Enter amount"
            disabled={!isEditMode}
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Reason</Label>
          <Textarea
            placeholder="Briefly explain why this extra charge is needed..."
            disabled={!isEditMode}
            error={errors.reason?.message}
            {...register('reason')}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Evidence </Label>
          <Controller
            name="evidenceUrl"
            rules={{
              validate: v => (v ? true : 'Image is required'),
            }}
            control={control}
            render={({ field, fieldState }) => (
              <ImageUpload
                value={field.value}
                onChange={url => field.onChange(url)}
                error={fieldState.error?.message}
                className="h-40"
                isEditable={isEditMode}
                purpose={UploadPurposes.SERVICE_EVIDENCE}
                onUploadingChange={setIsUploading}
              />
            )}
          />
        </div>
      </div>
    </AppModal>
  );
}
