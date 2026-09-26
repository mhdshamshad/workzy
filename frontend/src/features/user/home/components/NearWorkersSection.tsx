import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';

import { AppCarousel } from '@/components/molecules/AppCarousel';
import { homeService } from '@/services/home.service';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import type { NearbyWorkerItem, NearbyWorkerListResponse } from '@/types/home/home';
import type { NearbyWorkersContent } from '@/types/home/home.sectionContent';

import NearbyWorkerCard from './NearbyWorkerCard';

interface NearWorkersSectionProps {
  section: NearbyWorkersContent;
}
export default function NearWorkersSection({ section }: NearWorkersSectionProps) {
  const { title, subTitle, limit = 15, radiusKm = 100 } = section;
  const { latitude, longitude } = useAppSelector((state: RootState) => state.location);

  const {
    data: workers = [],
    error,
    isLoading,
  } = useQuery<NearbyWorkerListResponse, Error, NearbyWorkerItem[]>({
    queryKey: ['workers', latitude, longitude, radiusKm, limit],
    queryFn: () =>
      homeService.getNearbyWorkers({ radius: radiusKm, limit, lat: latitude, lng: longitude }),
    select: res => res.workers,
    staleTime: 10 * 60 * 1000, // 60 minutes
    enabled: !!latitude && !!longitude,
  });

  if (error) {
    console.error('Error fetching nearby workers:', error);
    return null;
  }
  if (workers.length < 4) {
    return null;
  }
  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div>Loading nearby workers...</div>
        ) : (
          <AppCarousel
            items={workers}
            renderItem={worker => <NearbyWorkerCard key={worker.id} worker={worker} />}
            badge={
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" />
                In Your Area
              </div>
            }
            title={title || 'Professionals Near You'}
            subTitle={subTitle || 'Verified experts ready to serve'}
          />
        )}
      </div>
    </section>
  );
}
