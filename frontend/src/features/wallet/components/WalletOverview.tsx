import {
  ArrowUpRight,
  Hourglass,
  Landmark,
  Settings,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AppModal } from '@/components/molecules/AppModal';
import ErrorState from '@/components/molecules/ErrorState';
import StatCard from '@/components/molecules/StatCard';
import { Badge } from '@/components/ui/badge';
import { MIN_PAYOUT_AMOUNT, PAYOUT_METHOD, type PayoutMethod } from '@/constants/payout';
import {
  getPrimaryDestination,
  getStatusBadgeVariant,
  useSetPrimaryWalletMethod,
  WithdrawModal,
  AdminWalletMethodRejectModal,
  PayoutMethodsCard,
  WalletOverviewSkeleton,
  WorkerPayoutSettingsModal,
} from '@/features/wallet';
import type { ApiError } from '@/lib/api/apiError';
import type { Wallet } from '@/types/wallet';
import { formatCurrency } from '@/utils/currency';

type ModalState =
  | { type: 'withdraw' }
  | { type: 'settings'; method: PayoutMethod }
  | { type: 'reject-method'; method: PayoutMethod }
  | { type: 'verify-method'; method: PayoutMethod }
  | null;

interface WalletOverviewProps {
  wallet?: Wallet;
  isLoading?: boolean;
  isError?: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  role?: 'admin' | 'worker';
  verifyMethod?: (method: PayoutMethod) => Promise<unknown> | void;
  rejectMethod?: (method: PayoutMethod, reason: string) => Promise<unknown> | void;
  isPending?: boolean;
}

export function WalletOverview({
  wallet,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  role = 'worker',
  verifyMethod,
  rejectMethod,
  isPending = false,
}: WalletOverviewProps) {
  const isAdmin = role === 'admin';
  const setPrimary = useSetPrimaryWalletMethod();
  const [modal, setModal] = useState<ModalState>(null);

  const available = wallet?.withdrawableBalance ?? 0;
  const destination = getPrimaryDestination(wallet);
  const canWithdraw = Boolean(destination?.verified) && available >= MIN_PAYOUT_AMOUNT;
  const busy = isPending || setPrimary.isPending;

  const handleRejectMethod = async (reason: string) => {
    if (modal?.type !== 'reject-method' || !rejectMethod) {
      return;
    }
    await rejectMethod(modal.method, reason);
    setModal(null);
  };

  if (isError) {
    return (
      <ErrorState title="Couldn't load wallet" description={error?.message} onRetry={onRetry} />
    );
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <WalletOverviewSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
          <div className="relative flex min-h-60 flex-col justify-between overflow-hidden rounded-[22px] bg-[#534AB7] p-6 text-white shadow-sm">
            <span className="pointer-events-none absolute -right-14 -top-16 size-55 rounded-full bg-white/10" />
            <span className="pointer-events-none absolute -bottom-24 right-12 size-50 rounded-full bg-white/[0.07]" />
            <span className="pointer-events-none absolute -bottom-14 -left-12 size-35 rounded-full bg-white/5" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-white/20">
                  <WalletIcon className="size-5" />
                </span>
                <span className="font-semibold text-sm tracking-wide">
                  {isAdmin ? 'Worker wallet' : 'Workzy wallet'}
                </span>
              </div>
              <Badge variant={getStatusBadgeVariant(wallet?.payoutStatus)}>
                {wallet?.payoutStatus}
              </Badge>
            </div>

            <div className="relative my-3">
              <p className="text-[13px] text-[#CECBF6] font-medium">Withdrawable balance</p>
              <p className="mt-0.5 text-3xl sm:text-4xl font-bold tracking-tight">
                {formatCurrency(wallet?.withdrawableBalance ?? 0)}
              </p>
              <p className="mt-1 text-xs text-[#AFA9EC]">Instant IMPS / UPI settlement available</p>
            </div>

            <div className="relative flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/15">
              <div className="flex items-center gap-2 text-[13px] text-[#EEEDFE]">
                <Landmark className="size-4.5 shrink-0" />
                <span className="truncate max-w-50">
                  {destination?.label ?? 'Payout method unconfigured'}
                </span>
              </div>

              {!isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        type: 'settings',
                        method: wallet?.payout?.primaryMethod ?? PAYOUT_METHOD.BANK,
                      })
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white/15 px-3.5 text-xs font-medium transition-colors hover:bg-white/25 cursor-pointer"
                  >
                    <Settings className="size-3.5" />
                    Payout settings
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: 'withdraw' })}
                    disabled={!canWithdraw}
                    title={
                      destination?.verified
                        ? undefined
                        : 'Your primary payout method must be verified'
                    }
                    className="inline-flex h-9 items-center gap-1 rounded-xl bg-white px-3.5 text-xs font-semibold text-[#3C3489] transition-colors hover:bg-[#EEEDFE] disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowUpRight className="size-3.5" />
                    Request payout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-4">
            <StatCard
              icon={<Hourglass className="size-5" />}
              label="Pending balance"
              value={formatCurrency(wallet?.pendingBalance ?? 0)}
              sub="Held in escrow or awaiting payout approval"
              tone="warning"
            />
            <StatCard
              icon={<TrendingUp className="size-5" />}
              label="Total earned"
              value={formatCurrency(wallet?.totalEarned ?? 0)}
              sub="All-time earnings on completed bookings"
              tone="success"
            />
          </div>
        </div>
      )}

      <PayoutMethodsCard
        wallet={wallet}
        isLoading={isLoading}
        isAdmin={isAdmin}
        busy={busy}
        onConfigure={(method: PayoutMethod) => setModal({ type: 'settings', method })}
        onSetPrimary={async (method: PayoutMethod) => {
          const res = await setPrimary.mutateAsync(method);
          toast.success(res.message);
        }}
        onVerify={(method: PayoutMethod) => setModal({ type: 'verify-method', method })}
        onReject={(method: PayoutMethod) => setModal({ type: 'reject-method', method })}
      />

      {isAdmin ? (
        <>
          <AppModal
            open={modal?.type === 'verify-method'}
            onClose={() => setModal(null)}
            title="Are you sure you want to verify this payout method?"
            description="Once verified, the worker will be able to receive withdrawals to this destination."
            isDescriptionHidden={false}
            confirmText="Verify Method"
            buttonVariant="green"
            isConfirmLoading={isPending}
            onConfirm={async () => {
              if (modal?.type === 'verify-method' && verifyMethod) {
                await verifyMethod(modal.method);
                setModal(null);
              }
            }}
            className="sm:max-w-md"
          />
          <AdminWalletMethodRejectModal
            open={modal?.type === 'reject-method'}
            isLoading={isPending}
            onClose={() => setModal(null)}
            onSubmit={handleRejectMethod}
          />
        </>
      ) : (
        <>
          <WithdrawModal
            open={modal?.type === 'withdraw'}
            onClose={() => setModal(null)}
            available={available}
            destinationLabel={destination?.label}
          />
          <WorkerPayoutSettingsModal
            open={modal?.type === 'settings'}
            method={modal?.type === 'settings' ? modal.method : null}
            wallet={wallet}
            onClose={() => setModal(null)}
          />
        </>
      )}
    </div>
  );
}
