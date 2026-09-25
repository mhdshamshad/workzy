import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { useMemo } from 'react';

import ErrorState from '@/components/molecules/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  isLoading: boolean;
  error: Error | null;
  refetch?: () => void;
  dates: Record<string, boolean>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void | Promise<void>;
}

export default function DateSelector({
  isLoading,
  error,
  refetch,
  dates,
  selectedDate,
  onDateSelect,
}: Props) {
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => dayjs().add(i, 'day')), []);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold flex items-center gap-2">
        <CalendarDays className="w-4 h-4" /> Select Date
      </p>

      {isLoading ? (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border border-border min-w-13 gap-1"
            >
              <Skeleton className="h-2 w-6 rounded" />
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-2 w-8 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {days.map(day => {
            const dateStr = day.format('YYYY-MM-DD');
            const available = dates[dateStr] ?? false;
            const selected = selectedDate === dateStr;

            return (
              <motion.button
                key={dateStr}
                whileTap={available ? { scale: 0.93 } : {}}
                onClick={() => available && onDateSelect(dateStr)}
                disabled={!available}
                className={`shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border text-center min-w-13 transition-all ${
                  !available
                    ? 'border-border bg-muted/20 opacity-40 cursor-not-allowed'
                    : selected
                      ? 'border-foreground bg-foreground text-background shadow-sm'
                      : 'border-border bg-card hover:border-foreground/50'
                }`}
              >
                <span className="text-[10px] font-medium uppercase">{day.format('ddd')}</span>
                <span className="text-base font-bold leading-tight">{day.format('D')}</span>
                <span className="text-[10px]">{day.format('MMM')}</span>
                {!available && (
                  <span className="text-[8px] text-muted-foreground/50 mt-0.5 leading-none">
                    Off
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
