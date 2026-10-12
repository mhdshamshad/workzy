import dayjs from 'dayjs';

export const DATE_FILTER_PARAMS = [
  {
    key: 'fromDate',
    parser: (v: string) => (v ? dayjs(v).toDate() : null),
  },
  {
    key: 'toDate',
    parser: (v: string) => (v ? dayjs(v).toDate() : null),
  },
] as const;
