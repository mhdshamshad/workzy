import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AppCarousel } from '@/components/molecules/AppCarousel';
import { homeService } from '@/services/home.service';
import type { TopServiceItem, TopServicesApiResponse } from '@/types/home/home';
import type { TopServicesContent } from '@/types/home/home.sectionContent';

interface TopServiceSectionProps {
  section: TopServicesContent;
}

export default function TopServiceSection({ section }: TopServiceSectionProps) {
  const { title, limit, subTitle } = section;

  const { data: services = [], isLoading } = useQuery<
    TopServicesApiResponse,
    Error,
    TopServiceItem[]
  >({
    queryKey: ['topServices', limit],
    queryFn: () => homeService.getTopServices(limit),
    select: res => res.services,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="py-16 bg-section-blue">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-indigo-600 text-sm mb-3 shadow-md">
              <TrendingUp className="w-4 h-4" />
              Most Popular
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {title || 'Top Booked Services'}
            </h2>
            <p className="text-muted-foreground">
              {subTitle || 'Join thousands of satisfied customers'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="basis-full min-[400px]:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 shrink-0"
              >
                <div className="h-48 bg-muted rounded-xl animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded mt-3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <AppCarousel
            items={services}
            renderItem={(service: TopServiceItem) => (
              <TopService key={service.categoryId} service={service} />
            )}
            className="pl-4 basis-full min-[400px]:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          />
        )}
      </div>
    </section>
  );
}

export function TopService({ service }: { service: TopServiceItem }) {
  return (
    <Link to={`/services/${service.categoryId}`} className="block h-full">
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
        className="w-full shrink-0 bg-card rounded-4xl overflow-hidden border border-border/50 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
      >
        <div className="relative h-44 overflow-hidden">
          <img
            src={service.imageUrl}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {service.bookings && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-card/90 backdrop-blur-md rounded-full text-[10px] font-black text-primary shadow-sm">
              {service.bookings} BOOKINGS
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h4 className="font-black text-white text-lg leading-tight group-hover:translate-x-1 transition-transform duration-300">
              {service.name}
            </h4>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between bg-muted/30 border-t border-border/50">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            Explore Service
          </span>

          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:-rotate-45 transition-all duration-500">
            <ArrowRight size={14} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
