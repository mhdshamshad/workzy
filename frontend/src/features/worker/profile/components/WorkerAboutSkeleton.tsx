import { Skeleton } from '@/components/ui/skeleton';

export default function WorkerAboutSkeleton() {
  return (
    <div className="space-y-5 pt-2 mt-4">
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-8 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded" />
                <Skeleton className="h-4 w-20" />
                <div className="flex-1">
                  <Skeleton className="h-px w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-8 w-3/4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-6 w-2/3" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-16" />
                <div className="p-4 rounded-xl border border-border/60">
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-5/6 mb-2" />
                  <Skeleton className="h-3 w-4/6" />
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="space-y-1 w-full">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-lg ml-3" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3.5 h-3.5 rounded" />
                <Skeleton className="h-4 w-24" />
                <div className="flex-1">
                  <Skeleton className="h-px w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-40 w-full rounded-xl" />
              </div>
              <div className="space-y-2.5">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="px-8 pt-7 pb-2 flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-6 w-52" />
        </div>
        <div className="px-8 pb-8 mt-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
