import { motion } from 'framer-motion';
import { Eye, EyeOff, ImageIcon, MessageSquare, Pencil, Play } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import { StarRating } from '@/components/atoms/StarRating';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EvidenceItem } from '@/types/booking';
import type { AdminReviewView, PublicReviewView, UserReviewView } from '@/types/review';
import { formatDate } from '@/utils/time.format';

type ReviewCardRole = 'public' | 'user' | 'worker' | 'admin';
interface ReviewCardContext {
  workerId?: string;
  userId?: string;
}

type AnyReviewView = PublicReviewView | AdminReviewView | UserReviewView;

interface ReviewCardProps {
  review: AnyReviewView;
  role: ReviewCardRole;
  context?: ReviewCardContext;
  onOpenMedia: (items: EvidenceItem[], index: number) => void;
  onToggleReview?: (review: AdminReviewView) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2 } },
} as const;

function ratingRingColor(rating: number) {
  if (rating >= 4) {
    return 'var(--section-green-border)';
  }
  if (rating >= 3) {
    return 'var(--section-amber-border)';
  }
  return 'var(--section-red-border)';
}

function isAdminReview(review: AnyReviewView): review is AdminReviewView {
  return 'isHidden' in review;
}
function getWorker(review: AnyReviewView) {
  return 'worker' in review ? review.worker : undefined;
}
function getUser(review: AnyReviewView) {
  return 'user' in review ? review.user : undefined;
}

interface PartyInfo {
  id: string;
  name: string;
  profileImage?: string;
}

function PartyIdentity({
  party,
  to,
  ringColor,
}: {
  party: PartyInfo;
  to?: string;
  ringColor?: string;
}) {
  const content = (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className="shrink-0 rounded-full overflow-hidden"
        style={{
          width: 40,
          height: 40,
          boxShadow: ringColor ? `0 0 0 1.5px ${ringColor}` : undefined,
        }}
      >
        <ProfileImage src={party.profileImage} name={party.name} size={40} />
      </div>
      <p className={cn('truncate text-sm font-semibold text-foreground', to && 'hover:underline')}>
        {party.name}
      </p>
    </div>
  );

  if (!to) {
    return content;
  }

  return <NavLink to={to}>{content}</NavLink>;
}

export const ReviewCard = React.forwardRef<HTMLDivElement, ReviewCardProps>(
  ({ review, role, context, onOpenMedia, onToggleReview }: ReviewCardProps, ref) => {
    const { category, createdAt, isEdited, rating, media, reply, reviewText } = review;

    const admin = isAdminReview(review) ? review : undefined;
    const worker = getWorker(review);
    const user = getUser(review);

    const showUser = role === 'admin' ? !context?.userId : role === 'public' || role === 'worker';
    const showWorker = role === 'admin' ? !context?.workerId : role === 'user';

    const userPath = role === 'admin' && user ? `/admin/users/${user.id}` : undefined;
    const workerPath = role === 'admin' && worker ? `/admin/workers/${worker.id}` : undefined;

    return (
      <motion.div
        ref={ref}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className={cn(
          'group rounded-xl border bg-card p-3.5 transition-shadow hover:shadow-md sm:p-4',
          admin?.isHidden && 'bg-muted/40 opacity-90'
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            {showUser && user && (
              <PartyIdentity party={user} to={userPath} ringColor={ratingRingColor(rating)} />
            )}
            {showUser && showWorker && user && worker && (
              <span className="hidden h-6 w-px bg-border sm:block" />
            )}
            {showWorker && worker && <PartyIdentity party={worker} to={workerPath} />}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="secondary" className="text-[11px]">
              {category.name}
            </Badge>
            {admin?.isHidden && (
              <Badge variant="red" className="gap-1 text-[11px]">
                <EyeOff className="h-3 w-3" />
                Hidden
              </Badge>
            )}
            {media && media.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                <ImageIcon size={11} />
                {media.length}
              </span>
            )}
          </div>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StarRating rating={rating} />
          <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
          <span>{formatDate(createdAt)}</span>
          {isEdited && (
            <span className="inline-flex items-center gap-1">
              <Pencil className="h-3 w-3" />
              edited
            </span>
          )}
        </div>

        {reviewText && (
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{reviewText}</p>
        )}

        {media && media.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {media.map((item, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => onOpenMedia(media, i)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/50 sm:h-18 sm:w-18"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="relative h-full w-full bg-muted">
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <Play className="absolute inset-0 m-auto h-4 w-4 text-white opacity-90" />
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[9px] text-white">
                      Video
                    </span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {reply && (
          <div className="mt-2 border-l-2 border-golden/40 pl-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-foreground">
              <MessageSquare size={12} className="text-golden" />
              {role !== 'worker' ? 'Worker replied' : 'Your reply'}
              <span className="font-normal text-muted-foreground">
                · {formatDate(reply.repliedAt)}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/80">{reply.message}</p>
          </div>
        )}

        {role === 'admin' && admin && onToggleReview && (
          <div className="mt-2.5 flex justify-end border-t border-border/40 pt-2">
            <Button
              variant={admin.isHidden ? 'green' : 'red'}
              size="sm"
              onClick={() => onToggleReview(admin)}
              iconLeft={
                admin.isHidden ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )
              }
              className="h-7 px-2 text-xs"
            >
              {admin.isHidden ? 'Unhide' : 'Hide'}
            </Button>
          </div>
        )}
      </motion.div>
    );
  }
);

ReviewCard.displayName = 'ReviewCard';
