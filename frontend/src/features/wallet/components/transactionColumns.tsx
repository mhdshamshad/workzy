import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import type { TableColumnDef } from '@/types/table.types';
import type { WalletTransaction } from '@/types/wallet';
import { formatCurrency } from '@/utils/currency';
import { formatSmartActivityDateTime } from '@/utils/time.format';

export const transactionColumns: TableColumnDef<WalletTransaction>[] = [
  {
    id: 'transactionId',
    header: 'Transaction ID',
    accessorKey: 'transactionId',
    cell: ({ row }) => {
      const tx = row.original;
      return (
        <span
          className="font-mono font-semibold text-foreground truncate block max-w-full text-xs"
          title={tx.transactionId}
        >
          {tx.transactionId}
        </span>
      );
    },
    showInMobileHeader: true,
    mobileOrder: 1,
    mobileLabel: 'Tx ID',
    minWidth: 150,
  },
  {
    id: 'description',
    header: 'Description',
    accessorKey: 'description',
    cell: ({ row }) => {
      const tx = row.original;
      const isCredit = tx.type === 'credit';

      return (
        <div className="flex items-center gap-2 min-w-0 w-full">
          <span
            className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg ${
              isCredit
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50'
            }`}
          >
            {isCredit ? (
              <ArrowDownLeft className="h-3.5 w-3.5" />
            ) : (
              <ArrowUpRight className="h-3.5 w-3.5" />
            )}
          </span>
          <span
            className="font-medium text-foreground text-xs truncate min-w-0 flex-1 text-left"
            title={tx.description}
          >
            {tx.description}
          </span>
        </div>
      );
    },
    showInMobileHeader: true,
    mobileOrder: 2,
    mobileLabel: 'Description',
    minWidth: 170,
  },
  {
    id: 'category',
    header: 'Category',
    accessorKey: 'category',
    cell: ({ row }) => {
      const category = row.original.category;
      const colorMap: Record<string, string> = {
        earning:
          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
        payout:
          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
        adjustment:
          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
        refund:
          'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      };
      const cls = colorMap[category] || 'bg-muted text-muted-foreground border-border';

      return (
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${cls}`}
        >
          {category}
        </span>
      );
    },
    mobileOrder: 3,
    mobileLabel: 'Category',
    minWidth: 100,
  },
  {
    id: 'type',
    header: 'Direction',
    accessorKey: 'type',
    cell: ({ row }) => {
      const isCredit = row.original.type === 'credit';
      return (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider ${
            isCredit
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {isCredit ? 'Credit' : 'Debit'}
        </span>
      );
    },
    mobileOrder: 4,
    mobileLabel: 'Direction',
    minWidth: 90,
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) => {
      const tx = row.original;
      const isCredit = tx.type === 'credit';
      return (
        <div className="text-right font-semibold text-xs tabular-nums">
          <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}>
            {isCredit ? '+' : '-'}
            {formatCurrency(tx.amount)}
          </span>
        </div>
      );
    },
    showInMobileHeader: true,
    mobileOrder: 5,
    mobileLabel: 'Amount',
    minWidth: 110,
  },
  {
    id: 'date',
    header: 'Date & Time',
    accessorKey: 'createdAt',
    cell: ({ row }) => (
      <span className="font-medium text-foreground text-xs">
        {formatSmartActivityDateTime(row.original.createdAt)}
      </span>
    ),
    mobileOrder: 6,
    mobileLabel: 'Date',
    minWidth: 125,
  },
];
