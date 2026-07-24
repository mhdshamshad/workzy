import { motion, type Variants } from 'framer-motion';

import { Skeleton } from '@/components/ui/skeleton';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ServiceCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="h-48 w-full rounded-none" />

      <div className="flex items-end gap-3 px-4">
        <Skeleton className="-mt-[22px] h-11 w-11 shrink-0 rounded-[13px]" />
        <div className="min-w-0 flex-1 space-y-1.5 pb-1 pt-3">
          <Skeleton className="h-3.5 w-3/4 rounded-md" />
          <Skeleton className="h-2.5 w-1/3 rounded-md" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-2.5">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-4/5 rounded-md" />
        </div>

        <div className="grid grid-cols-3 divide-x divide-border/60 overflow-hidden rounded-xl border border-border/60">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 py-2.5">
              <Skeleton className="h-3.5 w-3.5 rounded-sm" />
              <Skeleton className="h-3 w-7 rounded-md" />
              <Skeleton className="h-1.5 w-5 rounded-md" />
            </div>
          ))}
        </div>

        <Skeleton className="h-9 w-full rounded-xl" />

        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-5 w-[72px] rounded-full" />
          <Skeleton className="h-5 w-[72px] rounded-full" />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-2.5 w-14 rounded-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-[58px] rounded-lg" />
            <Skeleton className="h-8 w-[70px] rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: EASE,
    },
  },
};

export default function WorkerServiceGridSkeleton({ count = 7 }: { count?: number }) {
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} variants={itemVariants}>
          <ServiceCardSkeleton />
        </motion.div>
      ))}
    </motion.div>
  );
}
