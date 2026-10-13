import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { AppModal } from '@/components/molecules/AppModal';
import { MIN_PAYOUT_AMOUNT } from '@/constants/payout';
import { useRequestPayout } from '@/features/wallet';
import { formatCurrency } from '@/utils/currency';
import { handleApiError } from '@/utils/handleApiError';

const QUICK_AMOUNTS = [500, 1000, 2000];

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  available: number;
  destinationLabel?: string;
}

export function WithdrawModal({ open, onClose, available, destinationLabel }: WithdrawModalProps) {
  const { mutateAsync, isPending } = useRequestPayout();
  const [amount, setAmount] = useState('');

  const value = Number(amount);
  const error = !amount
    ? undefined
    : value < MIN_PAYOUT_AMOUNT
      ? `Minimum withdrawal is ${formatCurrency(MIN_PAYOUT_AMOUNT)}`
      : value > available
        ? 'Amount exceeds your available balance'
        : undefined;
  const canSubmit = Boolean(amount) && !error;

  const close = () => {
    setAmount('');
    onClose();
  };

  const submit = async () => {
    try {
      const res = await mutateAsync(value);
      toast.success(res.message);
      close();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={close}
      title="Withdraw Available Earnings"
      description="Enter the amount you wish to withdraw to your primary payout destination."
      isDescriptionHidden={false}
      className="sm:max-w-md"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="outline" onClick={close} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="green" loading={isPending} disabled={!canSubmit} onClick={submit}>
            Submit Request
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-2">
          <div className="flex justify-between items-center">
            <span>Available for Withdrawal:</span>
            <strong className="text-foreground text-sm font-semibold">
              {formatCurrency(available)}
            </strong>
          </div>
          {destinationLabel && (
            <div className="flex justify-between items-center pt-2 border-t border-border/50 text-[11px]">
              <span>Destination:</span>
              <span className="font-medium text-foreground">{destinationLabel}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Withdrawal Amount (₹)</Label>
          <Input
            type="number"
            min={MIN_PAYOUT_AMOUNT}
            max={available}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={`Min ${formatCurrency(MIN_PAYOUT_AMOUNT)}`}
            error={error}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_AMOUNTS.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              disabled={v > available}
              className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 cursor-pointer"
            >
              ₹{v}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(String(available))}
            disabled={available < MIN_PAYOUT_AMOUNT}
            className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent disabled:opacity-40 cursor-pointer"
          >
            Max Available
          </button>
        </div>
      </div>
    </AppModal>
  );
}
