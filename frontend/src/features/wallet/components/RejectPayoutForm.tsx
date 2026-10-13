import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { rejectPayoutSchema, type RejectPayoutFormType } from '@/features/wallet';
import type { PayoutRequest } from '@/types/payout';
import { handleApiError } from '@/utils/handleApiError';

import { useRejectPayout } from '../hooks/useAdminPayout';

interface RejectPayoutFormProps {
  payout: PayoutRequest;
  onBack: () => void;
  onSuccess: () => void;
}

export function RejectPayoutForm({ payout, onBack, onSuccess }: RejectPayoutFormProps) {
  const { mutateAsync, isPending } = useRejectPayout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectPayoutFormType>({
    resolver: zodResolver(rejectPayoutSchema),
    defaultValues: {
      reason: '',
    },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      const res = await mutateAsync({
        id: payout.id,
        data: values,
      });
      toast.success(res.message);
      onSuccess();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Rejection Reason <span className="text-destructive">*</span>
        </Label>
        <Textarea
          {...register('reason')}
          rows={4}
          placeholder="Reason for rejection (min 10 characters)"
          error={errors.reason?.message}
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onBack} disabled={isPending}>
          Back
        </Button>
        <Button type="submit" variant="red" size="sm" disabled={isPending} loading={isPending}>
          Confirm Rejection
        </Button>
      </div>
    </form>
  );
}
