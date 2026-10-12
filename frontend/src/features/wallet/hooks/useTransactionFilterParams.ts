import dayjs from 'dayjs';
import { useCallback } from 'react';

import { DATE_FILTER_PARAMS } from '@/constants/dateFilterParams';
import type { WalletTransactionCategory, WalletTransactionType } from '@/constants/payout';
import { useUrlFilterParams } from '@/hooks/useUrlFilterParams';
import { formatDateForUrl } from '@/utils/time.format';

const CUSTOM_PARAMS = [
  { key: 'type', defaultValue: 'all' },
  { key: 'category', defaultValue: 'all' },
  ...DATE_FILTER_PARAMS,
];

export function useTransactionFilterParams() {
  const { search, type, category, updateParams, fromDate, toDate } = useUrlFilterParams<{
    type: string;
    category: string;
    fromDate: Date | null;
    toDate: Date | null;
  }>(CUSTOM_PARAMS);

  const handleSearchChange = useCallback(
    (v: string) => updateParams({ search: v }),
    [updateParams]
  );

  const handleCategoryChange = useCallback(
    (v: string) => updateParams({ category: v }),
    [updateParams]
  );

  const handleBillTypeChange = useCallback(
    (v: string) => updateParams({ type: v }),
    [updateParams]
  );

  const handleFromDateChange = useCallback(
    (date: Date | undefined) => updateParams({ fromDate: formatDateForUrl(date) }),
    [updateParams]
  );

  const handleToDateChange = useCallback(
    (date: Date | undefined) => updateParams({ toDate: formatDateForUrl(date) }),
    [updateParams]
  );

  const clearAllFilters = useCallback(() => {
    updateParams({
      search: '',
      type: 'all',
      category: 'all',
      fromDate: null,
      toDate: null,
    });
  }, [updateParams]);

  const hasActiveFilters = !!(
    fromDate ||
    toDate ||
    (category && category !== 'all') ||
    (type && type !== 'all') ||
    search
  );

  const fromDateString = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD') : undefined;
  const toDateString = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD') : undefined;

  return {
    search,
    category: category as WalletTransactionCategory | 'all',
    type: type as WalletTransactionType | 'all',
    fromDate,
    toDate,
    fromDateString,
    toDateString,
    hasActiveFilters,
    handleSearchChange,
    handleCategoryChange,
    handleBillTypeChange,
    handleFromDateChange,
    handleToDateChange,
    clearAllFilters,
    updateParams,
  };
}
