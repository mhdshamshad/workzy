import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';

import type { PaginationAdapter } from '@/types/table.types';

import Button from '../atoms/Button';

interface Props {
  table: PaginationAdapter;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTablePagination({ table, onPageChange, onPageSizeChange }: Props) {
  const [pageSizeLocal, setPageSizeLocal] = useState(table.getState().pagination.pageSize);
  const { pageIndex, pageSize } = table.getState().pagination;

  useEffect(() => {
    setPageSizeLocal(pageSize);
  }, [pageSize]);

  const handlePageSizeChange = (v: number) => {
    table.setPageSize(v);
    onPageSizeChange?.(v);
  };

  const totalFilteredRows = table.options.meta?.total ?? 0;
  const startIndex = totalFilteredRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endIndex = Math.min((pageIndex + 1) * pageSize, totalFilteredRows);

  return (
    <div className="flex items-center justify-between px-2 py-4 ">
      <div className="text-md text-muted-foreground">
        Showing <b>{startIndex}</b>
        {' to '}
        <b>{endIndex}</b>
        {' of '}
        <b>{totalFilteredRows}</b>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm">Rows:</span>
          <select
            className="input"
            aria-label="Rows per page"
            value={pageSizeLocal}
            onChange={e => handlePageSizeChange?.(Number(e.target.value))}
          >
            {[5, 10, 20].map(s => (
              <option key={s} value={s} className="bg-card border">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden @lg:inline-flex"
            aria-label="First page"
            onClick={() => {
              onPageChange?.(0);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            aria-label="Previous page"
            onClick={() => {
              onPageChange?.(pageIndex - 1);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <div className="px-3 text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <Button
            variant="outline"
            aria-label="Next page"
            onClick={() => {
              onPageChange?.(pageIndex + 1);
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden @lg:inline-flex"
            aria-label="Last page"
            onClick={() => {
              onPageChange?.(table.getPageCount() - 1);
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
