import dayjs from 'dayjs';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { ROLE, type Role } from '@/constants';
import {
  BILL_TYPE,
  PAYMENT_BILL_TYPE_CONFIG,
  PAYMENT_STATUS_CONFIG,
  type BadgeVariant,
} from '@/constants/payment';
import type { Payment, PaymentAdmin, PaymentUser, PaymentWorker } from '@/types/payment';
import type { TableColumnDef } from '@/types/table.types';
import { formatCurrency } from '@/utils/currency';

export interface PaymentColumnContext {
  workerId?: string;
  userId?: string;
}

const getBookingPath = (refId: string, role: Role): string => {
  switch (role) {
    case ROLE.ADMIN:
      return `/admin/bookings/${refId}`;
    case ROLE.WORKER:
      return `/worker/bookings/${refId}`;
    case ROLE.USER:
    default:
      return `/bookings/${refId}`;
  }
};

const getUserData = (payment: Payment): { name: string; link?: string } | null => {
  if ('user' in payment && payment.user && typeof payment.user === 'object') {
    const adminPayment = payment as unknown as PaymentAdmin;
    return {
      name: adminPayment.user.name,
      link: `/admin/users/${adminPayment.user.id}`,
    };
  }
  if ('userName' in payment && typeof (payment as unknown as PaymentWorker).userName === 'string') {
    return { name: (payment as unknown as PaymentWorker).userName };
  }
  return null;
};

const getWorkerData = (payment: Payment): { name: string; link?: string } | null => {
  if ('worker' in payment && payment.worker && typeof payment.worker === 'object') {
    const adminPayment = payment as unknown as PaymentAdmin;
    return {
      name: adminPayment.worker.name,
      link: `/admin/workers/${adminPayment.worker.id}`,
    };
  }
  if (
    'workerName' in payment &&
    typeof (payment as unknown as PaymentUser).workerName === 'string' &&
    'workerId' in payment
  ) {
    const userPayment = payment as unknown as PaymentUser;
    return {
      name: userPayment.workerName,
      link: `/workers/${userPayment.workerId}`,
    };
  }
  return null;
};

export function getPaymentColumns(
  role: typeof ROLE.ADMIN,
  context?: PaymentColumnContext
): TableColumnDef<PaymentAdmin>[];
export function getPaymentColumns(
  role: typeof ROLE.USER,
  context?: PaymentColumnContext
): TableColumnDef<PaymentUser>[];
export function getPaymentColumns(
  role: typeof ROLE.WORKER,
  context?: PaymentColumnContext
): TableColumnDef<PaymentWorker>[];
export function getPaymentColumns<T extends Payment>(
  role: Role,
  context?: PaymentColumnContext
): TableColumnDef<T>[] {
  const columns: TableColumnDef<T>[] = [
    {
      id: 'transactionId',
      header: 'Transaction',
      accessorKey: 'transactionId',
      cell: ({ row }) => {
        const payment = row.original;
        const bookingPath = getBookingPath(payment.refId, role);
        const isBooking = payment.billType === BILL_TYPE.BOOKING;

        return (
          <div className="flex flex-col gap-0.5">
            {isBooking ? (
              <Link
                to={bookingPath}
                className="font-mono text-xs font-semibold text-primary hover:underline underline-offset-2 truncate max-w-40"
                title={payment.refId}
              >
                {payment.transactionId}
              </Link>
            ) : (
              <span className="font-mono text-xs font-semibold text-muted-foreground truncate max-w-40">
                {payment.transactionId}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {dayjs(payment.createdAt).format('MMM D, YYYY · h:mm A')}
            </span>
          </div>
        );
      },
      showInMobileHeader: true,
      mobileOrder: 1,
      mobileLabel: 'Transaction',
      minWidth: 160,
    },
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground whitespace-normal wrap-break-word">
              {payment.title}
            </span>
            {role === ROLE.USER && (
              <span className="text-xs text-muted-foreground">
                {payment.billType.toUpperCase()}
              </span>
            )}
          </div>
        );
      },
      showInMobileHeader: true,
      mobileOrder: 2,
      mobileLabel: 'Title',
      minWidth: 120,
    },
    {
      id: 'user',
      header: 'User',
      accessorKey: 'user',
      cell: ({ row }) => {
        const userData = getUserData(row.original);
        if (!userData) {
          return null;
        }
        return userData.link ? (
          <Link
            to={userData.link}
            className="text-foreground font-medium hover:text-primary hover:underline underline-offset-2 transition-colors text-sm"
          >
            {userData.name}
          </Link>
        ) : (
          <span className="text-foreground font-medium text-sm">{userData.name}</span>
        );
      },
      showInMobileHeader: false,
      mobileOrder: 5,
      mobileLabel: 'User',
      minWidth: 120,
    },
    {
      id: 'worker',
      header: 'Worker',
      accessorKey: 'worker',
      cell: ({ row }) => {
        const workerData = getWorkerData(row.original);
        if (!workerData) {
          return null;
        }
        return workerData.link ? (
          <Link
            to={workerData.link}
            className="text-foreground font-medium hover:text-primary hover:underline underline-offset-2 transition-colors text-sm"
          >
            {workerData.name}
          </Link>
        ) : (
          <span className="text-foreground font-medium text-sm">{workerData.name}</span>
        );
      },
      showInMobileHeader: false,
      mobileOrder: 6,
      mobileLabel: 'Worker',
      minWidth: 120,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => {
        const payment = row.original;
        const platformFee =
          'platformFee' in payment ? (payment as unknown as PaymentAdmin).platformFee : null;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground">{formatCurrency(payment.amount)}</span>
            {platformFee !== null && platformFee !== undefined && (
              <span className="text-[11px] text-muted-foreground">
                Fee: {formatCurrency(platformFee)}
              </span>
            )}
          </div>
        );
      },
      showInMobileHeader: true,
      mobileOrder: 3,
      mobileLabel: 'Amount',
      minWidth: 100,
    },
    {
      id: 'billType',
      header: 'Type',
      accessorKey: 'billType',
      cell: ({ row }) => {
        const billCfg = PAYMENT_BILL_TYPE_CONFIG[row.original.billType] ?? {
          label: row.original.billType,
          variant: 'secondary' as BadgeVariant,
        };
        return <Badge variant={billCfg.variant}>{billCfg.label}</Badge>;
      },
      showInMobileHeader: false,
      mobileOrder: 7,
      mobileLabel: 'Type',
      width: 100,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const statusCfg = PAYMENT_STATUS_CONFIG[row.original.status] ?? {
          label: row.original.status,
          variant: 'secondary' as BadgeVariant,
        };
        return <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>;
      },
      showInMobileHeader: true,
      mobileOrder: 4,
      mobileLabel: 'Status',
      width: 100,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const payment = row.original;
        const bookingPath = getBookingPath(payment.refId, role);
        return (
          <div className="flex justify-end">
            {payment.billType === BILL_TYPE.BOOKING && (
              <Link
                to={bookingPath}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted transition-all duration-150 group-hover:opacity-100 opacity-60"
                title="View booking"
              >
                <Eye className="w-4 h-4" />
              </Link>
            )}
          </div>
        );
      },
      showInMobileHeader: false,
      mobileOrder: 8,
      mobileLabel: 'Actions',
      width: 50,
    },
  ];

  return columns.filter(col => {
    if (role === ROLE.USER && (col.id === 'user' || col.id === 'billType')) {
      return false;
    }
    if (role === ROLE.WORKER && col.id === 'worker') {
      return false;
    }
    if (context?.workerId && col.id === 'worker') {
      return false;
    }
    if (context?.userId && col.id === 'user') {
      return false;
    }
    return true;
  });
}
