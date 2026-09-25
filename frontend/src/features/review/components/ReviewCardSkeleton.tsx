import { motion } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ReviewCardSkeletonProps {
  count?: number;
  showBothParties?: boolean;
  mediaCount?: number;
  withReply?: boolean;
  className?: string;
}

export function ReviewCardSkeleton({
  count = 4,
  showBothParties = false,
  mediaCount = 2,
  withReply = false,
  className,
}: ReviewCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('rounded-xl border bg-card p-3.5 sm:p-4', className)}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
                {showBothParties && (
                  <>
                    <span className="hidden h-6 w-px bg-border sm:block" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </>
                )}
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
            </div>

            <div className="mt-2.5 space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/4" />
            </div>

            {mediaCount > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {Array.from({ length: mediaCount }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-lg sm:h-18 sm:w-18" />
                ))}
              </div>
            )}

            {withReply && (
              <div className="mt-2.5 space-y-1.5 border-l-2 border-border pl-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            )}
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}
