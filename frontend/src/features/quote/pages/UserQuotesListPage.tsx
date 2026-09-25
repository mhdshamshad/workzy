import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';
import PageHeader from '@/components/molecules/PageHeader';
import SearchInput from '@/components/molecules/SearchInput';
import { ROLE } from '@/constants';
import PageError from '@/pages/PageError';
import type { QuoteListItem } from '@/types/quote';

import {
  QuoteApproveModal,
  QuoteRejectModal,
  QuoteCard,
  QuoteCardSkeleton,
  QuoteStatusTabs,
  useAcceptQuote,
  useRejectQuote,
  useQuoteList,
} from '../index';

export default function UserQuotesListPage() {
  const [approveQuote, setApproveQuote] = useState<null | QuoteListItem>(null);
  const [rejectQuote, setRejectQuote] = useState<null | QuoteListItem>(null);

  const {
    quotes,
    search,
    status,
    isLoading,
    refetch,
    error,
    isFetchingNextPage,
    hasActiveFilters,
    clearFilters,
    handleSearchChange,
    sentinelRef,
    updateParams,
  } = useQuoteList();

  const { mutateAsync: acceptQuote, isPending: isAcceptingQuote } = useAcceptQuote();
  const { mutateAsync: confirmReject, isPending: isRejectingQuote } = useRejectQuote();

  const handleRejectQuote = async () => {
    if (!rejectQuote?.id) {
      return;
    }
    const { message } = await confirmReject(rejectQuote.id);
    if (message) {
      toast.success(message);
    }
    setRejectQuote(null);
  };

  const handleAcceptQuote = async () => {
    if (!approveQuote?.id) {
      return;
    }
    await acceptQuote(approveQuote.id);
    setApproveQuote(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6">
        <PageHeader
          title="My Quotes"
          description="Review and manage quotes received from service providers."
        />
      </div>
      <QuoteStatusTabs
        value={status}
        onValueChange={v => updateParams({ status: v })}
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
              role={ROLE.USER}
              onAccept={q => setApproveQuote(q)}
              onReject={q => setRejectQuote(q)}
            />
          ))}
        </div>
      )}
      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && <QuoteCardSkeleton />}

      {approveQuote && (
        <QuoteApproveModal
          open={!!approveQuote}
          onClose={() => setApproveQuote(null)}
          isSubmitting={isAcceptingQuote}
          quote={approveQuote}
          onSubmit={handleAcceptQuote}
        />
      )}

      {rejectQuote && (
        <QuoteRejectModal
          open={!!rejectQuote}
          onClose={() => setRejectQuote(null)}
          isSubmitting={isRejectingQuote}
          quote={rejectQuote}
          onSubmit={handleRejectQuote}
        />
      )}
    </div>
  );
}
