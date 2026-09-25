import { motion } from 'framer-motion';
import {
  Award,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { WorkerProfile } from '@/types/worker';

import Button from '../atoms/Button';
import ProfileImage from '../molecules/ProfileImage';
import StatCard from '../molecules/StatCard';
import { Badge } from '../ui/badge';

import type React from 'react';

interface Props {
  worker: WorkerProfile;
  workerAction?: React.ReactNode;
  onStartChat?: () => void;
  isChatLoading?: boolean;
  type?: 'public' | 'worker';
}

export default function WorkerProfileHeader({
  worker,
  workerAction,
  onStartChat,
  type = 'public',
  isChatLoading,
}: Props) {
  const {
    displayName,
    coverImage,
    tagline,
    experience,
    profileImage,
    addressLabel,
    jobStats,
    reviewStats,
    isAvailableToday,
  } = worker;

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <div
          className="h-48 w-full bg-muted sm:h-60"
          style={{
            backgroundImage: coverImage ? `url(${coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-black/10 via-transparent to-background sm:h-60" />

        <div
          className={cn(
            'relative px-4 ',
            type === 'public' ? 'mx-auto max-w-7xl sm:px-8' : 'sm:px-6'
          )}
        >
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {workerAction ? (
                workerAction
              ) : (
                <ProfileImage
                  src={profileImage}
                  name={displayName}
                  shape="rounded"
                  size={120}
                  className="w-24! h-24! sm:w-28! sm:h-28!"
                />
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                    {displayName}
                  </h1>
                  <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground sm:text-base">{tagline}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {addressLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    {experience} yrs experience
                  </span>
                  {isAvailableToday ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Available today
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-2 py-0.5">
                      <Clock className="h-3 w-3" />
                      Off today
                    </span>
                  )}
                </div>
              </div>
            </div>
            {onStartChat && (
              <Button
                onClick={onStartChat}
                loading={isChatLoading}
                iconLeft={<MessageCircle className="h-4 w-4" />}
                className="self-start sm:self-end"
              >
                Start chat
              </Button>
            )}
          </div>
        </div>
      </motion.section>
      <section
        className={cn(
          'grid grid-cols-2 gap-3 sm:grid-cols-4 px-4 ',
          type === 'public' ? 'max-w-7xl mx-auto sm:px-8' : 'sm:px-6'
        )}
      >
        <StatCard
          icon={<Star className="h-4 w-4" />}
          label="Rating"
          value={reviewStats.averageRating?.toFixed(1) ?? '—'}
          sub={`${reviewStats.reviewCount} reviews`}
          tone="warning"
        />
        <StatCard
          icon={<Briefcase className="h-4 w-4" />}
          label="Jobs done"
          value={String(jobStats.completed)}
          sub="Completed"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completion"
          value={`${jobStats.complitionRate}%`}
          sub="On-time rate"
          tone="neutral"
        />
        <StatCard
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Verified"
          value="ID + Skill"
          sub="KYC complete"
          tone="info"
        />
      </section>
    </>
  );
}
