import { motion } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';

interface QuoteCardSkeletonProps {
  delay?: number;
  withActions?: boolean;
  slotCount?: number;
  count?: number;
}

export function QuoteCardSkeleton({ count = 3, ...rest }: QuoteCardSkeletonProps) {
  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <QuoteCardSkeletonItem key={i} delay={i * 0.07} {...rest} />
        ))}
      </div>
    );
  }

  return <QuoteCardSkeletonItem delay={0} {...rest} />;
}

function QuoteCardSkeletonItem({
  delay = 0,
  withActions = false,
  slotCount = 3,
}: Omit<QuoteCardSkeletonProps, 'count'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: 'easeOut' }}
      className="relative rounded-2xl border border-border bg-card overflow-hidden"
    >
      <Skeleton className="absolute left-0 inset-y-0 w-0.75 rounded-l-2xl" />

      <div className="pl-5 pr-4 py-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 min-w-0">
            <PersonChipSkeleton />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Skeleton className="h-5 w-16 rounded-full" />
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-2.5 w-10 rounded" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-3.5 w-28 rounded" />
        </div>
        <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
          {Array.from({ length: slotCount }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 py-1.5 border-b border-border/40 last:border-0"
            >
              <Skeleton className="h-3 w-28 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 pt-2.5">
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>

        {withActions && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/60">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 flex-1 rounded-md" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PersonChipSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-2.5 w-12 rounded" />
        <Skeleton className="h-4 w-28 rounded" />
      </div>
    </div>
  );
}
