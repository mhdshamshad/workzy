import { CreditCard } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { DataList } from '@/components/data-table/DataList';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import { ROLE } from '@/constants';
import { getPaymentColumns } from '@/features/payments/components/paymentColumns';
import { PaymentFilterBar } from '@/features/payments/components/PaymentFilterBar';
import { usePaymentFilterParams } from '@/features/payments/hooks/usePaymentFilterParams';

import { useWorkerPayments } from '../hooks/useWorkerPayments';

export default function WorkerPaymentsPage() {
  const {
    search,
    status,
    fromDate,
    toDate,
    fromDateString,
    toDateString,
    hasActiveFilters,
    handleSearchChange,
    handleStatusChange,
    handleFromDateChange,
    handleToDateChange,
    clearAllFilters,
  } = usePaymentFilterParams();

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWorkerPayments({
      status,
      search,
      fromDate: fromDateString,
      toDate: toDateString,
    });

  const payments = data?.pages.flatMap(p => p.payments) ?? [];

  return (
    <div className="space-y-4">
      <PaymentFilterBar
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
        data={payments}
        isLoading={isLoading}
        isError={isError}
        errorState={
          <ErrorState
            title="Couldn't load payments"
            description="Something went wrong while fetching payment data."
            onRetry={refetch}
          />
        }
        emptyState={
          <EmptyState
            title="No payments found"
            description="No payments found matching your filters."
            icon={<CreditCard className="w-8 h-8" />}
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                  Clear filters
                </Button>
              ) : null
            }
          />
        }
        columns={getPaymentColumns(ROLE.WORKER)}
        mode="table"
        paginationType="cursor"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
}
