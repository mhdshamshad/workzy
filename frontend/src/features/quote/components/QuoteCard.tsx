import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronDown, Clock, PenIcon, User, Wrench } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/atoms/Button';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { ROLE, type Role } from '@/constants';
import { QUOTE_STATUS } from '@/constants/quote';
import type { BookingSlot } from '@/types/booking';
import type { QuoteListItem } from '@/types/quote';
import { formatCurrency } from '@/utils/currency';
import { formatSmartDateTime } from '@/utils/time.format';

const statusVariantMap: Record<string, 'green' | 'blue' | 'red'> = {
  [QUOTE_STATUS.ACCEPTED]: 'green',
  [QUOTE_STATUS.PENDING]: 'blue',
  [QUOTE_STATUS.REJECTED]: 'red',
  [QUOTE_STATUS.EXPIRED]: 'red',
};

export function QuoteCard({
  quote,
  delay,
  onAccept,
  onReject,
  onUpdate,
  role,
}: {
  quote: QuoteListItem;
  onAccept?: (quote: QuoteListItem) => void;
  onReject?: (quote: QuoteListItem) => void;
  onUpdate?: (quote: QuoteListItem) => void;
  delay: number;
  role: Role;
}) {
  const { user, worker, category, createdAt, dates, status, totalPrice, message } = quote;

  const isAdmin = role === ROLE.ADMIN;
  const isUser = role === ROLE.USER;
  const isWorker = role === ROLE.WORKER;

  const singlePerson = isWorker ? user : worker;
  const singlePersonLabel = isWorker ? 'Client' : 'Worker';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: 'easeOut' }}
      className="group relative rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-md overflow-hidden"
    >
      <div
        className={[
          'absolute left-0 inset-y-0 w-0.75 rounded-l-2xl',
          status === QUOTE_STATUS.ACCEPTED
            ? 'bg-emerald-500'
            : status === QUOTE_STATUS.PENDING
              ? 'bg-blue-500'
              : 'bg-red-500',
        ].join(' ')}
      />

      <div className="pl-5 pr-4 py-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 min-w-0">
            {isAdmin ? (
              <>
                <PersonChip person={user} label="Client" icon={<User className="h-2.5 w-2.5" />} />
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                <PersonChip
                  person={worker}
                  label="Worker"
                  icon={<Wrench className="h-2.5 w-2.5" />}
                />
              </>
            ) : (
              <PersonChip
                person={singlePerson}
                label={singlePersonLabel}
                icon={
                  isWorker ? <User className="h-2.5 w-2.5" /> : <Wrench className="h-2.5 w-2.5" />
                }
              />
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant={statusVariantMap[status] ?? 'blue'}>{status}</Badge>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Quote</p>
              <p className="text-lg font-bold leading-tight tabular-nums">
                {formatCurrency(totalPrice)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
            {category.iconUrl && (
              <img
                src={category.iconUrl}
                alt=""
                className="h-3.5 w-3.5 rounded-sm object-cover shrink-0"
              />
            )}
            {category.name}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Sent {formatSmartDateTime(createdAt)}
          </span>
        </div>
        <SlotsPanel dates={dates} />
        {message && (
          <p className="line-clamp-1 text-xs text-muted-foreground border-t border-border/60 pt-2.5 italic">
            "{message}"
          </p>
        )}

        {isUser && status === QUOTE_STATUS.PENDING && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/60 ">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onReject?.(quote)}
            >
              Decline
            </Button>
            <Button variant="green" size="sm" className="flex-1" onClick={() => onAccept?.(quote)}>
              Accept
            </Button>
          </div>
        )}

        {isWorker && status === QUOTE_STATUS.PENDING && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              iconRight={<PenIcon size={12} />}
              onClick={() => onUpdate?.(quote)}
            >
              Edit Quote
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PersonChip({
  person,
  label,
  icon,
}: {
  person: { name: string; profileImage?: string };
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <ProfileImage src={person.profileImage} name={person.name} size={40} />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium flex items-center gap-1">
          {icon}
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate leading-tight">
          {person.name}
        </p>
      </div>
    </div>
  );
}

function SlotRow({ slot }: { slot: BookingSlot }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-foreground">
        <CalendarDays className="h-3 w-3 text-primary/70 shrink-0" />
        {dayjs(slot.date).format('ddd, MMM D')}
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
        <Clock className="h-3 w-3 shrink-0" />
        {slot.startTime} – {slot.endTime}
      </span>
    </div>
  );
}

function SlotsPanel({ dates }: { dates: BookingSlot[] }) {
  const [open, setOpen] = useState(false);
  const PREVIEW = 2;
  const hasMore = dates.length > PREVIEW;
  const visible = open ? dates : dates.slice(0, PREVIEW);

  return (
    <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
      {visible.map((slot, i) => (
        <SlotRow key={i} slot={slot} />
      ))}
      {hasMore && (
        <button
          onClick={() => setOpen(v => !v)}
          className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
        >
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
          {open
            ? 'Show less'
            : `+${dates.length - PREVIEW} more day${dates.length - PREVIEW > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
