import { motion } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';

export function ServiceCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm w-full h-full">
      <div className="relative w-full h-32 sm:h-40 md:h-44 overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4 md:p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <ServiceCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}
