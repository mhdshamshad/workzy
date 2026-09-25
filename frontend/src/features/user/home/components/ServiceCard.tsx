import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { Category } from '@/types/category';

type ServiceItem = Pick<Category, 'id' | 'name' | 'description' | 'imageUrl' | 'baseRate'>;

interface ServiceCardProps {
  service: ServiceItem;
  className?: string;
}
export function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <Link to={`/services/${service.id}`} className="block h-full">
      <article
        className={cn(
          'group relative flex flex-col h-full w-full bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer',
          className
        )}
      >
        <div className="relative w-full h-28 sm:h-36 md:h-44 bg-muted overflow-hidden">
          <img
            src={service.imageUrl || '/assets/service-placeholder.png'}
            alt={service.name}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="flex flex-col grow p-3 sm:p-4 md:p-5">
          <h4 className="text-xs sm:text-sm md:text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {service.name}
          </h4>

          <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1 sm:mt-2 leading-relaxed min-h-8 sm:min-h-10">
            {service.description || 'Professional service for your needs.'}
          </p>
          <div className="mt-3 mb-2 sm:mt-4 sm:mb-3 h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Starts at
              </span>
              <span className="text-sm sm:text-base md:text-lg font-black text-primary">
                ₹{service.baseRate}
              </span>
            </div>

            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
