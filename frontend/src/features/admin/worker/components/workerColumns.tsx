import { Eye } from 'lucide-react';

import Button from '@/components/atoms/Button';
import ProfileImage from '@/components/molecules/ProfileImage';
import { Badge } from '@/components/ui/badge';
import { WORKER_STATUS_CONFIG } from '@/constants';
import type { WorkerListItem } from '@/types/admin/worker';
import type { TableColumnDef } from '@/types/table.types';
import { formatDate } from '@/utils/time.format';

const workerColumns = (
  onView: (id: string, email: string) => void
): TableColumnDef<WorkerListItem>[] => [
  {
    id: 'index',
    header: '#',
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return <span className="text-muted-foreground">{pageIndex * pageSize + row.index + 1}</span>;
    },
    hideOnSmall: true,
    width: 20,
    minWidth: 20,
    maxWidth: 30,
  },
  {
    id: 'worker',
    header: 'Worker',
    accessorKey: 'displayName',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ProfileImage src={row.original.profileImage} size={40} name={row.original.displayName} />
        <div>
          <div className="font-medium">{row.original.displayName}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      </div>
    ),
    showInMobileHeader: true,
    mobileOrder: 1,
    mobileLabel: '',
    minWidth: 200,
    maxWidth: 300,
  },
  {
    id: 'phone',
    header: 'Phone',
    accessorKey: 'phone',
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone || '-'}</span>,
    hideOnSmall: true,
    showInMobileHeader: false,
    mobileOrder: 3,
    mobileLabel: 'Phone',
    width: 150,
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const config = WORKER_STATUS_CONFIG[row.original.status!];
      const Icon = config.icon;

      return (
        <Badge variant={config.badgeVariant}>
          <Icon className="size-3" />
          {config.label}
        </Badge>
      );
    },
    showInMobileHeader: true,
    mobileOrder: 2,
    mobileLabel: 'Worker Status',
    width: 120,
  },
  {
    id: 'stripStatus',
    header: 'Stripe Status',
    accessorKey: 'stripStatus',
    cell: ({ row }) => {
      const stripeStatus = row.original.stripeAccountStatus;
      return (
        <Badge
          variant={
            stripeStatus === 'active' ? 'green' : stripeStatus === 'pending' ? 'blue' : 'amber'
          }
        >
          {stripeStatus}
        </Badge>
      );
    },
    showInMobileHeader: false,
    mobileOrder: 4,
    mobileLabel: 'Stripe Status',
    width: 120,
  },
  {
    id: 'joinedDate',
    header: 'Joined',
    accessorKey: 'createdAt',
    cell: ({ row }) => {
      return <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>;
    },
    hideOnSmall: true,
    showInMobileHeader: false,
    mobileOrder: 6,
    mobileLabel: 'Joined Date',
    width: 170,
  },
  {
    id: 'actions',
    header: 'Actions',
    mobileOrder: 99,
    hideOnSmall: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 w-full justify-end">
        <Button
          size="sm"
          variant="outline"
          iconLeft={<Eye className="w-4 h-4" />}
          onClick={() => onView(row.original.id, row.original.email)}
        >
          View
        </Button>
      </div>
    ),
  },
];

export default workerColumns;
