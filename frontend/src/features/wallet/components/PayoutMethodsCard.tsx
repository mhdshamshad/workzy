import { Landmark, QrCode, Settings } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { Badge } from '@/components/ui/badge';
import {
  PAYOUT_METHOD,
  PAYOUT_METHOD_STATUS,
  type PayoutMethod,
  type PayoutMethodStatus,
} from '@/constants/payout';
import { getStatusBadgeVariant, maskAccount } from '@/features/wallet';
import type { Wallet } from '@/types/wallet';

import type { ReactNode } from 'react';

type Entry = {
  method: PayoutMethod;
  icon: ReactNode;
  title: string;
  lines: string[];
  status: PayoutMethodStatus;
  rejectReason?: string;
  copyValue: string;
};

interface PayoutMethodsCardProps {
  wallet?: Wallet;
  isLoading: boolean;
  isAdmin: boolean;
  busy: boolean;
  onConfigure: (method: PayoutMethod) => void;
  onSetPrimary: (method: PayoutMethod) => void;
  onVerify: (method: PayoutMethod) => void;
  onReject: (method: PayoutMethod) => void;
}

export function PayoutMethodsCard({
  wallet,
  isLoading,
  isAdmin,
  busy,
  onConfigure,
  onSetPrimary,
  onVerify,
  onReject,
}: PayoutMethodsCardProps) {
  const { bankDetails: bank, upiDetails: upi, primaryMethod } = wallet?.payout ?? {};

  const entries: Entry[] = [];
  if (bank) {
    entries.push({
      method: PAYOUT_METHOD.BANK,
      icon: <Landmark className="size-5" />,
      title: bank.bankName || 'Bank Transfer',
      status: bank.status,
      rejectReason: bank.rejectReason,
      copyValue: bank.accountNumber,
      lines: [
        `${bank.accountHolderName} · ${isAdmin ? bank.accountNumber : maskAccount(bank.accountNumber)}`,
        `IFSC: ${bank.ifscCode}`,
      ],
    });
  }
  if (upi) {
    entries.push({
      method: PAYOUT_METHOD.UPI,
      icon: <QrCode className="size-5" />,
      title: 'UPI Virtual ID',
      status: upi.status,
      rejectReason: upi.rejectReason,
      copyValue: upi.upiId,
      lines: [upi.upiId, 'Instant VPA transfer supported'],
    });
  }

  const renderActions = (e: Entry) =>
    isAdmin ? (
      <>
        {e.status === PAYOUT_METHOD_STATUS.PENDING && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="green"
              disabled={busy}
              onClick={() => onVerify(e.method)}
              className="h-8 text-xs"
            >
              Verify
            </Button>
            <Button
              size="sm"
              variant="red"
              disabled={busy}
              onClick={() => onReject(e.method)}
              className="h-8 text-xs"
            >
              Reject
            </Button>
          </div>
        )}
      </>
    ) : (
      <>
        {e.method !== primaryMethod && (
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onSetPrimary(e.method)}
            className="h-8 text-xs"
          >
            Set primary
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onConfigure(e.method)}
          className="h-8 text-xs text-muted-foreground"
        >
          Edit
        </Button>
      </>
    );

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-foreground">Receiving Account Method</p>
          <Badge variant={entries.length ? 'green' : 'amber'}>
            {entries.length ? 'Configured' : 'Setup required'}
          </Badge>
        </div>
        {!isAdmin && (
          <button
            type="button"
            onClick={() => onConfigure(primaryMethod ?? PAYOUT_METHOD.BANK)}
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Settings className="size-3.5" />
            {entries.length ? 'Update Details' : 'Configure Account'}
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(e => {
          const isPrimary = e.method === primaryMethod;
          return (
            <div
              key={e.method}
              className={`flex items-center gap-3.5 rounded-2xl p-4 transition-all ${
                isPrimary
                  ? 'border-2 border-[#534AB7] bg-[#534AB7]/5 dark:bg-[#534AB7]/10'
                  : 'border border-border bg-card'
              }`}
            >
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  isPrimary ? 'bg-[#534AB7] text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {e.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-semibold text-xs sm:text-sm text-foreground truncate">
                    {e.title}
                  </p>
                  {isPrimary && (
                    <span className="rounded-full bg-[#534AB7]/15 px-2 py-0.5 text-[11px] font-semibold text-[#534AB7] dark:text-[#AFA9EC]">
                      Primary
                    </span>
                  )}
                  <Badge variant={getStatusBadgeVariant(e.status)}>{e.status}</Badge>
                </div>
                {e.lines.map(line => (
                  <p key={line} className="truncate text-xs text-muted-foreground mt-0.5">
                    {line}
                  </p>
                ))}
                {e.status === PAYOUT_METHOD_STATUS.REJECTED && e.rejectReason && (
                  <p className="text-[11px] text-destructive mt-1 font-medium">
                    Reason: {e.rejectReason}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">{renderActions(e)}</div>
            </div>
          );
        })}

        {!entries.length && !isLoading && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-6 text-center bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {isAdmin
                ? 'This worker has not added a bank account or UPI ID yet.'
                : 'No Indian bank account or UPI ID has been set up yet. Withdrawals cannot be processed.'}
            </p>
            {!isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigure(PAYOUT_METHOD.BANK)}
                className="mt-3"
              >
                Add Payout Destination
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
