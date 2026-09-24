import { Search } from 'lucide-react';
import { useState } from 'react';

import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import SearchInput from '@/components/molecules/SearchInput';
import { ROLE } from '@/constants';
import PageError from '@/pages/PageError';
import type { QuoteListItem } from '@/types/quote';

import {
  QuoteCard,
  QuoteCardSkeleton,
  QuoteEditModal,
  QuoteStatsGrid,
  QuoteStatsSkeleton,
  QuoteStatusTabs,
  useQuoteList,
  useWorkerQuoteStats,
} from '../index';

export default function WorkerQuotesListPage() {
  const [editingQuote, setEditingQuote] = useState<QuoteListItem | null>(null);
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
  } = useQuoteList();

  const { data: stats, isLoading: statsLoading } = useWorkerQuoteStats();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Quotes</h1>
          <p className="text-sm text-muted-foreground">Track quotes you've sent to customers.</p>
        </div>
      </div>
      {statsLoading ? <QuoteStatsSkeleton /> : stats ? <QuoteStatsGrid stats={stats} /> : null}

      <QuoteStatusTabs
        value={status}
        onValueChange={v => updateParams({ status: v })}
        counts={stats?.counts}
        className="mb-4"
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-55 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by booking, customer, service…"
            className="pl-9"
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
            <>
              {hasActiveFilters && (
                <Button variant="red" size="sm" onClick={clearFilters} className="mt-4">
                  Clear filters
                </Button>
              )}
            </>
          }
        />
      ) : (
        <div className="space-y-3">
          {quotes.map((q, i) => (
            <QuoteCard
              key={q.id}
              quote={q}
              delay={i * 0.03}
              role={ROLE.WORKER}
              onUpdate={(quote: QuoteListItem) => setEditingQuote(quote)}
            />
          ))}
        </div>
      )}
      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && <QuoteCardSkeleton />}

      {editingQuote && (
        <QuoteEditModal
          open={!!editingQuote}
          onClose={() => setEditingQuote(null)}
          quote={editingQuote}
          serviceId={editingQuote.serviceId}
        />
      )}
    </div>
  );
}
