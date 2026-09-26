import { motion } from 'framer-motion';

import { StarRating } from '@/components/atoms/StarRating';
import RatingDistributionBar from '@/components/molecules/RatingDistributionBar';

const summaryVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
} as const;

type ReviewSummaryProps = {
  averageRating: number;
  reviewCount: number;
  breakdown: Record<string, number>;
  rating?: number | null;
  onRatingChange?: (star: number | null) => void;
  interactive?: boolean;
};

export function ReviewSummary({
  averageRating,
  reviewCount,
  breakdown,
  rating = null,
  onRatingChange,
  interactive = true,
}: ReviewSummaryProps) {
  const isInteractive = interactive && !!onRatingChange;

  return (
    <motion.div
      variants={summaryVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border bg-card p-6"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-1 sm:min-w-35">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
            className="text-5xl font-bold text-foreground"
          >
            {averageRating.toFixed(1)}
          </motion.span>
          <StarRating rating={Math.round(averageRating)} size="lg" />
          <span className="text-sm text-muted-foreground">{reviewCount} reviews</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = breakdown[String(star)] ?? 0;
            if (isInteractive) {
              return (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onRatingChange?.(rating === star ? null : star)}
                  className={`w-full rounded-md px-2 py-0.5 transition-colors hover:bg-accent ${
                    rating === star ? 'bg-accent' : ''
                  }`}
                >
                  <RatingDistributionBar star={star} count={count} total={reviewCount} />
                </motion.button>
              );
            }
            return (
              <div key={star} className="w-full px-2 py-0.5">
                <RatingDistributionBar star={star} count={count} total={reviewCount} />
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
