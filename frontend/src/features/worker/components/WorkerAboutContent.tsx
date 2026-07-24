import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Globe2,
  Languages,
  Moon,
  Sun,
} from 'lucide-react';

import { cn } from '@/lib/utils';

import type { Transition } from 'framer-motion';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
type Day = (typeof DAYS)[number];

const DAY_LABELS: Record<Day, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: 'easeInOut' } as Transition,
});

export type AboutContentProps = {
  about?: string | null;
  languages: string[];
  availability?: Partial<Record<Day, { startTime: string; endTime: string }[]>> | null;
};

export function WorkerAboutContent({ about, languages, availability }: AboutContentProps) {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px]">
      <div className="space-y-5 min-w-0">
        <motion.div {...fade(0)} className="rounded-2xl border bg-card p-6">
          <SectionTitle icon={<BookOpen className="h-4 w-4" />} title="About" />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground break-words">
            {about ?? 'No description provided yet.'}
          </p>
        </motion.div>
        <motion.div {...fade(0.05)} className="rounded-2xl border bg-card p-6">
          <SectionTitle icon={<Languages className="h-4 w-4" />} title="Languages" />
          <div className="mt-3 flex flex-wrap gap-2">
            {languages.length > 0 ? (
              languages.map(lang => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium"
                >
                  <Globe2 className="h-3 w-3 text-primary" />
                  {lang}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Not specified</p>
            )}
          </div>
        </motion.div>
        <motion.div
          {...fade(0.1)}
          className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              Some dates may be unavailable due to planned leaves. Check the calendar when booking
              to see real-time availability.
            </p>
          </div>
        </motion.div>
      </div>
      <motion.div {...fade(0.08)} className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border bg-card p-6">
          <SectionTitle
            icon={<Calendar className="h-4 w-4 text-primary" />}
            title="Weekly availability"
          />
          <div className="mt-4 space-y-2">
            {DAYS.map(day => {
              const windows: { startTime: string; endTime: string }[] = availability?.[day] ?? [];
              const isOff = windows.length === 0;

              return (
                <div
                  key={day}
                  className={cn(
                    'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors',
                    isOff
                      ? 'bg-muted/40 text-muted-foreground'
                      : 'bg-primary/5 border border-primary/10'
                  )}
                >
                  <span className="w-8 font-semibold capitalize text-xs tracking-wide">
                    {DAY_LABELS[day]}
                  </span>

                  {isOff ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Moon className="h-3 w-3" /> Off
                    </span>
                  ) : (
                    <div className="flex flex-col items-end gap-0.5">
                      {windows.map((w, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 text-xs font-medium text-primary"
                        >
                          <Clock className="h-3 w-3" />
                          {w.startTime} – {w.endTime}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 border-t pt-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sun className="h-3 w-3 text-primary" /> Working
            </span>
            <span className="flex items-center gap-1.5">
              <Moon className="h-3 w-3" /> Off
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
