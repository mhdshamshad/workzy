import { motion } from 'framer-motion';
import { Clock, MapPin, Percent, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import { StarRating } from '@/components/atoms/StarRating';
import ProfileImage from '@/components/molecules/ProfileImage';
import type { PublicWorkerListItem } from '@/types/worker';
import { formatDuration } from '@/utils/time.format';

type WorkerCardProps = {
  worker: PublicWorkerListItem;
  index?: number;
  onBook: (worker: PublicWorkerListItem) => void;
};

export function WorkerCard({ worker, index = 0, onBook }: WorkerCardProps) {
  const {
    id,
    averageRating,
    bulkDiscounts,
    displayName,
    distanceKm,
    estimatedDuration,
    description,
    isAvailable,
    reviewCount,
    serviceRate,
    tagline,
    totalAmount,
    travelCost,
    profileImage,
  } = worker;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-4 sm:p-5 flex gap-4">
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="relative">
            <ProfileImage src={profileImage} name={displayName} size={80} />
            {isAvailable && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-bold text-[15px] sm:text-base text-foreground leading-snug tracking-tight">
              {displayName}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground -mt-1 truncate">{tagline}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="flex items-center gap-1">
              <StarRating rating={averageRating} />
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </span>

            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {distanceKm} km
            </span>

            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDuration(estimatedDuration)}
            </span>

            {travelCost > 0 && (
              <>
                <span className="w-px h-3 bg-border" />
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 fill-amber-400" />
                  +₹{travelCost} travel
                </span>
              </>
            )}
          </div>

          {bulkDiscounts && bulkDiscounts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {bulkDiscounts.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full"
                >
                  <Percent className="w-2.5 h-2.5" />
                  {d.percent}% off · {d.count}+ items
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-end justify-between gap-4 min-w-27.5">
          <div className="text-right">
            <div className="flex items-start justify-end gap-0.5 leading-none">
              <span className="text-sm font-bold text-foreground/70 mt-0.75">₹</span>
              <span className="text-[32px] font-black text-foreground leading-none tracking-tighter">
                {serviceRate.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {worker.pricingMode?.replace(/_/g, ' ').toLowerCase()}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <motion.div whileTap={{ scale: 0.97 }} className="w-full">
              <Link
                to={`/workers/${id}`}
                className="flex items-center justify-center w-full text-xs font-semibold px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors whitespace-nowrap"
              >
                View Profile →
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }} className="w-full">
              <Button
                variant="green"
                size="sm"
                fullWidth
                onClick={() => onBook(worker)}
                className="rounded-lg text-xs font-semibold"
              >
                Book Now
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 mt-0 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Estimated Total
          </span>
          <span className="text-[10px] text-muted-foreground/60">incl. travel & service</span>
        </div>
        <div className="flex items-start gap-0.5 leading-none">
          <span className="text-sm font-bold text-foreground/70 mt-0.75">₹</span>
          <span className="text-2xl font-black text-foreground tracking-tighter">
            {totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
