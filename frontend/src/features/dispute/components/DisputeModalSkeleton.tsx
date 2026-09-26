import { Skeleton } from '@/components/ui/skeleton';

export function DisputeModalSkeleton() {
  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/40 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1].map(i => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
          >
            <Skeleton className="w-12.5 h-12.5 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex flex-col gap-1.5 px-4 py-3.5 border-b border-border">
          <Skeleton className="h-2.5 w-10" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <div className="px-4 py-3.5 flex flex-col gap-2">
          <Skeleton className="h-2.5 w-20 mb-1" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[92%]" />
          <Skeleton className="h-3 w-[75%]" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-2.5 w-24" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-16" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-3 h-3 rounded" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
          </div>
          <div className="border-l-2 border-border pl-3.5 flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-36" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-[80%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
