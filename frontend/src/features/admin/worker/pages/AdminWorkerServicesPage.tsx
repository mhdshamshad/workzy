import { Filter } from 'lucide-react';
import { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SearchInput from '@/components/molecules/SearchInput';
import WorkerServiceGridSkeleton from '@/features/service/components/WorkerServiceCardSkeleton';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useUrlFilterParams } from '@/hooks/useUrlFilterParams';
import type { WorkerProfileDetails } from '@/types/worker';

import WorkerServiceCard from '../../../service/components/WorkerServiceCard';
import {
  useAdminWorkerServiceCategories,
  useAdminWorkerServices,
} from '../hooks/useAdminWorkerServices';

type WorkerOutletContext = { worker: WorkerProfileDetails };
type SelectOption = { label: string; value: string };

export default function AdminWorkerServicesPage() {
  const { worker } = useOutletContext<WorkerOutletContext>();

  const { categoryId, search, status, updateParams } = useUrlFilterParams<{
    categoryId: string | null;
  }>([{ key: 'categoryId' }]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminWorkerServices(worker.id, { search, status, categoryId });
  const { categories, isLoading: categoriesLoading } = useAdminWorkerServiceCategories(worker.id);

  const services = data?.pages.flatMap(p => p.services) ?? [];
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const isHideButton = search !== '' || status !== 'all';
  const clearAllFilters = useCallback(() => {
    updateParams({
      search: '',
      status: 'all',
    });
  }, [updateParams]);

  const handleSearchChange = useCallback(
    (v: string) => updateParams({ search: v }),
    [updateParams]
  );

  const categoriesOptions: SelectOption[] = categories.map(category => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
        <div className="col-span-2 sm:col-span-6">
          <SearchInput
            placeholder="Search services…"
            value={search}
            onChange={handleSearchChange}
            disabled={isError}
          />
        </div>
        <div className="col-span-1 sm:col-span-3">
          <Select
            value={status}
            placeholder="All Status"
            onChange={v => updateParams({ status: v })}
            leftIcon={<Filter />}
            disabled={isError}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Blocked', value: 'blocked' },
            ]}
          />
        </div>
        <div className="col-span-1 sm:col-span-3">
          <Select
            value={categoryId ?? 'all'}
            onChange={v => updateParams({ categoryId: v === 'all' ? null : v })}
            leftIcon={<Filter />}
            disabled={categoriesLoading || isError}
            options={[{ label: 'All Categories', value: 'all' }, ...categoriesOptions]}
          />
        </div>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} description={error.message} />
      ) : isLoading ? (
        <WorkerServiceGridSkeleton />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services found"
          description={
            isHideButton
              ? 'Try adjusting your filters.'
              : 'This worker hasn’t added any services yet.'
          }
          action={
            isHideButton ? (
              <Button onClick={clearAllFilters} variant="red" size="sm">
                Clear Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map(service => (
              <WorkerServiceCard key={service.id} service={service} mode="admin" />
            ))}
          </div>
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && <WorkerServiceGridSkeleton count={3} />}
        </>
      )}
    </div>
  );
}
