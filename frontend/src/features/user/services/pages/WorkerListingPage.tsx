import { AnimatePresence, motion, type MotionProps } from 'framer-motion';
import { ChevronLeft, SlidersHorizontal, MapPin } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';

import { useDebounce } from '@/hooks/useDebounce';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRadius as setRadiusAction } from '@/store/slices/locationSlice';
import type { RootState } from '@/store/store';
import type { PublicWorkerListItem } from '@/types/worker';

import BookingModal from '../../booking/components/bookingForm/BookingModal';
import FilterSidebar from '../components/FilterSidebar';
import { WorkerList, type WorkerListParams } from '../components/WorkerList';
import { getFilterConfig } from '../helper/filterConfig';
import { useServiceDetails, useListWorkers } from '../hooks/useServices';

const fadeUp = (delay = 0): MotionProps => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: 'easeOut' },
});

export default function WorkerListingPage() {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const { radius, latitude, longitude, city } = useAppSelector((s: RootState) => s.location);

  const [bookingWorker, setBookingWorker] = useState<PublicWorkerListItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [availableNow, setAvailableNow] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: selectedService } = useServiceDetails(serviceId);
  const filterConfig = useMemo(() => getFilterConfig(selectedService ?? null), [selectedService]);

  const handleBook = (worker: PublicWorkerListItem) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}${location.hash}` },
      });
      return;
    }
    setBookingWorker(worker);
  };

  const filterParams = useMemo(
    () => ({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating: minRating || undefined,
      availableNow: availableNow || undefined,
      lat: latitude,
      lng: longitude,
      radiusKm: radius,
    }),
    [priceRange, minRating, availableNow, latitude, longitude, radius]
  );
  const hasActiveFilters =
    minRating > 0 ||
    availableNow ||
    priceRange[0] !== filterConfig.minPrice ||
    priceRange[1] !== filterConfig.maxPrice;

  const debouncedFilterParams = useDebounce(filterParams, 600);
  const workerParams: WorkerListParams = useMemo(
    () => ({ page, limit, ...debouncedFilterParams }),
    [page, limit, debouncedFilterParams]
  );
  const {
    data: workersData,
    isLoading: isWorkersLoading,
    error: workerListingError,
    refetch,
  } = useListWorkers(serviceId || null, workerParams);
  useEffect(() => {
    setPage(1);
  }, [radius, priceRange, minRating, availableNow]);

  const resetFilters = () => {
    setPage(1);
    setMinRating(0);
    setAvailableNow(false);
    if (selectedService) {
      const config = getFilterConfig(selectedService);
      setPriceRange([config.minPrice, config.maxPrice]);
    }
  };
  useEffect(() => {
    if (selectedService) {
      const config = getFilterConfig(selectedService);
      setPriceRange([config.minPrice, config.maxPrice]);
    }
  }, [selectedService]);

  return (
    <main className="min-h-screen section-container py-6 flex flex-col gap-6">
      <motion.button
        {...fadeUp(0)}
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background rounded-xl font-medium text-sm shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </motion.button>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <Link
            to="/services"
            replace
            className="group w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center shrink-0 hover:bg-muted hover:border-primary/30 transition-all shadow-sm"
          >
            <ChevronLeft
              size={16}
              className="text-muted-foreground group-hover:text-primary group-hover:-translate-x-0.5 transition-all"
            />
          </Link>
          <div className="w-16 h-16 rounded-2xl bg-primary/8  flex items-center justify-center shrink-0">
            {selectedService?.iconUrl ? (
              <img src={selectedService.iconUrl} alt="" className="w-full rounded-2xl" />
            ) : (
              <SlidersHorizontal size={20} className="text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase italic text-foreground leading-none truncate">
              {selectedService?.name || 'Listing'}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-bold text-primary bg-primary/8 px-2.5 py-1 rounded-full border border-primary/15">
                {workersData?.total || 0} experts
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <MapPin size={11} />
                Near {city}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-6 items-start">
        <FilterSidebar
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterConfig={filterConfig}
          radius={radius}
          setRadius={val => dispatch(setRadiusAction(val))}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minRating={minRating}
          setMinRating={setMinRating}
          availableNow={availableNow}
          setAvailableNow={setAvailableNow}
          resetFilters={resetFilters}
          isServiceSelected={!!selectedService}
        />
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <AnimatePresence>
            {!!selectedService && (
              <motion.div key="workers" {...fadeUp(0.05)} className="flex flex-col gap-4">
                <WorkerList
                  workers={workersData?.workers ?? []}
                  isLoading={isWorkersLoading}
                  error={workerListingError}
                  total={workersData?.total ?? 0}
                  page={page}
                  onRetry={refetch}
                  limit={limit}
                  onPageChange={setPage}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={resetFilters}
                  onBook={handleBook}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {bookingWorker && (
        <BookingModal
          open={!!bookingWorker}
          onClose={() => setBookingWorker(null)}
          worker={bookingWorker!}
        />
      )}
    </main>
  );
}
