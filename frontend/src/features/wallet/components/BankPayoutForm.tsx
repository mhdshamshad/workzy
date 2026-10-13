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
  bankDetailsSchema,
  getStatusBadgeVariant,
  useSetPrimaryWalletMethod,
  useUpdateBankDetails,
  type BankDetailsFormType,
} from '@/features/wallet';
import type { BankDetails } from '@/types/payout';
import { handleApiError } from '@/utils/handleApiError';

interface BankPayoutFormProps {
  bankDetails?: BankDetails;
  showMakePrimary: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onRequestRemove?: () => void;
}

export function BankPayoutForm({
  bankDetails,
  showMakePrimary,
  onSuccess,
  onCancel,
  onRequestRemove,
}: BankPayoutFormProps) {
  const updateBank = useUpdateBankDetails();
  const setPrimary = useSetPrimaryWalletMethod();
  const [makePrimary, setMakePrimary] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BankDetailsFormType>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountHolderName: bankDetails?.accountHolderName ?? '',
      bankName: bankDetails?.bankName ?? '',
      ifscCode: bankDetails?.ifscCode ?? '',
      accountNumber: bankDetails?.accountNumber ?? '',
    },
  });

  useEffect(() => {
    if (bankDetails) {
      reset({
        accountHolderName: bankDetails.accountHolderName ?? '',
        bankName: bankDetails.bankName ?? '',
        ifscCode: bankDetails.ifscCode ?? '',
        accountNumber: bankDetails.accountNumber ?? '',
      });
    }
  }, [bankDetails, reset]);

  const onSubmit = handleSubmit(async data => {
    try {
      const res = await updateBank.mutateAsync(data);
      if (makePrimary) {
        await setPrimary.mutateAsync(PAYOUT_METHOD.BANK);
      }
      toast.success(res.message);
      onSuccess();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  });

  const isSaving = updateBank.isPending || setPrimary.isPending;
  const hasChanges = isDirty || makePrimary;
  return (
    <div className="space-y-4">
      {bankDetails && (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(bankDetails.status)}>
            {bankDetails.status === PAYOUT_METHOD_STATUS.PENDING
              ? 'Verification pending'
              : bankDetails.status}
          </Badge>
        </div>
      )}

      {/* Rejection Alert */}
      {bankDetails?.status === PAYOUT_METHOD_STATUS.REJECTED && bankDetails.rejectReason && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Rejected by admin:</p>
            <p className="mt-0.5">{bankDetails.rejectReason}</p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Account Holder Name</Label>
            <Input
              placeholder="As printed on bank passbook or statement"
              {...register('accountHolderName')}
              error={errors.accountHolderName?.message}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Bank Name</Label>
              <Input
                placeholder="e.g. HDFC Bank, SBI"
                {...register('bankName')}
                error={errors.bankName?.message}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">IFSC Code</Label>
              <Input
                placeholder="e.g. HDFC0001234"
                maxLength={11}
                {...register('ifscCode')}
                error={errors.ifscCode?.message}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Account Number</Label>
            <Input
              placeholder="Enter your bank account number"
              {...register('accountNumber')}
              error={errors.accountNumber?.message}
            />
          </div>
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
              Set this bank account as my primary payout method
            </span>
          </label>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
          <Info className="size-4 shrink-0 mt-0.5 text-primary" />
          <span>
            Changes to your bank details require admin verification before withdrawals can be
            processed.
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {bankDetails ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRequestRemove}
              disabled={isSaving}
              className="text-destructive hover:bg-destructive/10 text-xs"
            >
              <Trash2 className="size-3.5 mr-1" />
              Remove Account
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
