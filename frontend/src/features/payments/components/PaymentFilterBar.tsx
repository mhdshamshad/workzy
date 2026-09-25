import dayjs from 'dayjs';
import { CreditCard, Filter, X } from 'lucide-react';

import Button from '@/components/atoms/Button';
import { DatePicker } from '@/components/atoms/Datepicker';
import Select from '@/components/atoms/Select';
import SearchInput from '@/components/molecules/SearchInput';
import { BILL_TYPE, PAYMENT_STATUS } from '@/constants/payment';
import { cn } from '@/lib/utils';

export interface PaymentFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  billType?: string;
  onBillTypeChange?: (value: string) => void;
  fromDate?: Date | null;
  onFromDateChange?: (date: Date | undefined) => void;
  toDate?: Date | null;
  onToDateChange?: (date: Date | undefined) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  disabled?: boolean;
}

const toOptions = (enumObj: Record<string, string>, allLabel: string) => [
  { label: allLabel, value: 'all' },
  ...Object.values(enumObj).map(val => ({
    label: val.charAt(0).toUpperCase() + val.slice(1).replaceAll('_', ' '),
    value: val,
  })),
];

const STATUS_OPTIONS = toOptions(PAYMENT_STATUS, 'All Statuses');
const BILL_TYPE_OPTIONS = toOptions(BILL_TYPE, 'All Types');

const isFutureDate = (date: Date) => dayjs(date).isAfter(dayjs(), 'day');

export function PaymentFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  billType,
  onBillTypeChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  hasActiveFilters,
  onClearFilters,
  disabled = false,
}: PaymentFilterBarProps) {
  const showBillType = billType !== undefined && onBillTypeChange !== undefined;
  const showDates = onFromDateChange !== undefined && onToDateChange !== undefined;

  const isToDateDisabled = (date: Date) =>
    (fromDate ? dayjs(date).isBefore(fromDate, 'day') : false) || isFutureDate(date);

  const searchField = (
    <SearchInput
      disabled={disabled}
      placeholder="Search by transaction ID or name..."
      value={search}
      onChange={onSearchChange}
    />
  );

  const statusSelect = (
    <Select
      disabled={disabled}
      value={status}
      onChange={onStatusChange}
      leftIcon={<Filter className="w-4 h-4 text-primary" />}
      options={STATUS_OPTIONS}
    />
  );

  const billTypeSelect = (
    <Select
      disabled={disabled}
      value={billType}
      onChange={onBillTypeChange}
      leftIcon={<CreditCard className="w-4 h-4 text-primary" />}
      options={BILL_TYPE_OPTIONS}
    />
  );

  const fromDatePicker = showDates ? (
    <DatePicker
      value={fromDate ?? undefined}
      onChange={onFromDateChange}
      placeholder="From Date"
      disabled={isFutureDate}
    />
  ) : null;

  const toDatePicker = showDates ? (
    <DatePicker
      value={toDate ?? undefined}
      onChange={onToDateChange}
      placeholder="To Date"
      disabled={isToDateDisabled}
    />
  ) : null;

  const renderClearButton = (className: string) => (
    <Button
      onClick={onClearFilters}
      size="md"
      iconLeft={<X className="h-4 w-4" />}
      variant="red"
      className={className}
    >
      Clear
    </Button>
  );

  if (showBillType) {
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
          {searchField}
        </div>
        {hasActiveFilters && (
          <div className="col-span-4 order-2 md:col-span-1 flex items-start md:order-last">
            {renderClearButton('w-full md:w-auto mt-[1px]')}
          </div>
        )}
        <div className="col-span-6 sm:col-span-4 md:col-span-1 md:order-0 order-3">
          {statusSelect}
        </div>
        <div className="col-span-6 sm:col-span-4 md:col-span-1 md:order-0 order-4">
          {billTypeSelect}
        </div>
        {showDates && (
          <>
            <div className="col-span-6 sm:col-span-4 md:col-span-1 md:order-0 order-5">
              {fromDatePicker}
            </div>
            <div className="col-span-6 sm:col-span-4 md:col-span-1 md:order-0 order-6">
              {toDatePicker}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-3 mt-6 items-start',
        hasActiveFilters
          ? 'lg:grid-cols-[1fr_180px_160px_160px_auto]'
          : 'lg:grid-cols-[1fr_180px_160px_160px]'
      )}
    >
      <div className="col-span-12 lg:col-span-1 order-1 lg:order-0">
        <div className="flex items-center gap-3">
          <div className="flex-1">{searchField}</div>
          {hasActiveFilters && (
            <div className="hidden sm:block lg:hidden shrink-0">
              {renderClearButton('mt-[1px]')}
            </div>
          )}
        </div>
      </div>

      <div className="col-span-6 sm:col-span-4 lg:col-span-1 order-2 lg:order-0">
        {statusSelect}
      </div>
      {showDates && (
        <div className="col-span-6 sm:col-span-4 lg:col-span-1 order-3 lg:order-0">
          {fromDatePicker}
        </div>
      )}
      {showDates && (
        <div className="col-span-6 sm:col-span-4 lg:col-span-1 order-4 lg:order-0">
          {toDatePicker}
        </div>
      )}
      {hasActiveFilters && (
        <>
          <div className="col-span-6 sm:hidden order-5 flex items-start">
            {renderClearButton('w-full mt-px')}
          </div>
          <div className="hidden lg:flex lg:col-span-1 lg:order-last items-start">
            {renderClearButton('mt-px')}
          </div>
        </>
      )}
    </div>
  );
}
