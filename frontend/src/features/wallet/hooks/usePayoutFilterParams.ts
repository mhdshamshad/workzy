import dayjs from 'dayjs';
import { useCallback } from 'react';

import { DATE_FILTER_PARAMS } from '@/constants/dateFilterParams';
import type { PayoutRequestStatus } from '@/constants/payout';
import { useUrlFilterParams } from '@/hooks/useUrlFilterParams';
import { formatDateForUrl } from '@/utils/time.format';

export function usePayoutFilterParams() {
  const { search, status, updateParams, fromDate, toDate } = useUrlFilterParams<{
    fromDate: Date | null;
    toDate: Date | null;
  }>(DATE_FILTER_PARAMS);

  const handleSearchChange = useCallback(
    (v: string) => updateParams({ search: v }),
    [updateParams]
  );

  const handleStatusChange = useCallback(
    (v: string) => updateParams({ status: v }),
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
      status: 'all',
      fromDate: null,
      toDate: null,
    });
  }, [updateParams]);

  const hasActiveFilters = !!(fromDate || toDate || (status && status !== 'all') || search);

  const fromDateString = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD') : undefined;
  const toDateString = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD') : undefined;

  return {
    search,
    fromDate,
    toDate,
    status: status as PayoutRequestStatus | 'all',
    fromDateString,
    toDateString,
    hasActiveFilters,
    handleSearchChange,
    handleStatusChange,
    handleFromDateChange,
    handleToDateChange,
    clearAllFilters,
    updateParams,
  };
}
