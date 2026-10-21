import { zodResolver } from '@hookform/resolvers/zod';
import { Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { MultiUpload } from '@/components/molecules/MultiUpload';
import {
  requestReworkFormData,
  type RequestReworkFormType,
} from '@/features/booking/validation/requestReworkFormData';
import type { BookingDetails, BookingListItem } from '@/types/booking';
import { handleApiError } from '@/utils/handleApiError';

import { useRequestRework } from '../../hooks/useBooking';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | BookingListItem;
}

export default function RequestReworkModal({ isOpen, onClose, booking }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: requestRework, isPending } = useRequestRework();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RequestReworkFormType>({
    resolver: zodResolver(requestReworkFormData),
    defaultValues: { reason: '', preferredDate: '', evidence: [] },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen) {reset();}
  }, [isOpen, reset]);

  const onSubmit = async (data: RequestReworkFormType) => {
    try {
      const res = await requestRework({ id: booking.id, data });
      toast.success(res.message);
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={isPending || isUploading} onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="blue"
        loading={isPending}
        disabled={isPending || isUploading}
        onClick={handleSubmit(onSubmit)}
        iconLeft={<Wrench size={14} />}
      >
        {isUploading ? 'Uploading Media...' : 'Submit Rework Request'}
      </Button>
    </div>
  );

  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      title="Request Rework (10-Day Warranty)"
      canCloseOnOutsideClick={!isPending && !isUploading}
      footer={footer}
      className="max-w-xl"
    >
      <div className="space-y-4 py-1 text-sm text-foreground">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          You have a <strong>one-time</strong> complimentary rework within 10 days of completion.
          Please describe the issue and attach evidence.
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            Reason for Rework <span className="text-destructive">*</span>
          </Label>
          <Textarea
            {...register('reason')}
            placeholder="Describe what needs fixing..."
            className="min-h-24 resize-none text-xs"
            disabled={isPending}
            error={errors.reason?.message}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Preferred Date (Optional)</Label>
          <Input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            disabled={isPending}
            {...register('preferredDate')}
          />
        </div>

        <div className="space-y-1.5">
          <Controller
            name="evidence"
            control={control}
            render={({ field }) => (
              <MultiUpload
                label="Evidence Photos / Videos (Required, 1–3 files)"
                value={field.value}
                onChange={field.onChange}
                purpose="SERVICE_EVIDENCE"
                maxFiles={3}
                autoCompress
                onUploadingChange={setIsUploading}
              />
            )}
          />
          {errors.evidence?.message && (
            <p className="text-xs text-destructive">{errors.evidence.message}</p>
          )}
        </div>
      </div>
    </AppModal>
  );
}
