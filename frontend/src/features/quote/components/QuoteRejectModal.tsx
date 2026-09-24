import { AlertTriangle } from 'lucide-react';

import { AppModal } from '@/components/molecules/AppModal';
import type { QuoteListItem } from '@/types/quote';
import { formatCurrency } from '@/utils/currency';

interface Props {
  open: boolean;
  onClose: () => void;
  quote: QuoteListItem;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function QuoteRejectModal({ open, onClose, quote, onSubmit, isSubmitting }: Props) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      canCloseOnOutsideClick={!isSubmitting}
      title="Decline Quote"
      description="Are you sure you want to decline this quote?"
      isDescriptionHidden={false}
      className="max-w-md"
      isConfirmLoading={isSubmitting}
      confirmText="Decline Quote"
      buttonVariant="red"
      onConfirm={onSubmit}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5 rounded-xl bg-section-red border border-text-section-red-border  px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-section-red-text mt-0.5 shrink-0" />
          <p className="text-sm text-section-red-text leading-snug">
            This action cannot be undone. The worker will be notified that you've declined their
            quote.
          </p>
        </div>

        {/* Quote summary */}
        <div className="rounded-xl bg-muted/60 border border-border px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Worker
            </span>
            <span className="text-sm font-semibold">{quote.worker.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Service
            </span>
            <span className="text-sm font-semibold">{quote.category.name}</span>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-2 mt-1">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Quote amount
            </span>
            <span className="text-lg font-bold tabular-nums">
              {formatCurrency(quote.totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
