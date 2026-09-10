import dayjs from 'dayjs';
import { CheckCircle2, Circle, Clock, PlayCircle, X } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { MediaThumbnailGrid } from '@/components/molecules/MediaThumbnailGrid';
import { BOOKING_DAY_STATUS, ROLE, type Role } from '@/constants';
import OtpModal from '@/features/profile/modals/OtpModal';
import WorkerCompleteModal from '@/features/worker/booking/components/WorkerCompleteModal';
import type { DailyLog } from '@/types/booking';

import {
  useDayCheckIn,
  useDayComplete,
  useDaySkip,
  useVerifyDayOtp,
} from '../../hooks/useBookingDayQuery';

interface ProjectDayTimelineProps {
  bookingId: string;
  dailyLogs: DailyLog[];
  role: Role;
}

const dayStatusStyles: Record<
  DailyLog['status'],
  { icon: React.ReactNode; label: string; className: string }
> = {
  pending: {
    icon: <Circle className="h-4 w-4" />,
    label: 'Pending',
    className: 'text-muted-foreground',
  },
  checked_in: {
    icon: <Clock className="h-4 w-4" />,
    label: 'In progress',
    className: 'text-blue-500',
  },
  completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: 'Completed',
    className: 'text-green-500',
  },
  skipped: { icon: <X className="h-4 w-4" />, label: 'Skipped', className: 'text-red-500' },
};

type DayAction = { type: 'skip'; dayIndex: number } | { type: 'complete'; dayIndex: number } | null;

export function ProjectDayTimeline({ bookingId, dailyLogs, role }: ProjectDayTimelineProps) {
  const [activeAction, setActiveAction] = useState<DayAction>(null);
  const [skipReason, setSkipReason] = useState('');
  const [otpDay, setOtpDay] = useState<number | null>(null);

  const { mutateAsync: checkIn, isPending: isCheckingIn } = useDayCheckIn();
  const { mutateAsync: verifyOtp, isPending: isVerifying } = useVerifyDayOtp();
  const { mutateAsync: completeDay, isPending: isCompleting } = useDayComplete();
  const { mutateAsync: skipDay, isPending: isSkipping } = useDaySkip();

  const isWorker = role === ROLE.WORKER;
  const completedCount = dailyLogs.filter(d => d.status === BOOKING_DAY_STATUS.COMPLETED).length;
  const activeDay = dailyLogs.find(
    d => d.status !== BOOKING_DAY_STATUS.COMPLETED && d.status !== BOOKING_DAY_STATUS.SKIPPED
  );

  return (
    <div className="space-y-6">
      {/* Progress summary */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium">Project progress</span>
          <span className="text-muted-foreground tabular-nums">
            {completedCount} of {dailyLogs.length} days done
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{
              width: `${dailyLogs.length > 0 ? (completedCount / dailyLogs.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Day-by-day list */}
      <div className="space-y-2">
        {dailyLogs.map(day => {
          const style = dayStatusStyles[day.status];
          const isActive = day.dayIndex === activeDay?.dayIndex;

          return (
            <div key={day.dayIndex} className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={style.className}>{style.icon}</span>
                  <div>
                    <p className="text-sm font-medium">Day {day.dayIndex}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayjs(day.date).format('ddd, MMM D')}
                      {day.checkInTime && ` · Check-in: ${dayjs(day.checkInTime).format('h:mm A')}`}
                      {day.checkOutTime &&
                        ` · Check-out: ${dayjs(day.checkOutTime).format('h:mm A')}`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${style.className}`}>{style.label}</span>
              </div>

              {day.skippedReason && (
                <p className="mt-2 text-xs text-red-500 italic">Skipped: {day.skippedReason}</p>
              )}

              {isWorker && isActive && day.status === BOOKING_DAY_STATUS.PENDING && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeAction?.type !== 'skip' && (
                    <Button
                      size="sm"
                      variant="blue"
                      loading={isCheckingIn}
                      iconLeft={<PlayCircle className="h-3.5 w-3.5" />}
                      onClick={() =>
                        checkIn({ bookingId, dayIndex: day.dayIndex }).then(() =>
                          setOtpDay(day.dayIndex)
                        )
                      }
                    >
                      Check in for this day
                    </Button>
                  )}
                  {activeAction?.type !== 'skip' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isCheckingIn}
                      onClick={() => {
                        setActiveAction({ type: 'skip', dayIndex: day.dayIndex });
                        setSkipReason('');
                      }}
                    >
                      Skip this day
                    </Button>
                  )}
                </div>
              )}

              {/* Skip panel */}
              {isActive &&
                day.status === BOOKING_DAY_STATUS.PENDING &&
                activeAction?.type === 'skip' &&
                activeAction.dayIndex === day.dayIndex && (
                  <div>
                    <Label>Reason for skipping this day</Label>
                    <Textarea
                      placeholder="e.g. Bad weather, material delay..."
                      value={skipReason}
                      onChange={e => setSkipReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="red"
                        loading={isSkipping}
                        disabled={!skipReason.trim()}
                        onClick={async () => {
                          await skipDay({
                            bookingId,
                            dayIndex: day.dayIndex,
                            reason: skipReason.trim(),
                          });
                          setActiveAction(null);
                          setSkipReason('');
                        }}
                      >
                        Confirm skip
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isSkipping}
                        onClick={() => {
                          setActiveAction(null);
                          setSkipReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

              {/* Completed evidence */}
              {day.status === 'completed' && (
                <div className="mt-3 space-y-3 border-t pt-3">
                  {day.workerNote && (
                    <div className="text-sm bg-muted/40 p-3 rounded-lg border">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                        Worker Note
                      </p>
                      <p className="text-foreground italic">&quot;{day.workerNote}&quot;</p>
                    </div>
                  )}

                  <MediaThumbnailGrid
                    label="Before Progress"
                    items={(day.evidence?.before ?? []).map(i => ({
                      ...i,
                      caption: `Before — ${i.type}`,
                    }))}
                  />
                  <MediaThumbnailGrid
                    label="After Completion"
                    items={(day.evidence?.after ?? []).map(i => ({
                      ...i,
                      caption: `After — ${i.type}`,
                    }))}
                  />
                </div>
              )}
              {isWorker && isActive && day.status === BOOKING_DAY_STATUS.CHECKED_IN && (
                <Button
                  size="sm"
                  variant="green"
                  className="mt-3"
                  iconLeft={<CheckCircle2 className="h-3.5 w-3.5" />}
                  onClick={() => setActiveAction({ type: 'complete', dayIndex: day.dayIndex })}
                >
                  Mark day complete
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <OtpModal
        open={otpDay !== null}
        onOpenChange={v => {
          if (!v) {
            setOtpDay(null);
          }
        }}
        loading={isVerifying}
        onVerify={async otp => {
          if (otpDay === null) {
            return;
          }
          await verifyOtp({ bookingId, dayIndex: otpDay, otp });
          setOtpDay(null);
        }}
        onResend={async () => {
          if (otpDay === null) {
            return;
          }
          await checkIn({ bookingId, dayIndex: otpDay });
        }}
      />
      {/* Complete day modal */}
      <WorkerCompleteModal
        open={activeAction?.type === 'complete'}
        onClose={() => setActiveAction(null)}
        bookingId={bookingId}
        isSubmitting={isCompleting}
        title={`Complete Day ${activeAction?.dayIndex}`}
        onSubmit={async data => {
          if (activeAction?.type !== 'complete') {
            return;
          }
          await completeDay({ bookingId, dayIndex: activeAction.dayIndex, data });
          setActiveAction(null);
        }}
      />
    </div>
  );
}
