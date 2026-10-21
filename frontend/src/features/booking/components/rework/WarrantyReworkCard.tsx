import dayjs from 'dayjs';
import { Calendar, CheckCircle2, Clock, ShieldCheck, Wrench } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { MediaThumbnailGrid } from '@/components/molecules/MediaThumbnailGrid';
import { BOOKING_STATUS, ROLE, type Role } from '@/constants';
import type { BookingDetails } from '@/types/booking';

interface Props {
  booking: BookingDetails;
  role: Role;
  onRequestRework?: () => void;
  onScheduleSlot?: () => void;
  onCompleteRework?: () => void;
}

export default function WarrantyReworkCard({
  booking: b,
  role,
  onRequestRework,
  onScheduleSlot,
  onCompleteRework,
}: Props) {
  const isUser = role === ROLE.USER;
  const isWorker = role === ROLE.WORKER;

  const validUntil = b.warranty?.validUntil ? new Date(b.warranty.validUntil) : null;
  const now = new Date();
  const isWarrantyExpired = validUntil ? now > validUntil : true;
  const daysRemaining = validUntil
    ? Math.max(0, Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const rework = b.rework;
  const canRequestRework =
    isUser &&
    (b.status === BOOKING_STATUS.COMPLETED || b.status === BOOKING_STATUS.APPROVED) &&
    !isWarrantyExpired &&
    !rework;

  if (b.category?.serviceType === 'Consultation' || (!b.warranty && !rework)) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">10-Day Complimentary Warranty</h3>
            <p className="text-xs text-muted-foreground">
              {validUntil ? (
                isWarrantyExpired ? (
                  <span className="text-destructive font-medium">
                    Warranty period expired on {dayjs(validUntil).format('DD MMM YYYY')}
                  </span>
                ) : (
                  <span>
                    Valid until{' '}
                    <strong className="text-foreground">
                      {dayjs(validUntil).format('DD MMM YYYY')}
                    </strong>{' '}
                    ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left)
                  </span>
                )
              ) : (
                '10-day rework warranty covered'
              )}
            </p>
          </div>
        </div>

        {/* Status Pills */}
        {rework?.status === 'requested' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Rework Requested
          </span>
        )}
        {rework?.status === 'scheduled' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Rework Scheduled
          </span>
        )}
        {rework?.status === 'completed' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={13} className="text-emerald-500" />
            Rework Completed
          </span>
        )}
      </div>

      {/* Rework Details if present */}
      {rework && (
        <div className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground">Customer's Stated Issue:</span>
            <p className="text-foreground leading-relaxed font-medium">{rework.reason}</p>
          </div>

          {rework.preferredDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar size={13} />
              <span>
                Customer Preferred Date:{' '}
                <strong>{dayjs(rework.preferredDate).format('DD MMM YYYY')}</strong>
              </span>
            </div>
          )}

          {rework.scheduledSlot && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 space-y-1">
              <span className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Clock size={13} /> Confirmed Rework Appointment:
              </span>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                {dayjs(rework.scheduledSlot.date).format('dddd, DD MMM YYYY')} from{' '}
                <strong>{rework.scheduledSlot.startTime}</strong> to{' '}
                <strong>{rework.scheduledSlot.endTime}</strong>
              </p>
            </div>
          )}

          {rework.evidence && rework.evidence.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <MediaThumbnailGrid label="Customer Reported Issue Proof" items={rework.evidence} />
            </div>
          )}

          {rework.completionEvidence && rework.completionEvidence.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-border/60">
              <MediaThumbnailGrid
                label="Worker Completed Work Proof"
                items={rework.completionEvidence}
              />
            </div>
          )}

          {rework.workerNote && (
            <div className="space-y-1 pt-1 border-t border-border">
              <span className="font-semibold text-muted-foreground">Worker Resolution Notes:</span>
              <p className="text-foreground leading-relaxed">{rework.workerNote}</p>
            </div>
          )}
        </div>
      )}

      {/* Action CTA */}
      <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
        {canRequestRework && (
          <Button
            variant="warning"
            size="sm"
            iconLeft={<Wrench size={13} />}
            onClick={onRequestRework}
          >
            Claim Rework Warranty
          </Button>
        )}

        {isUser && rework?.status === 'completed' && (
          <p className="text-xs text-muted-foreground italic">
            Warranty rework for this booking has been fulfilled and verified.
          </p>
        )}

        {isWorker && rework?.status === 'requested' && (
          <Button
            variant="blue"
            size="sm"
            iconLeft={<Calendar size={13} />}
            onClick={onScheduleSlot}
          >
            Schedule Rework Slot
          </Button>
        )}

        {isWorker && rework?.status === 'scheduled' && (
          <Button
            variant="green"
            size="sm"
            iconLeft={<CheckCircle2 size={13} />}
            onClick={onCompleteRework}
          >
            Complete Rework
          </Button>
        )}
      </div>
    </div>
  );
}
