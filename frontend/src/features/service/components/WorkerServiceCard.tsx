import {
  Award,
  BadgeCheck,
  Car,
  Clock,
  MapPin,
  Pencil,
  ShieldCheck,
  ShieldOff,
  Tag,
  XCircle,
  Zap,
} from 'lucide-react';

import Button from '@/components/atoms/Button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PublicWorkerServiceItem, Service } from '@/types/service';
import { formatCurrency } from '@/utils/currency';
import { formatDuration } from '@/utils/time.format';

export type ServiceCardMode = 'worker' | 'admin' | 'public';

interface WorkerServiceCardProps {
  service: Service | PublicWorkerServiceItem;
  mode?: ServiceCardMode;
  onBookService?: (serviceId: string) => void; /* public mode only */
  /** worker mode only */
  onEdit?: (service: Service) => void;
  onToggleStatus?: (service: Service) => void;
}

function isFullService(s: Service | PublicWorkerServiceItem): s is Service {
  return 'isAvailable' in s;
}

export default function WorkerServiceCard({
  service,
  mode = 'public',
  onEdit,
  onToggleStatus,
  onBookService,
}: WorkerServiceCardProps) {
  const full = isFullService(service) ? service : null;
  const isPublic = mode === 'public';
  const isWorker = mode === 'worker';

  const InitialFallback = () => (
    <div className="flex h-full w-full items-center justify-center bg-primary/10 dark:bg-primary/15">
      <span className="text-[15px] font-black text-primary">
        {service.serviceName.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-black/8 dark:hover:shadow-black/30">
      <div className="relative h-48 shrink-0 overflow-hidden bg-muted">
        {service.imageUrl ? (
          <img
            src={service.imageUrl}
            alt={service.serviceName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted/60">
            <span className="select-none text-7xl font-black text-muted-foreground/10">
              {service.serviceName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/10 to-transparent" />
        {!isPublic && full && (
          <div className="absolute left-3 top-3">
            <Badge
              className={
                full.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-red-500/88 text-white'
              }
            >
              {full.isAvailable ? (
                <BadgeCheck className="h-2.5 w-2.5" />
              ) : (
                <XCircle className="h-2.5 w-2.5" />
              )}
              {full.isAvailable ? 'Active' : 'Blocked'}
            </Badge>
          </div>
        )}
        {!isPublic && full?.allowSuddenBooking && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/92 px-2.5 py-1 text-[10px] font-bold text-amber-950 backdrop-blur-sm">
              <Zap className="h-2.5 w-2.5" />
              Instant
            </span>
          </div>
        )}

        <span className="absolute bottom-3 right-3 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold capitalize text-white backdrop-blur-sm">
          {service.serviceType}
        </span>
      </div>
      <div className="relative z-10 flex items-end gap-3 px-4">
        <div
          className={cn(
            '-mt-5.5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border-[2.5px] border-card shadow-[0_3px_12px_rgba(0,0,0,0.20)'
          )}
        >
          {service.iconUrl ? (
            <img src={service.iconUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <InitialFallback />
          )}
        </div>

        <div className="min-w-0 flex-1 pb-1 pt-3">
          <p className="truncate text-[13px] font-semibold leading-snug text-foreground">
            {service.serviceName}
          </p>
          {'categoryName' in service && service.categoryName && (
            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
              {service.categoryName}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-2.5">
        {service.description && (
          <p className="line-clamp-2 text-[11.5px] leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        )}
        <div
          className={cn(
            'grid divide-x divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-muted/40',
            isPublic ? 'grid-cols-2' : 'grid-cols-3'
          )}
        >
          <StatCell
            icon={<Award className="h-3.5 w-3.5" />}
            value={`${service.experience}y`}
            label="Exp"
          />
          <StatCell
            icon={<Clock className="h-3.5 w-3.5" />}
            value={formatDuration(service.estimatedDuration)}
            label="Est."
          />
          {!isPublic && full && (
            <StatCell
              icon={<MapPin className="h-3.5 w-3.5" />}
              value={`${full.maxTravelRadius}km`}
              label="Radius"
            />
          )}
        </div>
        {!isPublic && full?.maxTravelCost !== null && (
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
            <Car className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Travel fee up to</span>
            <span className="ml-auto text-[11px] font-semibold text-foreground">
              {formatCurrency(full?.maxTravelCost)}
            </span>
          </div>
        )}
        {service.bulkDiscounts && service.bulkDiscounts.length > 0 && (
          <div className="flex flex-wrap items-start gap-1.5">
            <Tag className="mt-0.5 h-3 w-3 shrink-0 text-rose-500" />
            {service.bulkDiscounts.map(d => (
              <span
                key={d.count}
                className="rounded-full border border-rose-500/22 bg-rose-500/8 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:bg-rose-500/12 dark:text-rose-400"
              >
                {d.count}+ → {d.percent}% off
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="min-w-0">
            <p className="text-xl font-black tracking-tight text-foreground">
              {formatCurrency(service.rate)}
            </p>
            <p className="mt-0.5 text-[10px] capitalize text-muted-foreground">
              {service.pricingMode.replace('_', ' ')}
            </p>
          </div>
          {isWorker && full && (
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                iconLeft={<Pencil className="h-3.5 w-3.5" />}
                onClick={() => onEdit?.(full)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant={full.isAvailable ? 'red' : 'green'}
                iconLeft={
                  full.isAvailable ? (
                    <ShieldOff className="h-3.5 w-3.5" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" />
                  )
                }
                onClick={() => onToggleStatus?.(full)}
              >
                {full.isAvailable ? 'Block' : 'Unblock'}
              </Button>
            </div>
          )}

          {isPublic && (
            <Button size="sm" onClick={() => onBookService?.(service.id)}>
              Book now
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function StatCell({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-[12px] font-bold leading-none text-foreground">{value}</p>
      <p className="text-[8px] uppercase tracking-[0.08em] text-muted-foreground/60">{label}</p>
    </div>
  );
}
