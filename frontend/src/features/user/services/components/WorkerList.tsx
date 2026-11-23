import { AnimatePresence, motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { PublicWorkerListItem } from '@/types/worker';

import { WorkerCard } from './WorkerCard';
import WorkerCardSkeleton from './WorkerCardSkeleton';

type WorkerListProps = {
  workers: PublicWorkerListItem[];
  isLoading: boolean;
  error: null | Error;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onRetry: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onBook: (worker: PublicWorkerListItem) => void;
};

export function WorkerList({
  workers,
  error,
  onRetry,
  isLoading,
  hasActiveFilters,
  onClearFilters,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onBook,
}: WorkerListProps) {
  const sentinelRef = useInfiniteScroll(onLoadMore, hasNextPage, isFetchingNextPage);

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <WorkerCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : error ? (
          <ErrorState description={error.message} onRetry={onRetry} />
        ) : workers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={<SearchX className="w-6 h-6" />}
              title="No professionals found"
              description={
                hasActiveFilters
                  ? 'No results match your current filters.'
                  : 'Try adjusting your search radius.'
              }
              action={
                hasActiveFilters ? (
                  <Button variant="red" onClick={onClearFilters}>
                    Clear Filters
                  </Button>
                ) : undefined
              }
              className="py-12"
            />
          </motion.div>
        ) : (
          <motion.div
            key="workers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {workers.map((worker, i) => (
              <WorkerCard key={worker.id} worker={worker} index={i} onBook={onBook} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {workers.length > 0 && error && <ErrorState description={error.message} onRetry={onRetry} />}
      {hasNextPage && <div ref={sentinelRef} className="h-4" />}
      {isFetchingNextPage && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <WorkerCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
