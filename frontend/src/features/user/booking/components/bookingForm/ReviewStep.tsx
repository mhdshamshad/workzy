import { CalendarDays, Clock, Percent, StickyNote, Zap } from 'lucide-react';

import { PRICING_MODE } from '@/constants';
import type { BookingState } from '@/types/slot';
import type { PublicWorkerListItem } from '@/types/worker';
import { formatDuration, formatDate, formatTime12 } from '@/utils/time.format';

import type { BookingPricing } from '../../hooks/useBooking';

export default function ReviewStep({
  worker,
  booking,
  pricing,
}: {
  worker: PublicWorkerListItem;
  booking: BookingState;
  pricing: BookingPricing;
}) {
  const isPerUnit = worker.pricingMode === PRICING_MODE.PER_UNIT;

  const rows = [
    {
      icon: <CalendarDays className="w-4 h-4" />,
      label: 'Date & Time',
      value: booking.slot
        ? `${formatDate(booking.date, 'calendar')} · ${formatTime12(booking.slot.startTime)}`
        : '—',
    },
    ...(worker.estimatedDuration
      ? [
          {
            icon: <Clock className="w-4 h-4" />,
            label: 'Duration',
            value: formatDuration(worker.estimatedDuration * booking.itemCount),
          },
        ]
      : []),
    ...(isPerUnit
      ? [
          {
            icon: <span className="text-sm leading-none font-bold">×</span>,
            label: 'Items',
            value: `${booking.itemCount} item${booking.itemCount > 1 ? 's' : ''}`,
          },
        ]
      : []),
    ...(booking.note
      ? [
          {
            icon: <StickyNote className="w-4 h-4" />,
            label: 'Note',
            value: booking.note,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border">
        <img
          src={worker.profileImage}
          alt={worker.displayName}
          className="w-11 h-11 rounded-xl object-cover ring-1 ring-border"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{worker.displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{worker.tagline}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map(row => (
          <div key={row.label} className="flex gap-3 text-sm">
            <span className="text-muted-foreground mt-0.5 shrink-0">{row.icon}</span>
            <div>
              <p className="text-[11px] text-muted-foreground">{row.label}</p>
              <p className="font-medium text-foreground text-xs leading-relaxed">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          Price Breakdown
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Rate{isPerUnit ? ` × ${booking.itemCount}` : ''}
          </span>
          <span className="font-medium">₹{pricing.subtotal.toLocaleString('en-IN')}</span>
        </div>
        {pricing.travelCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Travel
            </span>
            <span>+₹{pricing.travelCost.toLocaleString('en-IN')}</span>
          </div>
        )}
        {pricing.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span className="flex items-center gap-1">
              <Percent className="w-3 h-3" /> {pricing.discountPercent}% bulk discount
            </span>
            <span className="font-semibold">
              −₹{pricing.discountAmount.toLocaleString('en-IN')}
            </span>
          </div>
        )}
        <div className="border-t border-border mt-1 pt-2 flex justify-between">
          <span className="font-bold text-sm">Total</span>
          <span className="font-extrabold text-base">₹{pricing.total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
