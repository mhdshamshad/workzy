import { ArrowDownUp } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { DataList } from '@/components/data-table/DataList';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import {
  transactionColumns,
  TransactionFilterBar,
  type useTransactionFilterParams,
} from '@/features/wallet';
import type { WalletTransaction } from '@/types/wallet';

type TransactionFilterParams = ReturnType<typeof useTransactionFilterParams>;

interface TransactionListViewProps {
  filters: TransactionFilterParams;
  transactions: WalletTransaction[];
  query: {
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  };
}

export function TransactionListView({
  filters: {
    search,
    handleToDateChange,
    category,
    handleCategoryChange,
    type,
    handleBillTypeChange,
    fromDate,
    handleFromDateChange,
    toDate,
    handleSearchChange,
    clearAllFilters,
    hasActiveFilters,
  },
  query: { isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch },
  transactions,
}: TransactionListViewProps) {
  return (
    <div className="space-y-4">
      <TransactionFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        type={type}
        onBillTypeChange={handleBillTypeChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearAllFilters}
        disabled={isError}
      />
      <DataList
        data={transactions}
        isLoading={isLoading}
        isError={isError}
        columns={transactionColumns}
        mode="table"
        paginationType="cursor"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        errorState={
          <ErrorState
            title="Couldn't load Transactions"
            description={error?.message}
            onRetry={refetch}
          />
        }
        emptyState={
          <EmptyState
            title="No payments found"
            description={
              hasActiveFilters
                ? 'No transactions match your filters.'
                : 'No wallet ledger transactions have been recorded yet.'
            }
            icon={<ArrowDownUp className="w-8 h-8" />}
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
