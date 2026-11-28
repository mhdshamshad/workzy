import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, KeyRound, RotateCw, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { MultiUpload } from '@/components/molecules/MultiUpload';
import { useOtpTimer } from '@/features/auth/hooks/useOtpTimer';
import {
  completeReworkFormData,
  type CompleteReworkFormType,
} from '@/features/booking/validation/completeReworkFormData';
import type { BookingDetails, BookingListItem } from '@/types/booking';
import { handleApiError } from '@/utils/handleApiError';

import { useCompleteRework, useSendReworkOtp } from '../../hooks/useBooking';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | BookingListItem;
}

export default function CompleteReworkModal({ isOpen, onClose, booking }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { timer, resetTimer } = useOtpTimer(60);
  const { mutateAsync: sendOtp, isPending: isSendingOtp } = useSendReworkOtp();
  const { mutateAsync: completeRework, isPending: isCompleting } = useCompleteRework();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CompleteReworkFormType>({
    resolver: zodResolver(completeReworkFormData),
    defaultValues: { otp: '', workerNote: '', completionEvidence: [] },
    mode: 'onChange',
  });

  const isPending = isSendingOtp || isCompleting || isUploading;

  useEffect(() => {
    if (!isOpen) {
      reset();
      setOtpSent(false);
    }
  }, [isOpen, reset]);

  const handleSendOtp = async () => {
    try {
      const res = await sendOtp(booking.id);
      toast.success(res.message || 'Verification OTP sent to customer');
      setOtpSent(true);
      resetTimer();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const onSubmit = async (data: CompleteReworkFormType) => {
    try {
      const res = await completeRework({ id: booking.id, data });
      toast.success(res.message);
      onClose();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button variant="outline" disabled={isPending} onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="green"
        loading={isCompleting}
        disabled={isPending || isUploading}
        onClick={handleSubmit(onSubmit)}
        iconLeft={<CheckCircle2 size={14} />}
      >
        Verify & Complete Rework
      </Button>
    </div>
  );

  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      title="Complete Rework Job"
      canCloseOnOutsideClick={!isPending}
      footer={footer}
      className="max-w-lg"
    >
      <div className="space-y-4 py-1 text-sm text-foreground">
        <p className="text-xs text-muted-foreground">
          Confirm all warranty concerns are addressed. Enter the customer's verification OTP to
          complete.
        </p>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Resolution Notes (Optional)</Label>
          <Textarea
            {...register('workerNote')}
            placeholder="Summarize the repairs made..."
            className="min-h-20 resize-none text-xs"
            disabled={isPending}
            error={errors.workerNote?.message}
          />
        </div>

        <div className="space-y-1.5">
          <Controller
            name="completionEvidence"
            control={control}
            render={({ field }) => (
              <MultiUpload
                label="Completion Proof (Required, 1–3 files)"
                value={field.value}
                onChange={field.onChange}
                purpose="SERVICE_EVIDENCE"
                maxFiles={3}
                autoCompress
                onUploadingChange={setIsUploading}
              />
            )}
          />
          {errors.completionEvidence?.message && (
            <p className="text-xs text-destructive">{errors.completionEvidence.message}</p>
          )}
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Customer Verification OTP <span className="text-destructive">*</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 border-primary/30"
              onClick={handleSendOtp}
              disabled={isSendingOtp || (otpSent && timer > 0)}
              loading={isSendingOtp}
            >
              {otpSent && timer > 0 ? (
                <>
                  <RotateCw className="h-3 w-3 animate-spin" />
                  Resend in {timer}s
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  {otpSent ? 'Resend OTP' : 'Send OTP to Customer'}
                </>
              )}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            {otpSent
              ? 'OTP sent to customer. Ask for it once they inspect the work.'
              : 'Click "Send OTP" when finished so the customer can verify.'}
          </p>

          <div className="space-y-1 pt-1">
            <Input
              leftIcon={<KeyRound className="h-4 w-4 text-muted-foreground" />}
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              disabled={isPending}
              error={errors.otp?.message}
              {...register('otp', {
                onChange: e => {
                  e.target.value = e.target.value.replace(/\D/g, '');
                },
              })}
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
}
