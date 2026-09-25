import { motion, type Variants } from 'framer-motion';

import SkeletonStatCard from '@/components/molecules/SkeletonStatCard';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const easeInOut = [0.22, 1, 0.36, 1] as const;

const pageVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: easeInOut } },
};

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.975 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: easeInOut },
  },
};

const barVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: (i: number) => ({
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.045,
      ease: easeInOut,
    },
  }),
};

function SkeletonBookingRow() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
    >
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-4 w-16" />
        <Skeleton className="ml-auto h-3 w-20" />
      </div>

      <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
    </motion.div>
  );
}

function SkeletonReviewRow() {
  return (
    <motion.div variants={itemVariants} className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-3.5 rounded-sm" />
        ))}
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </motion.div>
  );
}

export default function WorkerDashboardSkeleton() {
  return (
    <motion.div className="p-4 lg:p-6 py-8" variants={pageVariants} initial="hidden" animate="show">
      <motion.div variants={sectionVariants} className="mb-8 space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-64" />
      </motion.div>
      <motion.div variants={sectionVariants}>
        <motion.div variants={listVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </motion.div>
      </motion.div>
      <motion.div variants={sectionVariants} className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-56" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-75 gap-3">
              <div className="flex flex-col justify-between pb-6 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-8" />
                ))}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="flex-1 rounded-xl" />
                <div className="flex justify-between px-1">
                  {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(m => (
                    <Skeleton key={m} className="h-3 w-6" />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-28" />
          </CardHeader>
          <CardContent>
            <div className="flex h-50 items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'conic-gradient(var(--color-muted) 0deg, transparent 130deg, var(--color-muted) 240deg, transparent 360deg)',
                    opacity: 0.55,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                />
                <Skeleton className="h-40 w-40 rounded-full opacity-30" />
                {/* hollow centre */}
                <div className="absolute h-22 w-22 rounded-full bg-card" />
              </div>
            </div>

            {/* legend */}
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-6" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={sectionVariants} className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-52" />
            </div>
            <Skeleton className="h-4 w-14" />
          </CardHeader>
          <CardContent>
            <motion.div variants={listVariants} className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBookingRow key={i} />
              ))}
            </motion.div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-28" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Skeleton className="h-10 w-12" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-4 rounded-sm" />
                  ))}
                </div>
                <Skeleton className="h-3 w-16" />
              </div>

              <Separator orientation="vertical" className="h-20" />

              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-1.5 flex-1 rounded-full" />
                    <Skeleton className="h-3 w-6" />
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-5" />

            <motion.div variants={listVariants} className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonReviewRow key={i} />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={sectionVariants} className="mt-6">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-3.5 w-64" />
          </CardHeader>
          <CardContent>
            <div className="flex h-65 gap-3">
              <div className="flex flex-col justify-between pb-6 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-6" />
                ))}
              </div>
              <div className="flex flex-1 items-end gap-2 pb-6">
                {Array.from({ length: 12 }).map((_, i) => {
                  const heightPct = 30 + Math.abs(Math.sin(i * 1.3)) * 65;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 origin-bottom"
                      custom={i}
                      variants={barVariants}
                      style={{ height: `${heightPct}%` }}
                    >
                      <Skeleton className="h-full w-full rounded-t-md" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
