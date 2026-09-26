import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { cn } from '@/lib/utils';
import PageError from '@/pages/PageError';
import CategoryService from '@/services/category.service';

import { ServiceCard } from '../../home/components/ServiceCard';
import { ServiceGridSkeleton } from '../components/ServiceCardSkeleton';
import { usePublicServices } from '../hooks/useServices';

export default function ServiceDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [showCategoryArrows, setShowCategoryArrows] = useState(false);

  const activeCategoryId = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'popular';

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories-level-1'],
    queryFn: () => CategoryService.getCategoryLevels(1),
    staleTime: 60 * 60 * 1000,
  });

  const {
    data,
    isLoading: isInitialLoading,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
    isFetchingNextPage,
  } = usePublicServices({
    categoryId: activeCategoryId || undefined,
    sortBy: sortBy,
    limit: 8,
  });

  useEffect(() => {
    const checkOverflow = () => {
      const el = categoryScrollRef.current;
      if (!el) {
        setShowCategoryArrows(false);
        return;
      }
      setShowCategoryArrows(el.scrollWidth > el.clientWidth + 2);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [categories, loadingCategories]);

  const updateParam = (key: string, value: string) => {
    setSearchParams(prev => {
      if (!value) {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const scrollCategories = (delta: number) => {
    categoryScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const services = data?.pages.flatMap(page => page.categories) ?? [];
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  if (isError) {
    return <PageError title={error?.message} fullScreen />;
  }
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10 overflow-x-hidden">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div />
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-48 group">
                <select
                  value={sortBy}
                  onChange={e => updateParam('sortBy', e.target.value)}
                  aria-label="Sort services"
                  className="w-full appearance-none bg-card h-10 pl-4 pr-10 rounded-xl border border-border shadow-sm text-sm font-medium text-foreground cursor-pointer outline-none transition-all hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="popular">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
                <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              {(activeCategoryId || sortBy !== 'popular') && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="w-full border-b border-border/60 pb-1">
            {showCategoryArrows && (
              <div className="mb-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => scrollCategories(-180)}
                  className="p-1.5 rounded-md border border-border bg-card text-muted-foreground"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCategories(180)}
                  className="p-1.5 rounded-md border border-border bg-card text-muted-foreground"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <div
              ref={categoryScrollRef}
              className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto overflow-y-hidden no-scrollbar overscroll-x-contain"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
            >
              <div className="flex w-max min-w-full gap-2 pb-3 pt-1 pr-2 snap-x scroll-pl-4 sm:scroll-pl-1">
                <button
                  onClick={() => updateParam('category', '')}
                  className={cn(
                    'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 snap-start select-none border',

                    !activeCategoryId
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-muted-foreground border-border hover:border-border/80 hover:bg-muted hover:text-foreground'
                  )}
                >
                  All Services
                </button>
                {loadingCategories ? (
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : (
                  categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam('category', cat.id)}
                      className={cn(
                        'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 snap-start select-none border',

                        activeCategoryId === cat.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:border-border/80 hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isInitialLoading && services.length === 0 ? (
            <ServiceGridSkeleton />
          ) : services.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-card rounded-3xl border border-border shadow-sm mx-auto max-w-lg"
            >
              <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No services found</h3>
              <p className="text-muted-foreground mt-2 px-6">
                We couldn't find anything matching your filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 min-w-0">
                {services.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: Math.min(i * 0.05, 0.4),
                      ease: 'easeOut',
                    }}
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </div>
              <div ref={sentinelRef} className="h-4" />
              {isFetchingNextPage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ServiceGridSkeleton />
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
