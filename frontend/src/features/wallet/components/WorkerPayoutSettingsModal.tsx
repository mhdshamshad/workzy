import { Landmark, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AppModal } from '@/components/molecules/AppModal';
import { PAYOUT_METHOD, type PayoutMethod } from '@/constants/payout';
import { BankPayoutForm, UpiPayoutForm, RemovePayoutMethodModal } from '@/features/wallet';
import type { Wallet } from '@/types/wallet';

const TABS = [
  { method: PAYOUT_METHOD.BANK, label: 'Bank Account', Icon: Landmark },
  { method: PAYOUT_METHOD.UPI, label: 'UPI ID', Icon: QrCode },
];

interface WorkerPayoutSettingsModalProps {
  open: boolean;
  wallet?: Wallet;
  method?: PayoutMethod | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function WorkerPayoutSettingsModal({
  open,
  method,
  wallet,
  onClose,
  onSaved,
}: WorkerPayoutSettingsModalProps) {
  const { bankDetails: bank, upiDetails: upi, primaryMethod } = wallet?.payout ?? {};

  const [tab, setTab] = useState<PayoutMethod>(method ?? PAYOUT_METHOD.BANK);
  const [removing, setRemoving] = useState<PayoutMethod | null>(null);

  useEffect(() => {
    if (method) {
      setTab(method);
    }
  }, [method]);

  const handleSuccess = () => {
    if (onSaved) {
      onSaved();
    } else {
      onClose();
    }
  };

  const isBank = tab === PAYOUT_METHOD.BANK;
  const isUpi = tab === PAYOUT_METHOD.UPI;
  const showMakePrimary = Boolean(primaryMethod) && primaryMethod !== tab;
  const isOnlyMethod = removing === PAYOUT_METHOD.BANK ? !upi : !bank;

  return (
    <>
      <AppModal
        open={open}
        onClose={onClose}
        title={isUpi ? 'UPI ID Settings' : 'Bank Account Details'}
        description="Configure where your withdrawals are sent. Changes need admin verification."
        isDescriptionHidden={false}
        className="sm:max-w-xl"
        hideFooter
      >
        <div className="space-y-4">
          <div
            role="tablist"
            className="flex gap-1 rounded-xl bg-secondary p-1 border border-border/50"
          >
            {TABS.map(({ method: tabMethod, label, Icon }) => (
              <button
                key={tabMethod}
                type="button"
                role="tab"
                aria-selected={tab === tabMethod}
                onClick={() => setTab(tabMethod)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[9px] py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  tab === tabMethod
                    ? 'bg-card text-foreground shadow-xs ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {label}
                {(tabMethod === PAYOUT_METHOD.BANK ? bank : upi) && (
                  <span className="size-2 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
          </div>

          {/* Form Content */}
          {isBank ? (
            <BankPayoutForm
              bankDetails={bank}
              showMakePrimary={showMakePrimary}
              onCancel={onClose}
              onSuccess={handleSuccess}
              onRequestRemove={() => setRemoving(PAYOUT_METHOD.BANK)}
            />
          ) : (
            <UpiPayoutForm
              upiDetails={upi}
              showMakePrimary={showMakePrimary}
              onCancel={onClose}
              onSuccess={handleSuccess}
              onRequestRemove={() => setRemoving(PAYOUT_METHOD.UPI)}
            />
          )}
        </div>
      </AppModal>

      <RemovePayoutMethodModal
        open={Boolean(removing)}
        method={removing}
        isOnlyMethod={isOnlyMethod}
        onClose={() => setRemoving(null)}
        onSuccess={() => {
          setRemoving(null);
          handleSuccess();
        }}
      />
    </>
  );
}
