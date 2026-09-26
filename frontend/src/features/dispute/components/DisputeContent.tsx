import { Filter, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import { DataList } from '@/components/data-table/DataList';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import PageHeader from '@/components/molecules/PageHeader';
import SearchInput from '@/components/molecules/SearchInput';
import { ROLE, type Role } from '@/constants';
import {
  DISPUTE_STATUS_VALUES,
  DISPUTE_REASON_LABELS,
  type DisputeReason,
} from '@/constants/dispute';
import { useUrlFilterParams } from '@/hooks/useUrlFilterParams';
import { cn } from '@/lib/utils';

import {
  disputeColumns,
  DisputeModal,
  DisputeStatsSection,
  useDisputes,
  useDisputeStats,
} from '../index';

export interface DisputeContentProps {
  role?: Role;
  userId?: string;
  workerId?: string;
}

export function DisputeContent({ role = ROLE.USER, workerId, userId }: DisputeContentProps) {
  const [disputeBId, setDisputeBId] = useState<string | null>(null);
  const { updateParams, search, status, reason } = useUrlFilterParams<{
    reason: DisputeReason | 'all';
  }>([{ key: 'reason', defaultValue: 'all' }]);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error, refetch } =
    useDisputes({ search, status, reason, userId, workerId });

  const {
    data: statsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useDisputeStats({ userId, workerId });

  const disputes = data?.pages.flatMap(page => page.disputes) ?? [];

  const hasActiveFilters = !!search || status !== 'all' || reason !== 'all';
  const clearFilters = () => updateParams({ search: '', status: 'all', reason: 'all' });
  const handleSearchChange = useCallback(
    (v: string) => {
      updateParams({ search: v });
    },
    [updateParams]
  );

  return (
    <div>
      {!workerId && !userId && (
        <PageHeader title="Disputes" description="Manage and resolve all booking disputes" />
      )}
      <DisputeStatsSection
        isError={isStatsError}
        isLoading={isStatsLoading}
        statsData={statsData}
      />
      <div
        className={cn(
          'grid grid-cols-12 gap-4 mt-12',
          hasActiveFilters
            ? 'md:grid-cols-[1fr_200px_200px_auto]'
            : 'md:grid-cols-[1fr_200px_200px]'
        )}
      >
        <div className={cn('col-span-12 md:col-span-1', hasActiveFilters && 'col-span-8')}>
          <SearchInput
            disabled={!!error}
            placeholder="Search by bookingId or ServiceName..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        {hasActiveFilters && (
          <div className="col-span-4 md:col-span-1 flex items-start md:order-last">
            <Button
              onClick={clearFilters}
              size="md"
              iconLeft={<X className="h-3 w-3" />}
              variant="red"
              className="w-full md:w-auto mt-px"
            >
              Clear
            </Button>
          </div>
        )}
        <div className="col-span-6 md:col-span-1">
          <Select
            value={status}
            onChange={v => updateParams({ status: v })}
            leftIcon={<Filter />}
            disabled={!!error}
            options={[
              { label: 'All Status', value: 'all' },
              ...DISPUTE_STATUS_VALUES.map(val => ({
                label: val.charAt(0).toUpperCase() + val.replaceAll('_', ' ').slice(1),
                value: val,
              })),
            ]}
          />
        </div>
        <div className="col-span-6 md:col-span-1">
          <Select
            value={reason}
            onChange={v => updateParams({ reason: v })}
            leftIcon={<Filter />}
            disabled={!!error}
            options={[
              { label: 'All Reasons', value: 'all' },
              ...Object.entries(DISPUTE_REASON_LABELS).map(([value, label]) => ({
                label,
                value,
              })),
            ]}
          />
        </div>
      </div>
      <div className="mt-6">
        <DataList
          data={disputes}
          isLoading={isLoading}
          isError={!!error}
          errorState={
            error ? <ErrorState description={error.message} onRetry={refetch} /> : undefined
          }
          emptyState={
            <EmptyState
              title="No disputes found"
              description="There are no disputes matching your criteria."
              action={
                hasActiveFilters ? (
                  <Button onClick={clearFilters} variant="outline" size="sm" className="mt-2">
                    Clear filters
                  </Button>
                ) : null
              }
            />
          }
          columns={disputeColumns(id => setDisputeBId(id), role, { workerId, userId })}
          mode="table"
          paginationType="cursor"
          hasNextPage={!!hasNextPage}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
      <DisputeModal
        open={!!disputeBId}
        onClose={() => setDisputeBId(null)}
        bookingId={disputeBId}
        role={role}
      />
    </div>
  );
}
