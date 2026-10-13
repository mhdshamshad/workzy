import { Landmark, QrCode, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

import Button from '@/components/atoms/Button';
import { AppModal } from '@/components/molecules/AppModal';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { PAYOUT_METHOD, PAYOUT_REQUEST_STATUS } from '@/constants/payout';
import { RejectPayoutForm, ApprovePayoutForm, getStatusBadgeVariant } from '@/features/wallet';
import type { PayoutRequest } from '@/types/payout';
import { formatCurrency } from '@/utils/currency';
import { formatSmartDateTime } from '@/utils/time.format';

interface PayoutDetailsModalProps {
  open: boolean;
  payout: PayoutRequest;
  mode: 'worker' | 'admin';
  onClose: () => void;
}

type ModalView = 'details' | 'approve' | 'reject';

export function PayoutDetailsModal({ open, payout, mode, onClose }: PayoutDetailsModalProps) {
  const [view, setView] = useState<ModalView>('details');

  useEffect(() => {
    if (open) {
      setView('details');
    }
  }, [open, payout?.id]);

  const { payoutSnapshot: snapshot, method } = payout;
  const isAdmin = mode === 'admin';
  const isPending = payout.status === PAYOUT_REQUEST_STATUS.PENDING;
  const isBank = method === PAYOUT_METHOD.BANK;
  const bankSnapshot = isBank && snapshot && 'accountHolderName' in snapshot ? snapshot : null;
  const upiSnapshot = !isBank && snapshot && 'upiId' in snapshot ? snapshot : null;

  const modalMeta = {
    details: {
      title: 'Payout Details',
      description: 'Review the payout request details.',
    },
    approve: {
      title: 'Approve Payout',
      description:
        'Transfer the amount to the destination below, then record the UTR and upload transfer receipt.',
    },
    reject: {
      title: 'Reject Payout',
      description: 'Provide a reason for rejection. This reason will be shown to the worker.',
    },
  }[view];

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={modalMeta.title}
      description={modalMeta.description}
      isDescriptionHidden={false}
      className="sm:max-w-xl"
      hideFooter
    >
      {view === 'approve' && (
        <ApprovePayoutForm payout={payout} onBack={() => setView('details')} onSuccess={onClose} />
      )}

      {view === 'reject' && (
        <RejectPayoutForm payout={payout} onBack={() => setView('details')} onSuccess={onClose} />
      )}

      {view === 'details' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <ProfileImage
              src={payout.worker?.profileImage}
              name={payout.worker?.displayName || 'Worker'}
              size={42}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {payout.worker?.displayName || 'Worker'}
              </p>
              {payout.worker?.phone && (
                <p className="text-xs text-muted-foreground">{payout.worker.phone}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="Amount" value={formatCurrency(payout.amount)} />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={getStatusBadgeVariant(payout.status)}>{payout.status}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DetailItem label="Requested Date" value={formatSmartDateTime(payout.createdAt)} />
            <DetailItem label="Method" value={isBank ? 'Bank Transfer' : 'UPI'} />
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2">
              {isBank ? (
                <Landmark className="h-4 w-4 text-primary" />
              ) : (
                <QrCode className="h-4 w-4 text-primary" />
              )}
              <p className="text-sm font-semibold">Payout Destination</p>
            </div>

            {isBank ? (
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Account Holder" value={bankSnapshot?.accountHolderName ?? '—'} />
                <DetailItem label="Bank" value={bankSnapshot?.bankName ?? '—'} />
                <DetailItem
                  label="Account Number"
                  value={bankSnapshot?.accountNumber ?? '—'}
                  mono
                />
                <DetailItem label="IFSC" value={bankSnapshot?.ifscCode ?? '—'} mono />
              </div>
            ) : (
              <DetailItem label="UPI ID" value={upiSnapshot?.upiId ?? '—'} mono />
            )}
          </div>

          <DetailItem
            label="Withdrawable Balance After Request"
            value={formatCurrency(payout.withdrawableBalanceAfter)}
          />

          {payout.status === PAYOUT_REQUEST_STATUS.APPROVED && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {payout.referenceId && (
                  <DetailItem label="Transaction ID" value={payout.referenceId} mono />
                )}
                {payout.processedAt && (
                  <DetailItem
                    label="Processed Date"
                    value={formatSmartDateTime(payout.processedAt)}
                  />
                )}
              </div>
              {payout.receiptUrl && (
                <div className="pt-1">
                  <a
                    href={payout.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Transfer Receipt
                  </a>
                </div>
              )}
            </div>
          )}

          {payout.status === PAYOUT_REQUEST_STATUS.REJECTED && payout.rejectionReason && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs font-medium text-destructive">Rejection Reason</p>
              <p className="mt-1 text-sm text-muted-foreground">{payout.rejectionReason}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            {isAdmin && isPending ? (
              <>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="red" size="sm" onClick={() => setView('reject')}>
                  Reject
                </Button>
                <Button variant="green" size="sm" onClick={() => setView('approve')}>
                  Approve
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      )}
    </AppModal>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DetailItem({ label, value, mono = false }: DetailItemProps) {
  return (
    <div className="space-y-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium text-foreground truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  );
}
