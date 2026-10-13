import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { ImageUpload } from '@/components/molecules/ImageUpload';
import { PAYOUT_METHOD } from '@/constants/payout';
import { UploadPurposes } from '@/constants/upload';
import {
  approvePayoutSchema,
  type ApprovePayoutFormType,
  useApprovePayout,
} from '@/features/wallet';
import type { BankPayoutSnapshot, PayoutRequest, UpiPayoutSnapshot } from '@/types/payout';
import { formatCurrency } from '@/utils/currency';
import { handleApiError } from '@/utils/handleApiError';

type SnapshotFields = Partial<BankPayoutSnapshot & UpiPayoutSnapshot>;
interface ApprovePayoutFormProps {
  payout: PayoutRequest;
  onBack: () => void;
  onSuccess: () => void;
}

export function ApprovePayoutForm({ payout, onBack, onSuccess }: ApprovePayoutFormProps) {
  const { mutateAsync, isPending } = useApprovePayout();
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ApprovePayoutFormType>({
    resolver: zodResolver(approvePayoutSchema),
    defaultValues: {
      referenceId: '',
      receiptUrl: '',
    },
  });

  const snapshot = (payout.payoutSnapshot ?? {}) as SnapshotFields;
  const isBank = payout.method === PAYOUT_METHOD.BANK;

  const destinationRows: [string, string | undefined][] = isBank
    ? [
        ['Account Holder', snapshot.accountHolderName],
        ['Bank', snapshot.bankName],
        ['Account Number', snapshot.accountNumber],
        ['IFSC', snapshot.ifscCode],
      ]
    : [['UPI ID', snapshot.upiId]];

  const onSubmit = handleSubmit(async values => {
    if (isUploadingReceipt) {
      return;
    }
    try {
      const response = await mutateAsync({
        id: payout.id,
        data: values,
      });
      toast.success(response.message);
      onSuccess();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs space-y-1.5">
        <div className="flex justify-between items-center pb-1 border-b border-border/50">
          <span className="text-muted-foreground font-medium">Payout Amount</span>
          <strong className="text-sm font-semibold text-foreground">
            {formatCurrency(payout.amount)}
          </strong>
        </div>
        {destinationRows.map(([label, value]) =>
          value ? (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-mono text-foreground">{value}</span>
            </div>
          ) : null
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-medium">
          Transaction ID <span className="text-destructive">*</span>
        </Label>
        <Input
          {...register('referenceId')}
          placeholder="e.g. 412345678901"
          error={errors.referenceId?.message}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">
          Receipt Slip / Transfer Screenshot <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="receiptUrl"
          control={control}
          render={({ field, fieldState }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              purpose={UploadPurposes.PAYOUT_RECEIPT}
              error={fieldState.error?.message}
              onUploadingChange={setIsUploadingReceipt}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isPending || isUploadingReceipt}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="green"
          size="sm"
          disabled={isPending || isUploadingReceipt}
          loading={isPending || isUploadingReceipt}
        >
          Confirm Approval
        </Button>
      </div>
    </form>
  );
}
