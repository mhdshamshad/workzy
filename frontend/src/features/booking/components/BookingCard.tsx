import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  CheckCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  MapPin,
  Navigation,
  PlayCircle,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { BOOKING_STATUS, BOOKING_TYPE, ROLE, SERVICE_TYPE } from '@/constants';
import type { BookingStatus, Role } from '@/constants';
import { cn } from '@/lib/utils';
import type { BookingDetails, BookingListItem } from '@/types/booking';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatTime12 } from '@/utils/time.format';

import { BOOKING_STATUS_META, PAYMENT_STATUS_META } from '../helper/bookingStatus.config';

export interface BookingCardHandlers {
  onAccept?: (id: string) => void;
  onStart?: (booking: BookingListItem | BookingDetails) => void;
  onCancel?: (booking: BookingListItem | BookingDetails) => void;
  onReview?: (data: { id: string; reviewId?: string }) => void;
  onReject?: (id: string) => void;
  onReached?: (id: string) => void;
  onEnRoute?: (id: string) => void;
  onComplete?: (id: string) => void;
  onReqExtra?: (id: string) => void;
  onPayExtra?: (id: string) => void;
  onApprove?: (id: string) => void;
  onDispute?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const c = BOOKING_STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full',
        'text-[11px] font-medium border whitespace-nowrap',
        c.badge
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', c.dot)} />
      {c.label}
    </span>
  );
}

const QUOTE_BASED_TYPES = [SERVICE_TYPE.CONSULTATION, SERVICE_TYPE.INSPECTION] as const;

function isQuoteBased(serviceType?: string): boolean {
  return QUOTE_BASED_TYPES.includes(serviceType as (typeof QUOTE_BASED_TYPES)[number]);
}

const QUOTE_SENDABLE_STATUSES = [BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETED] as const;

function canSendQuote(booking: BookingListItem): boolean {
  return (
    isQuoteBased(booking.category.serviceType) &&
    QUOTE_SENDABLE_STATUSES.includes(booking.status as (typeof QUOTE_SENDABLE_STATUSES)[number])
  );
}

interface Props {
  booking: BookingListItem;
  handlers?: BookingCardHandlers;
  role: Role;
  detailPath?: string;
  workerId?: string;
  userId?: string;
}

export default function BookingCard({
  booking: b,
  handlers,
  role,
  detailPath,
  workerId,
  userId,
}: Props) {
  const cfg = BOOKING_STATUS_META[b.status];
  const pc = PAYMENT_STATUS_META[b.paymentStatus] ?? PAYMENT_STATUS_META.pending;

  const isPendingStage =
    b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.CONFIRMED;
  const isConfirmedStage =
    b.status === BOOKING_STATUS.EN_ROUTE ||
    b.status === BOOKING_STATUS.REACHED ||
    b.status === BOOKING_STATUS.IN_PROGRESS;

  const isPendingReschedule = b.isRescheduleRequested && (isPendingStage || isConfirmedStage);

  const isAdmin = role === ROLE.ADMIN;
  const isWorker = role === ROLE.WORKER;
  const isUser = role === ROLE.USER;

  const extraPending = b.extraCharge?.status === 'pending';
  const extraApproved = b.extraCharge?.status === 'approved';
  const isExtraCharge = !!b.extraCharge;

  const isCompletedOrApproved =
    b.status === BOOKING_STATUS.COMPLETED || b.status === BOOKING_STATUS.APPROVED;

  const isReviewExpired = b.completedAt
    ? dayjs().isAfter(dayjs(b.completedAt).add(48, 'hour'))
    : false;

  const hasVisibleReview = !!b.reviewId && b.hasVisibleReview;
  const canAddReview = !hasVisibleReview && !isReviewExpired;

  const showBothProfiles = isAdmin && !workerId && !userId;
  const showCustomer = isWorker || !!workerId;
  const otherAvatar = showCustomer ? b.user?.profileImage : b.worker?.profileImage;
  const otherName = showCustomer ? b.user?.name : b.worker?.name;
  const to = detailPath ?? `/bookings/${b.id}`;

  const quotePath = b.quoteId ? `/worker/quotes` : `/worker/quotes/${b.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={cn(
        'bg-card rounded-2xl border border-border border-l-[3px] overflow-hidden',
        'shadow-sm hover:shadow-md transition-all duration-200',
        cfg.accent
      )}
    >
      {extraPending && b.extraCharge?.amount && (
        <div className="bg-amber-500/15 px-4 py-2.5 flex items-center gap-2">
          <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium flex-1">
            {isWorker ? (
              <>
                Extra charge of <strong>{formatCurrency(b.extraCharge.amount)}</strong> awaiting
                approval
              </>
            ) : (
              <>
                Worker requested extra charge of{' '}
                <strong>{formatCurrency(b.extraCharge.amount)}</strong>
              </>
            )}
          </p>
          <Link
            to={to}
            className="text-xs text-amber-700 dark:text-amber-300 font-semibold underline underline-offset-2 whitespace-nowrap"
          >
            Review →
          </Link>
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {showBothProfiles ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ProfileImage src={b.user?.profileImage} size={32} name={b.user?.name} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-0.5">
                      Customer
                    </p>
                    <p className="text-sm font-semibold truncate">{b.user?.name}</p>
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="hidden sm:block text-muted-foreground/40 flex-shrink-0"
                />
                <div className="flex items-center gap-2.5 min-w-0">
                  <ProfileImage src={b.worker?.profileImage} size={32} name={b.worker?.name} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold leading-none mb-0.5">
                      Worker
                    </p>
                    <p className="text-sm font-semibold truncate">{b.worker?.name}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <ProfileImage src={otherAvatar} size={44} name={otherName} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-foreground truncate">{otherName}</p>
                    <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded hidden sm:inline">
                      #{b.bookingId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {b.category.iconUrl && (
                      <img
                        src={b.category.iconUrl}
                        alt=""
                        className="w-3.5 h-3.5 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {b.category.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {isPendingReschedule ? (
            <Badge variant="amber">Reschedule Requested</Badge>
          ) : (
            <StatusBadge status={b.status} />
          )}
        </div>

        {showBothProfiles && (
          <div className="mt-3 pt-3 border-t border-dashed border-border flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-lg">
              {b.category.iconUrl && (
                <img src={b.category.iconUrl} alt="" className="w-3.5 h-3.5 object-cover rounded" />
              )}
              <span className="text-xs font-semibold text-foreground">{b.category.name}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{b.bookingId}</span>
          </div>
        )}

        <div
          className={cn(
            'mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground',
            !showBothProfiles && 'sm:ml-[56px]'
          )}
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={11} className="flex-shrink-0" />
            {formatDate(b.date, 'calendar')}
            {b.totalDays > 1 && (
              <span className="text-muted-foreground/60">
                +{b.totalDays - 1} day{b.totalDays > 2 ? 's' : ''}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="flex-shrink-0" />
            {formatTime12(b.startTime)} – {formatTime12(b.endTime)}
          </span>
          <span className="flex items-center gap-1.5 min-w-0">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{b.addressLabel}</span>
          </span>
        </div>

        {extraApproved && b.extraCharge?.amount && (
          <div className="mt-3 text-xs font-medium bg-section-green rounded-xl px-3 py-2 flex items-center gap-2">
            <CheckCheck size={12} className="text-[var(--section-green-text)] flex-shrink-0" />
            Extra charge of <strong>{formatCurrency(b.extraCharge.amount)}</strong> approved and
            added to total
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className={cn('text-[10px] font-bold uppercase tracking-wide', pc.badge)}>
              {pc.label}
            </p>
            <p className="text-lg font-bold text-foreground leading-tight">
              {formatCurrency(b.total)}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-end">
            <Link to={to}>
              <Button variant="secondary" iconLeft={<Eye size={12} />} size="sm">
                Details
              </Button>
            </Link>

            {isUser && (
              <>
                {(b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.CONFIRMED) && (
                  <Button
                    variant="red"
                    size="sm"
                    iconLeft={<XCircle size={12} />}
                    onClick={() => handlers?.onCancel?.(b)}
                  >
                    Cancel
                  </Button>
                )}

                {b.status === BOOKING_STATUS.COMPLETED && (
                  <Button
                    variant="green"
                    size="sm"
                    iconLeft={<CheckCircle size={12} />}
                    onClick={() => handlers?.onApprove?.(b.id)}
                  >
                    Approve
                  </Button>
                )}

                {isCompletedOrApproved && (hasVisibleReview || canAddReview) && (
                  <Button
                    variant="blue"
                    size="sm"
                    iconLeft={<CheckCircle size={12} />}
                    onClick={() => handlers?.onReview?.({ id: b.id, reviewId: b.reviewId })}
                  >
                    {hasVisibleReview ? 'Show Review' : 'Add Review'}
                  </Button>
                )}

                {b.status === BOOKING_STATUS.COMPLETED && extraPending && b.extraCharge?.amount && (
                  <Button
                    variant="warning"
                    size="sm"
                    iconLeft={<CheckCircle size={12} />}
                    onClick={() => handlers?.onPayExtra?.(b.id)}
                  >
                    Pay Extra
                  </Button>
                )}
              </>
            )}

            {isWorker && (
              <>
                {b.status === BOOKING_STATUS.PENDING && !b.isRescheduleRequested && (
                  <>
                    <Button
                      variant="green"
                      size="sm"
                      iconLeft={<CheckCircle size={12} />}
                      onClick={() => handlers?.onAccept?.(b.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="red"
                      size="sm"
                      iconLeft={<XCircle size={12} />}
                      onClick={() => handlers?.onReject?.(b.id)}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {b.bookingType === BOOKING_TYPE.INSTANT && (
                  <>
                    {b.status === BOOKING_STATUS.CONFIRMED && !b.isRescheduleRequested && (
                      <Button
                        variant="blue"
                        size="sm"
                        iconLeft={<Navigation size={12} />}
                        onClick={() => handlers?.onEnRoute?.(b.id)}
                      >
                        On My Way
                      </Button>
                    )}

                    {b.status === BOOKING_STATUS.EN_ROUTE && !b.isRescheduleRequested && (
                      <Button
                        variant="blue"
                        size="sm"
                        iconLeft={<CheckCircle size={12} />}
                        onClick={() => handlers?.onReached?.(b.id)}
                      >
                        I've Arrived
                      </Button>
                    )}

                    {b.status === BOOKING_STATUS.REACHED && (
                      <Button
                        variant="blue"
                        size="sm"
                        iconLeft={<PlayCircle size={12} />}
                        onClick={() => handlers?.onStart?.(b)}
                      >
                        Enter OTP & Start Job
                      </Button>
                    )}
                  </>
                )}

                {!isQuoteBased(b.category.serviceType) &&
                  (b.status === BOOKING_STATUS.IN_PROGRESS || isExtraCharge) && (
                    <Button
                      variant="warning"
                      size="sm"
                      iconLeft={<AlertTriangle size={12} />}
                      onClick={() => handlers?.onReqExtra?.(b.id)}
                    >
                      {isExtraCharge ? 'Preview Extra Charge' : 'Request Extra Charge'}
                    </Button>
                  )}

                {canSendQuote(b) && (
                  <Link to={quotePath}>
                    <Button variant="blue" size="sm" iconLeft={<FileText size={12} />}>
                      {b.quoteId
                        ? 'Show Quote'
                        : b.category.serviceType === SERVICE_TYPE.INSPECTION
                          ? 'Schedule Revisit'
                          : 'Send Quote'}
                    </Button>
                  </Link>
                )}

                {b.status === BOOKING_STATUS.IN_PROGRESS && (
                  <Button
                    variant="blue"
                    size="sm"
                    iconLeft={<PlayCircle size={12} />}
                    onClick={() => handlers?.onComplete?.(b.id)}
                  >
                    Finish Job
                  </Button>
                )}

                {hasVisibleReview && (
                  <Button
                    variant="blue"
                    size="sm"
                    iconLeft={<CheckCircle size={12} />}
                    onClick={() => handlers?.onReview?.({ id: b.id, reviewId: b.reviewId })}
                  >
                    Show Review
                  </Button>
                )}
              </>
            )}

            {isAdmin && hasVisibleReview && (
              <Button
                variant="blue"
                size="sm"
                iconLeft={<CheckCircle size={12} />}
                onClick={() => handlers?.onReview?.({ id: b.id, reviewId: b.reviewId })}
              >
                Show Review
              </Button>
            )}

            {![
              BOOKING_STATUS.PENDING,
              BOOKING_STATUS.APPROVED,
              BOOKING_STATUS.CANCELLED,
              BOOKING_STATUS.REJECTED,
              BOOKING_STATUS.EXPIRED as string,
            ].includes(b.status) &&
              !isAdmin && (
                <Button
                  variant="red"
                  size="sm"
                  iconLeft={<ShieldAlert size={12} />}
                  onClick={() => handlers?.onDispute?.(b.id)}
                >
                  {b.status === BOOKING_STATUS.DISPUTED ? 'View Dispute' : 'Dispute'}
                </Button>
              )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
