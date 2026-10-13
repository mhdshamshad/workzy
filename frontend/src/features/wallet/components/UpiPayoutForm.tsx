import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Info, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { Badge } from '@/components/ui/badge';
import { PAYOUT_METHOD, PAYOUT_METHOD_STATUS } from '@/constants/payout';
import {
  getStatusBadgeVariant,
  upiDetailsSchema,
  useSetPrimaryWalletMethod,
  useUpdateUpiDetails,
  type UpiDetailsFormType,
} from '@/features/wallet';
import type { UpiDetails } from '@/types/payout';
import { handleApiError } from '@/utils/handleApiError';

interface UpiPayoutFormProps {
  upiDetails?: UpiDetails;
  showMakePrimary: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onRequestRemove?: () => void;
}

export function UpiPayoutForm({
  upiDetails,
  showMakePrimary,
  onSuccess,
  onCancel,
  onRequestRemove,
}: UpiPayoutFormProps) {
  const updateUpi = useUpdateUpiDetails();
  const setPrimary = useSetPrimaryWalletMethod();
  const [makePrimary, setMakePrimary] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpiDetailsFormType>({
    resolver: zodResolver(upiDetailsSchema),
    defaultValues: {
      upiId: upiDetails?.upiId ?? '',
    },
  });

  useEffect(() => {
    if (upiDetails) {
      reset({
        upiId: upiDetails.upiId ?? '',
      });
    }
  }, [upiDetails, reset]);

  const hasChanges = isDirty || makePrimary;

  const onSubmit = handleSubmit(async data => {
    try {
      const res = await updateUpi.mutateAsync(data);
      if (makePrimary) {
        await setPrimary.mutateAsync(PAYOUT_METHOD.UPI);
      }
      toast.success(res.message);
      onSuccess();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  });

  const isSaving = updateUpi.isPending || setPrimary.isPending;

  return (
    <div className="space-y-4">
      {upiDetails && (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(upiDetails.status)}>
            {upiDetails.status === PAYOUT_METHOD_STATUS.PENDING
              ? 'Verification pending'
              : upiDetails.status}
          </Badge>
        </div>
      )}
      {upiDetails?.status === PAYOUT_METHOD_STATUS.REJECTED && upiDetails.rejectReason && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Rejected by admin:</p>
            <p className="mt-0.5">{upiDetails.rejectReason}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs">UPI Virtual Payment Address (VPA)</Label>
          <Input
            placeholder="e.g. yourname@upi, 9876543210@paytm"
            {...register('upiId')}
            error={errors.upiId?.message}
          />
        </div>
        {showMakePrimary && (
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={makePrimary}
              onChange={e => setMakePrimary(e.target.checked)}
              className="rounded border-input text-primary focus:ring-ring"
            />
            <span className="text-xs text-muted-foreground">
              Set this UPI ID as my primary payout method
            </span>
          </label>
        )}
        <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0 mt-0.5 text-primary" />
          <span>
            Changes to your UPI ID require admin verification before withdrawals can be processed.
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {upiDetails ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRequestRemove}
              disabled={isSaving}
              className="text-destructive hover:bg-destructive/10 text-xs"
            >
              <Trash2 className="size-3.5 mr-1" />
              Remove UPI ID
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSaving}
              disabled={!hasChanges || isSaving}
              className="min-w-32 bg-[#534AB7] hover:bg-[#3C3489] text-white"
            >
              Save Details
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
