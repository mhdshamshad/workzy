import dayjs from 'dayjs';
import { useCallback } from 'react';

import { DATE_FILTER_PARAMS } from '@/constants/dateFilterParams';
import type { BillType, PaymentStatus } from '@/constants/payment';
import { useUrlFilterParams } from '@/hooks/useUrlFilterParams';
import { formatDateForUrl } from '@/utils/time.format';

const CUSTOM_PARAMS = [{ key: 'billType', defaultValue: 'all' }, ...DATE_FILTER_PARAMS];

export function usePaymentFilterParams() {
  const { search, status, billType, updateParams, fromDate, toDate } = useUrlFilterParams<{
    billType: string;
    fromDate: Date | null;
    toDate: Date | null;
  }>(CUSTOM_PARAMS);

  const handleSearchChange = useCallback(
    (v: string) => updateParams({ search: v }),
    [updateParams]
  );

  const handleStatusChange = useCallback(
    (v: string) => updateParams({ status: v }),
    [updateParams]
  );

  const handleBillTypeChange = useCallback(
    (v: string) => updateParams({ billType: v }),
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
      billType: 'all',
      fromDate: null,
      toDate: null,
    });
  }, [updateParams]);

  const hasActiveFilters = !!(
    fromDate ||
    toDate ||
    (status && status !== 'all') ||
    (billType && billType !== 'all') ||
    search
  );

  const fromDateString = fromDate ? dayjs(fromDate).startOf('day').format('YYYY-MM-DD') : undefined;
  const toDateString = toDate ? dayjs(toDate).endOf('day').format('YYYY-MM-DD') : undefined;

  return {
    search,
    status: status as PaymentStatus | 'all',
    billType: billType as BillType | 'all',
    fromDate,
    toDate,
    fromDateString,
    toDateString,
    hasActiveFilters,
    handleSearchChange,
    handleStatusChange,
    handleBillTypeChange,
    handleFromDateChange,
    handleToDateChange,
    clearAllFilters,
    updateParams,
  };
}
