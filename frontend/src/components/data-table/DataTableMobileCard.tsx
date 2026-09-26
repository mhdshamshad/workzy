import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import type { RowWithAnyId, TableColumnDef } from '@/types/table.types';

interface Props<TData extends RowWithAnyId> {
  item: TData;
  columns: TableColumnDef<TData>[];
}

export default function DataTableMobileCard<TData extends RowWithAnyId>({
  item,
  columns,
}: Props<TData>) {
  const [open, setOpen] = useState(false);
  const baseColumns = columns.filter(
    col => col.mobileOrder !== undefined || col.showInMobileHeader === true
  );
  const statusColumn = baseColumns.find(col => col.id === 'status');

  const columnsWithoutStatus = baseColumns.filter(col => col.id !== 'status');

  const sortedHeaderColumns = [...columnsWithoutStatus]
    .sort((a, b) => {
      const orderA = a.mobileOrder ?? 99;
      const orderB = b.mobileOrder ?? 99;
      return orderA - orderB;
    })
    .filter(col => col.showInMobileHeader === true);

  const detailColumns = baseColumns.filter(col => !col.showInMobileHeader);

  const detailActions = detailColumns.find(col => col.id === 'actions');
  const detailInfo = detailColumns.filter(col => col.id !== detailActions?.id);

  const renderColumnContent = (column: TableColumnDef<TData>) => {
    if (!column.cell) {
      return '-';
    }
    const value =
      'accessorKey' in column && column.accessorKey
        ? item[column.accessorKey as keyof TData]
        : undefined;
    const cellRenderer = column.cell as unknown as (ctx: unknown) => React.ReactNode;

    return cellRenderer({
      row: { original: item },
      getValue: () => value,
    });
  };

  return (
    <div className="bg-card border rounded-lg p-4 my-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {sortedHeaderColumns.map((column, index) => {
            const isComplexContent = index === 0;

            const rowClassName = `flex justify-between items-start text-sm border-b border-border/50 pb-3 last:border-b-0`;

            if (isComplexContent) {
              return (
                <div key={column.id} className={rowClassName}>
                  {column.mobileLabel && (
                    <div className="text-xs text-muted-foreground uppercase font-bold w-28 shrink-0 pt-0.5">
                      {column.mobileLabel}:
                    </div>
                  )}
                  <div className="flex-1 ml-2">{renderColumnContent(column)}</div>
                </div>
              );
            }
            return (
              <div key={column.id} className={rowClassName}>
                {column.mobileLabel && (
                  <div className="text-xs text-muted-foreground uppercase font-bold w-28 shrink-0">
                    {column.mobileLabel}:
                  </div>
                )}
                <div className="text-foreground text-right flex-1 ml-2">
                  {renderColumnContent(column)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {statusColumn && <div className="mb-2">{renderColumnContent(statusColumn)}</div>}

          {detailColumns.length > 0 && (
            <button
              className="p-1 hover:bg-secondary rounded-md transition-colors mt-1"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? 'collapse' : 'expand'}
            >
              {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {open && detailColumns.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {detailInfo.map(column => {
            const content = renderColumnContent(column);
            return (
              <div
                key={column.id || 'detail'}
                className="text-sm border-b border-border/50 pb-3 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between items-center">
                  {column.mobileLabel && (
                    <div className="text-sm text-muted-foreground font-medium">
                      {column.mobileLabel}:
                    </div>
                  )}
                  <div className="text-foreground text-right">{content || '-'}</div>
                </div>
              </div>
            );
          })}

          {detailActions && detailInfo.length > 0 && (
            <div className="border-t border-border/50 my-2"></div>
          )}

          {detailActions && (
            <div key={detailActions.id} className="flex justify-end pt-2">
              {renderColumnContent(detailActions)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
