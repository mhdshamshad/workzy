import { Eye } from 'lucide-react';

import Button from '@/components/atoms/Button';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { getStatusBadgeVariant } from '@/features/wallet';
import type { PayoutRequest } from '@/types/payout';
import type { TableColumnDef } from '@/types/table.types';
import { formatCurrency } from '@/utils/currency';
import { formatSmartActivityDateTime } from '@/utils/time.format';

export const payoutColumns = (
  onView: (payout: PayoutRequest) => void,
  options?: { showWorker?: boolean }
): TableColumnDef<PayoutRequest>[] => [
  ...(options?.showWorker
    ? [
        {
          id: 'worker',
          header: 'Worker',
          accessorKey: 'worker',
          cell: ({ row }: { row: { original: PayoutRequest } }) => {
            const w = row.original.worker;
            return (
              <div className="flex items-center gap-2.5 min-w-0 max-w-48">
                <ProfileImage
                  src={w?.profileImage}
                  name={w?.displayName || 'Worker'}
                  shape="circle"
                  size={32}
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className="font-medium text-foreground text-xs truncate"
                    title={w?.displayName || 'Worker'}
                  >
                    {w?.displayName || 'Worker'}
                  </span>
                  {w?.phone && (
                    <span className="text-[11px] text-muted-foreground truncate">{w.phone}</span>
                  )}
                </div>
              </div>
            );
          },
          showInMobileHeader: true,
          mobileOrder: 1,
          mobileLabel: 'Worker',
          minWidth: 160,
        },
      ]
    : []),
  {
    id: 'createdAt',
    header: 'Requested Date',
    accessorKey: 'createdAt',
    cell: ({ row }) => (
      <span className="font-medium text-foreground text-xs truncate">
        {formatSmartActivityDateTime(row.original.createdAt)}
      </span>
    ),
    showInMobileHeader: true,
    mobileOrder: 2,
    mobileLabel: 'Requested',
    minWidth: 120,
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) => (
      <span className="font-bold text-xs text-foreground tabular-nums">
        {formatCurrency(row.original.amount)}
      </span>
    ),
    showInMobileHeader: true,
    mobileOrder: 3,
    mobileLabel: 'Amount',
    minWidth: 100,
  },
  {
    id: 'method',
    header: 'Payout Method',
    accessorKey: 'method',
    cell: ({ row }) => (
      <span className="font-bold text-xs text-foreground tabular-nums uppercase">
        {row.original.method}
      </span>
    ),
    showInMobileHeader: true,
    mobileOrder: 4,
    mobileLabel: 'Method',
    minWidth: 180,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>{row.original.status}</Badge>
    ),
    showInMobileHeader: true,
    mobileOrder: 5,
    mobileLabel: 'Status',
    minWidth: 100,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button size="sm" variant="blue" onClick={() => onView(row.original)}>
          <Eye size={17} />
        </Button>
      </div>
    ),
    showInMobileHeader: true,
    mobileOrder: 6,
    width: 100,
    minWidth: 100,
  },
];
