export default function WorkerCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex gap-4 animate-pulse">
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg bg-muted shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-44 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 w-16 bg-muted rounded" />
            <div className="h-8 w-24 bg-muted rounded-lg" />
          </div>
        </div>
        <div className="h-3 w-56 bg-muted rounded" />
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-4/5 bg-muted rounded" />
        <div className="flex gap-1.5 mt-1">
          {[80, 100, 90].map((w, i) => (
            <div key={i} className="h-6 bg-muted rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>
    </div>
  );
}
