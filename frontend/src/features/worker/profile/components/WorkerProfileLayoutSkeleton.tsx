import { Skeleton } from '@/components/ui/skeleton';

export default function WorkerProfileLayoutSkeleton() {
  return (
    <div className="pb-12 bg-background">
      <div className="relative w-full h-65 md:h-80 overflow-hidden rounded-t-2xl">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="px-6 -mt-16 relative z-10">
        <div className="flex items-end gap-4">
          <Skeleton className="w-28 h-28 rounded-full border-4 border-background" />
          <div className="space-y-2 pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-7">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>

        <div className="bg-card rounded-2xl shadow-sm mb-6 flex px-6 border-b border-border">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-10 w-24 mr-4 my-2" />
          ))}
        </div>

        <div className="space-y-5 pt-2 mt-4">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 pt-7 pb-5">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>

            <div className="px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-3/4" />

                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />

                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-24 w-full rounded-xl" />

                <Skeleton className="h-20 w-full rounded-xl" />
              </div>

              <div className="space-y-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-40 w-full rounded-xl" />

                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm">
            <div className="px-8 pt-7 pb-2 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="h-6 w-44" />
            </div>

            <div className="px-8 pb-8 mt-4 space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
