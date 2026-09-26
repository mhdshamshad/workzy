import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AppCarousel } from '@/components/molecules/AppCarousel';
import { homeService } from '@/services/home.service';
import type { ServiceItem, ServiceSuggestionApiResponse } from '@/types/home/home';
import type { CategoryShowcaseContent } from '@/types/home/home.sectionContent';

import { CarouselRowSkeleton } from './LoadingHome';
import { ServiceCard } from './ServiceCard';

interface CategoryShowcaseBlockProps {
  section: CategoryShowcaseContent;
}

export default function CategoryShowcaseSection({ section }: CategoryShowcaseBlockProps) {
  const { title, subTitle, limit } = section;
  const categoryId = section.categoryId;

  const { data: services = [], isLoading } = useQuery<
    ServiceSuggestionApiResponse,
    Error,
    ServiceItem[]
  >({
    queryKey: ['servicesByCategory', categoryId, limit],
    queryFn: () => homeService.getServicesByCategory(categoryId, limit),
    select: res => res.services,
    enabled: !!categoryId,
    staleTime: 60 * 60 * 1000, // 60 minutes
  });

  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {isLoading ? (
          <CarouselRowSkeleton />
        ) : (
          <AppCarousel
            items={services}
            renderItem={(service: ServiceItem) => (
              <ServiceCard key={service.id} service={service} />
            )}
            className="basis-1/2 md:basis-1/3 lg:basis-1/4"
            title={title}
            subTitle={subTitle}
            actions={
              <Link
                to={`/services?category=${categoryId}`}
                className="group inline-flex items-center gap-1.5 text-primary font-semibold text-xs sm:text-sm hover:gap-2 transition-all whitespace-nowrap"
              >
                See All
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            }
          />
        )}
      </div>
    </section>
  );
}
