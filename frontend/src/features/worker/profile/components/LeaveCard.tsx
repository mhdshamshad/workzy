import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { CalendarOff, Trash2 } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Leave } from '@/types/leave';
import { formatDateRangeDuration, formatDate } from '@/utils/time.format';

function getLeaveStatus(leave: Leave): 'active' | 'upcoming' | 'past' {
  const now = dayjs();
  if (now.isAfter(dayjs(leave.endDate))) {
    return 'past';
  }
  if (now.isBefore(dayjs(leave.startDate))) {
    return 'upcoming';
  }
  return 'active';
}

export function LeaveCard({ leave, onCancel }: { leave: Leave; onCancel: (id: string) => void }) {
  const status = getLeaveStatus(leave);
  const isSameDay = leave.startDate === leave.endDate;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between bg-card border border-border/60 rounded-xl px-4 py-4 hover:border-border transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
            status === 'upcoming'
              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
              : status === 'active'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-muted'
          )}
        >
          <CalendarOff
            className={cn(
              'w-4 h-4',
              status === 'upcoming'
                ? 'text-blue-500'
                : status === 'active'
                  ? 'text-green-500'
                  : 'text-muted-foreground'
            )}
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {formatDate(leave.startDate)}
            {!isSameDay && (
              <span className="text-muted-foreground font-normal">
                {' → '}
                {formatDate(leave.endDate)}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {formatDateRangeDuration(leave.startDate, leave.endDate)}
            </span>
            {leave.reason && (
              <>
                <span className="text-border">·</span>
                <span className="text-xs text-muted-foreground truncate max-w-35">
                  {leave.reason}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 shrink-0 ml-2 ">
        <Badge variant={status === 'active' ? 'green' : status === 'past' ? 'slate' : 'blue'}>
          {status === 'active' ? 'active' : status === 'past' ? 'past' : 'upcoming'}
        </Badge>
        {status !== 'past' && (
          <Button onClick={() => onCancel(leave.id)} variant="red" size="sm">
            <Trash2 className="w-3.5 h-3.5 " />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
