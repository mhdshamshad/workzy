import { Banknote } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { DataList } from '@/components/data-table/DataList';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import { payoutColumns, PayoutFilterBar, usePayoutFilterParams } from '@/features/wallet';
import type { PayoutRequest } from '@/types/payout';

type PayoutFilterParams = ReturnType<typeof usePayoutFilterParams>;

interface PayoutListViewProps {
  filters: PayoutFilterParams;
  payouts: PayoutRequest[];
  query: {
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  };
  onViewPayout: (payout: PayoutRequest) => void;
}

export function PayoutListView({
  filters: {
    search,
    handleToDateChange,
    status,
    handleStatusChange,
    fromDate,
    handleFromDateChange,
    toDate,
    handleSearchChange,
    clearAllFilters,
    hasActiveFilters,
  },
  query: { isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch },
  payouts,
  onViewPayout,
}: PayoutListViewProps) {
  return (
    <div className="space-y-4">
      <PayoutFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        disabled={isError}
      />
      <DataList
        data={payouts}
        isLoading={isLoading}
        isError={isError}
        columns={payoutColumns(onViewPayout)}
        mode="table"
        paginationType="cursor"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        errorState={
          <ErrorState
            title="Couldn't load withdrawal requests"
            description={error?.message}
            onRetry={refetch}
          />
        }
        emptyState={
          <EmptyState
            title="No payouts found"
            description={
              hasActiveFilters
                ? 'No payouts match your filters.'
                : 'No payout requests have been recorded yet.'
            }
            icon={<Banknote className="w-8 h-8" />}
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                  Clear filters
                </Button>
              ) : null
            }
          />
        }
      />
    </div>
  );
}
