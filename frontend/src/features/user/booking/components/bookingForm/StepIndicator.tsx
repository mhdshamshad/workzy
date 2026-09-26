import { CheckCircle2 } from 'lucide-react';

type StepIndicatorProps<T extends string> = {
  steps: T[];
  current: T;
  labels: Record<T, string>;
};

export default function StepIndicator<T extends string>({
  steps,
  current,
  labels,
}: StepIndicatorProps<T>) {
  const idx = steps.indexOf(current);

  return (
    <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-0.5 scrollbar-hide">
      {steps.map((s, i) => (
        <div key={`${s}-${i}`} className="flex items-center gap-1.5 shrink-0">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
              i < idx
                ? 'bg-emerald-500 text-white'
                : i === idx
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground/60'
            }`}
          >
            {i < idx ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
          </div>

          <span
            className={`text-[11px] font-medium ${
              i === idx ? 'text-foreground' : 'text-muted-foreground/60'
            }`}
          >
            {labels[s]}
          </span>

          {i < steps.length - 1 && (
            <div className={`h-px w-4 ${i < idx ? 'bg-emerald-400' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
