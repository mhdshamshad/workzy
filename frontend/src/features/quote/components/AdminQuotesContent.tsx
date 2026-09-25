import { Search } from 'lucide-react';

import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import SearchInput from '@/components/molecules/SearchInput';
import { ROLE } from '@/constants';
import PageError from '@/pages/PageError';

import {
  QuoteCard,
  QuoteCardSkeleton,
  QuoteStatsGrid,
  QuoteStatsSkeleton,
  QuoteStatusTabs,
  useQuoteList,
  useWorkerQuoteStats,
} from '../index';

interface AdminQuotesContentProps {
  workerId?: string;
  userId?: string;
}

export function AdminQuotesContent({ workerId, userId }: AdminQuotesContentProps) {
  const {
    quotes,
    search,
    status,
    isLoading,
    error,
    refetch,
    isFetchingNextPage,
    hasActiveFilters,
    clearFilters,
    handleSearchChange,
    sentinelRef,
    updateParams,
  } = useQuoteList({ workerId, userId });

  const { data: stats, isLoading: statsLoading } = useWorkerQuoteStats(workerId);

  return (
    <div className="space-y-4">
      {workerId &&
        (statsLoading ? <QuoteStatsSkeleton /> : stats ? <QuoteStatsGrid stats={stats} /> : null)}

      <QuoteStatusTabs
        value={status}
        onValueChange={v => updateParams({ status: v })}
        counts={stats?.counts}
        className="mb-4"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-55 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by booking, customer, or service…"
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <QuoteCardSkeleton />
      ) : error ? (
        <PageError onRetry={refetch} description={error.message} />
      ) : quotes.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'Try adjusting your filters.' : 'No quotes found'}
          description={
            hasActiveFilters ? 'No quotes match the selected filters.' : 'No quotes found'
          }
          action={
            hasActiveFilters ? (
              <Button variant="red" size="sm" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {quotes.map((q, i) => (
            <QuoteCard key={q.id} quote={q} delay={i * 0.03} role={ROLE.ADMIN} />
          ))}
        </div>
      )}
      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && <QuoteCardSkeleton />}
    </div>
  );
}
