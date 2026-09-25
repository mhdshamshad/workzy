import dayjs from 'dayjs';
import { CalendarDays, Clock, CreditCard, CheckCircle2 } from 'lucide-react';

import { AppModal } from '@/components/molecules/AppModal';
import type { BookingSlot } from '@/types/booking';
import type { QuoteListItem } from '@/types/quote';
import { formatCurrency } from '@/utils/currency';

function SlotRow({ slot }: { slot: BookingSlot }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground">
        <CalendarDays className="h-3 w-3 text-primary/70 shrink-0" />
        {dayjs(slot.date).format('ddd, MMM D')}
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
        <Clock className="h-3 w-3 shrink-0" />
        {slot.startTime} – {slot.endTime}
      </span>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  quote: QuoteListItem;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

export function QuoteApproveModal({ open, onClose, quote, onSubmit, isSubmitting }: Props) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      canCloseOnOutsideClick={!isSubmitting}
      title="Accept Quote"
      description="Review the details below before confirming."
      isDescriptionHidden={false}
      className="max-w-xl"
      isConfirmLoading={isSubmitting}
      confirmText="Accept & Pay"
      buttonVariant="green"
      onConfirm={onSubmit}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5 rounded-xl bg-section-green border border-section-green-border px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-section-green-text mt-0.5 shrink-0" />
          <p className="text-sm text-section-green-text leading-snug">
            By accepting this quote, you'll be redirected to complete the payment securely.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
            Scheduled dates
          </p>
          <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-1">
            {quote.dates.map((slot, i) => (
              <SlotRow key={i} slot={slot} />
            ))}
          </div>
        </div>
        {quote.message && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Note from worker
            </p>
            <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">
              "{quote.message}"
            </p>
          </div>
        )}
        <div className="flex items-center justify-between rounded-xl bg-muted/60 border border-border px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Total to pay
          </span>
          <span className="text-lg font-bold tabular-nums">{formatCurrency(quote.totalPrice)}</span>
        </div>
      </div>
    </AppModal>
  );
}
