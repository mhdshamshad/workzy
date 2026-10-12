import dayjs from 'dayjs';
import { Banknote, CircleCheck, CircleX, Inbox, Play } from 'lucide-react';
import { useCallback, useState } from 'react';

import Button from '@/components/atoms/Button';
import { DatePicker } from '@/components/atoms/Datepicker';
import { DataList } from '@/components/data-table/DataList';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import PageHeader from '@/components/molecules/PageHeader';
import SearchInput from '@/components/molecules/SearchInput';
import { PAYOUT_REQUEST_STATUS } from '@/constants/payout';
import type { PayoutRequest } from '@/types/payout';
import { formatCurrency } from '@/utils/currency';
import { enumToOptions } from '@/utils/selectOptions';
import { formatDaysAgo } from '@/utils/time.format';

import { payoutColumns } from '../../components/payoutColumns';
import { PayoutDetailsModal } from '../../components/PayoutDetailsModal';
import { WalletOverviewSkeleton } from '../../components/WalletOverviewSkeleton';
import { useAdminPayouts, useAdminPayoutStats } from '../../hooks/useAdminPayout';
import { usePayoutFilterParams } from '../../hooks/usePayoutFilterParams';

export default function AdminPayoutPage() {
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);

  const {
    search,
    fromDateString,
    toDateString,
    status,
    handleFromDateChange,
    fromDate,
    handleSearchChange,
    handleStatusChange,
    handleToDateChange,
    toDate,
    updateParams,
  } = usePayoutFilterParams();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useAdminPayouts({
    search,
    status,
    fromDate: fromDateString,
    toDate: toDateString,
  });

  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useAdminPayoutStats();

  const payouts = data?.pages.flatMap(p => p.payouts) ?? [];
  const pendingCount = stats?.pending.count ?? 0;
  const pendingWorkers = stats?.pending.uniqueWorkers ?? 0;

  const tabCounts: Record<string, number | undefined> = {
    all: stats?.total.count,
    pending: stats?.pending.count,
    approved: stats?.approved.count,
    rejected: stats?.rejected.count,
  };

  const hasActiveFilters = !!(search || fromDate || toDate);

  const isFutureDate = (date: Date) => dayjs(date).isAfter(dayjs(), 'day');
  const isToDateDisabled = (date: Date) =>
    (fromDate ? dayjs(date).isBefore(fromDate, 'day') : false) || isFutureDate(date);

  const statsOptions = enumToOptions(PAYOUT_REQUEST_STATUS, 'All');
  const firstOption = statsOptions.shift();
  if (firstOption !== undefined) {
    statsOptions.push(firstOption);
  }

  const clearAllFilters = useCallback(() => {
    updateParams({
      search: '',
      fromDate: null,
      toDate: null,
    });
  }, [updateParams]);

  const handleReviewNext = () => {
    const nextPending = payouts.find(p => p.status === PAYOUT_REQUEST_STATUS.PENDING);
    if (nextPending) {
      setSelectedPayout(nextPending);
    } else {
      handleStatusChange(PAYOUT_REQUEST_STATUS.PENDING);
    }
  };

  return (
    <div className="section-container space-y-6 p-4 lg:p-6">
      <PageHeader
        title="Payout Requests"
        description="Review, approve, or reject worker withdrawal settlements"
      />

      {/* Summary Hero & Side Stats */}
      {isStatsLoading ? (
        <WalletOverviewSkeleton />
      ) : isStatsError ? (
        <ErrorState
          title="Couldn't load payout statistics"
          description={statsError?.message}
          onRetry={refetchStats}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
          {/* Awaiting Review Hero */}
          <div className="relative flex min-h-48 flex-col justify-between gap-4 overflow-hidden rounded-[22px] bg-[#534AB7] p-6 text-white shadow-sm">
            <span className="pointer-events-none absolute -right-14 -top-16 size-56 rounded-full bg-white/10" />
            <span className="pointer-events-none absolute -bottom-24 right-12 size-52 rounded-full bg-white/[0.07]" />

            <div className="relative flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-white/20">
                  <Inbox className="size-5" />
                </span>
                <span className="font-medium text-sm">Awaiting your review</span>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                {pendingCount
                  ? `Oldest: ${formatDaysAgo(stats?.pending.oldestAt)}`
                  : 'All caught up'}
              </span>
            </div>

            <div className="relative">
              <p className="text-[36px] font-bold tracking-tight">
                {formatCurrency(stats?.pending.totalAmount)}
              </p>
              <p className="mt-0.5 text-[13px] text-[#CECBF6]">
                {pendingCount} pending request{pendingCount === 1 ? '' : 's'} from {pendingWorkers}{' '}
                worker{pendingWorkers === 1 ? '' : 's'}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={handleReviewNext}
                disabled={pendingCount === 0}
                className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-white px-4 text-[13px] font-medium text-[#3C3489] transition-colors hover:bg-[#EEEDFE] disabled:opacity-50 cursor-pointer"
              >
                <Play className="size-4 fill-current" />
                Review next request
              </button>
            </div>
          </div>

          {/* Side Cards */}
          <div className="grid gap-4">
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15">
                  <CircleCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {stats?.approved.count ?? 0} settled
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total paid out</p>
                <p className="mt-0.5 text-[24px] font-bold text-foreground">
                  {formatCurrency(stats?.approved.totalAmount)}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15">
                  <CircleX className="size-5 text-rose-600 dark:text-rose-400" />
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {stats?.rejected.count ?? 0} rejected
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="mt-0.5 text-[24px] font-bold text-foreground">
                  {formatCurrency(stats?.rejected.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout List & Filter Table */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" className="inline-flex flex-wrap gap-0.5 rounded-xl bg-secondary p-1">
            {statsOptions.map(t => {
              const isSelected = status === t.value;
              const count = tabCounts[t.value];
              return (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleStatusChange(t.value)}
                  className={`rounded-[9px] px-3.5 py-1.5 text-[13px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-card font-medium text-foreground ring-1 ring-border shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}{' '}
                  {count !== undefined && <span className="ml-1 opacity-75">{count}</span>}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DatePicker
              value={fromDate ?? undefined}
              onChange={handleFromDateChange}
              placeholder="From date"
              disabled={isFutureDate}
              className="h-9 w-40 text-[13px]"
            />
            <DatePicker
              value={toDate ?? undefined}
              onChange={handleToDateChange}
              placeholder="To date"
              disabled={isToDateDisabled}
              className="h-9 w-40 text-[13px]"
            />
            <div className="relative w-full sm:w-64">
              <SearchInput
                placeholder="Search by reference ID..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            {hasActiveFilters && (
              <Button variant="red" size="sm" onClick={clearAllFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        <DataList
          data={payouts}
          isLoading={isLoading}
          isError={isError}
          columns={payoutColumns(p => setSelectedPayout(p), { showWorker: true })}
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

      {selectedPayout && (
        <PayoutDetailsModal
          mode="admin"
          open={Boolean(selectedPayout)}
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
        />
      )}
    </div>
  );
}
