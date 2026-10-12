import { Skeleton } from '@/components/ui/skeleton';

export function WalletOverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
      {/* Hero Card Skeleton */}
      <div className="min-h-48 rounded-[22px] border border-border bg-card p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40 rounded-xl" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <div className="space-y-2 mt-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9.5 w-44 rounded-xl mt-4" />
      </div>

      {/* Side Cards Skeleton */}
      <div className="grid gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-1.5 mt-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-1.5 mt-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
