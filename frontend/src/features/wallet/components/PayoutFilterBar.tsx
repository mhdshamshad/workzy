import dayjs from 'dayjs';
import { Filter, X } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { DatePicker } from '@/components/atoms/Datepicker';
import Select from '@/components/atoms/Select';
import SearchInput from '@/components/molecules/SearchInput';
import { PAYOUT_REQUEST_STATUS } from '@/constants/payout';
import { cn } from '@/lib/utils';
import { enumToOptions } from '@/utils/selectOptions';

interface PayoutFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  fromDate: Date | null;
  onFromDateChange: (date: Date | undefined) => void;
  toDate: Date | null;
  onToDateChange: (date: Date | undefined) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  disabled?: boolean;
}

const isFutureDate = (date: Date) => dayjs(date).isAfter(dayjs(), 'day');

export function PayoutFilterBar({
  search,
  onSearchChange,
  onStatusChange,
  status,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  hasActiveFilters,
  onClearFilters,
  disabled = false,
}: PayoutFilterBarProps) {
  const isToDateDisabled = (date: Date) =>
    (fromDate ? dayjs(date).isBefore(fromDate, 'day') : false) || isFutureDate(date);

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-3 mt-6 items-start',
        hasActiveFilters
          ? 'md:grid-cols-[1fr_180px_180px_160px_160px_auto]'
          : 'md:grid-cols-[1fr_180px_180px_160px_160px]'
      )}
    >
      <div
        className={cn(
          'col-span-12 md:col-span-1 md:order-0',
          hasActiveFilters ? 'col-span-8 order-1' : 'order-1'
        )}
      >
        <SearchInput
          disabled={disabled}
          placeholder="Search by referenceId"
          value={search}
          onChange={onSearchChange}
        />
      </div>
      {hasActiveFilters && (
        <div className="col-span-4 order-2 md:col-span-1 flex items-start md:order-last">
          <Button
            onClick={onClearFilters}
            size="md"
            iconLeft={<X className="h-4 w-4" />}
            variant="red"
            className="w-full md:w-auto mt-px"
          >
            Clear
          </Button>
        </div>
      )}
      <div className="col-span-6 sm:col-span-4 md:col-span-1 md:order-0 order-3">
        <Select
          disabled={disabled}
          value={status}
          onChange={onStatusChange}
          leftIcon={<Filter className="w-4 h-4 text-primary" />}
          options={enumToOptions(PAYOUT_REQUEST_STATUS, 'All Statuses')}
        />
      </div>
      <div className="col-span-6 sm:col-span-4 md:col-span-1 md:order-0 order-5">
        <DatePicker
          value={fromDate ?? undefined}
          onChange={onFromDateChange}
          placeholder="From Date"
          disabled={isFutureDate}
        />
      </div>
      <div className="col-span-6 sm:col-span-4 md:col-span-1 md:order-0 order-6">
        <DatePicker
          value={toDate ?? undefined}
          onChange={onToDateChange}
          placeholder="To Date"
          disabled={isToDateDisabled}
        />
      </div>
    </div>
  );
}
