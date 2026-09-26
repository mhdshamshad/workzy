import { Skeleton } from '@/components/ui/skeleton';

export default function ChatListItemSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3 border-b border-border/40">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2.5 w-10" />
        </div>
        <Skeleton className="h-2.5 w-3/4" />
      </div>
    </div>
  );
}
