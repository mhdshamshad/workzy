import { motion } from 'framer-motion';
import { MapPin, Star, Briefcase, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import ProfileImage from '@/components/molecules/ProfileImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NearbyWorkerItem } from '@/types/home/home';

export default function NearbyWorkerCard({ worker }: { worker: NearbyWorkerItem }) {
  const {
    id,
    averageRating,
    completedJobs,
    displayName,
    distance,
    experience,
    tagline,
    profileImage,
  } = worker;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-lg'
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:opacity-80"
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <ProfileImage size={40} src={profileImage} name={displayName} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold leading-tight">{displayName}</h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{tagline}</p>
            </div>
          </div>
          {averageRating > 0 && (
            <div className="flex shrink-0 items-center gap-1 rounded-full border bg-background/60 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-golden text-golden" strokeWidth={1.5} />
              <span>{averageRating?.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border bg-muted/30 p-3">
          <Stat icon={<Clock className="h-3.5 w-3.5" />} label="Exp" value={`${experience}y`} />
          <Stat
            icon={<Briefcase className="h-3.5 w-3.5" />}
            label="Jobs"
            value={completedJobs?.toLocaleString() ?? '0'}
          />
          <Stat icon={<MapPin className="h-3.5 w-3.5" />} label="Away" value={`${distance}km`} />
        </div>
        <div className="mt-4 flex items-center justify-end">
          <Button asChild size="sm" className="rounded-full group/btn">
            <Link to={`/workers/${id}`}>
              View Profile
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="mt-0.5 text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
