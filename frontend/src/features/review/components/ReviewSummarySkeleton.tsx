import { motion } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';
export function ReviewSummarySkeleton() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-6"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2 sm:min-w-35">
            <Skeleton className="h-12 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(s => (
              <Skeleton key={s} className="h-4 w-full rounded-full" />
            ))}
          </div>
        </div>
      </motion.div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-37.5" />
        <Skeleton className="h-9 w-35" />
      </div>
    </div>
  );
}
