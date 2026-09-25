import { motion } from 'framer-motion';
import { Minus, Percent, Plus } from 'lucide-react';

import type { BookingState } from '@/types/slot';
import type { PublicWorkerListItem } from '@/types/worker';
import { formatDuration } from '@/utils/time.format';

function getBestDiscount(w: PublicWorkerListItem, count: number) {
  if (!w.bulkDiscounts?.length) {
    return null;
  }
  const eligible = w.bulkDiscounts.filter(d => count >= d.count);
  if (!eligible.length) {
    return null;
  }
  return eligible.reduce((a, b) => (a.percent > b.percent ? a : b));
}

export default function CountStep({
  worker,
  booking,
  setBooking,
}: {
  worker: PublicWorkerListItem;
  booking: BookingState;
  setBooking: React.Dispatch<React.SetStateAction<BookingState>>;
}) {
  const count = booking.itemCount;
  const best = getBestDiscount(worker, count);
  const nextUnlock = worker.bulkDiscounts
    ?.filter(d => d.count > count)
    .sort((a, b) => a.count - b.count)[0];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-semibold mb-1">How many items?</p>
        <p className="text-xs text-muted-foreground">
          {worker.estimatedDuration
            ? `~${formatDuration(worker.estimatedDuration)} per item`
            : 'Select quantity'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setBooking(b => ({ ...b, itemCount: Math.max(1, b.itemCount - 1) }))}
          disabled={count <= 1}
          className="w-11 h-11 rounded-xl border border-border bg-muted/40 flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors"
        >
          <Minus className="w-4 h-4" />
        </motion.button>
        <div className="text-center min-w-15">
          <span className="text-4xl font-black tabular-nums">{count}</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {count === 1 ? 'item' : 'items'}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setBooking(b => ({ ...b, itemCount: b.itemCount + 1 }))}
          className="w-11 h-11 rounded-xl border border-border bg-muted/40 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {worker.estimatedDuration && (
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <p className="text-[11px] text-muted-foreground">Estimated duration</p>
          <p className="text-sm font-bold mt-0.5">
            {formatDuration(worker.estimatedDuration * count)}
          </p>
        </div>
      )}
      {worker.bulkDiscounts && worker.bulkDiscounts.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Bulk Discounts
          </p>
          {worker.bulkDiscounts
            .sort((a, b) => a.count - b.count)
            .map(d => {
              const active = count >= d.count;
              return (
                <div
                  key={d.count}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${
                    active ? 'border-emerald-200 bg-emerald-50' : 'border-border bg-muted/20'
                  }`}
                >
                  <span
                    className={`text-xs font-medium flex items-center gap-1.5 ${active ? 'text-emerald-700' : 'text-muted-foreground'}`}
                  >
                    <Percent className="w-3 h-3" />
                    {d.percent}% off for {d.count}+ items
                  </span>
                  {active ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full"
                    >
                      Applied ✓
                    </motion.span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {d.count - count} more
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {best && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <p className="text-xs text-emerald-700 font-semibold">
            🎉 Saving {best.percent}% with bulk pricing!
          </p>
        </div>
      )}
      {!best && nextUnlock && (
        <p className="text-center text-xs text-muted-foreground">
          Add {nextUnlock.count - count} more to unlock {nextUnlock.percent}% off
        </p>
      )}
    </div>
  );
}
