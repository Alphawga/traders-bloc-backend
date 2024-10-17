"use client";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as React from "react";
import clsx from "clsx";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  action?: React.ReactNode;
  onRowClick?: (data: TData) => void;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  nextPage?: () => Promise<void> | undefined;
  filterInputPlaceholder?: string;
  filterColumnId?: string;
  itemCypressTag?: string;
  rowCount?: number;
  onSelectionChange?: (selectedRows: TData[]) => void;
  theme?: string;
  updateData?: (rowIndex: number, columnId: string, value: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  nextPage,
  action,
  theme,
  onRowClick,
  filterInputPlaceholder,
  filterColumnId,
  itemCypressTag,
  onSelectionChange,
  isLoading = false,
  withToolbar = true,
}: DataTableProps<TData, TValue> & {
  isLoading?: boolean;
  withToolbar?: boolean;
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    state: { columnFilters, rowSelection },
    onRowSelectionChange: setRowSelection,
   
  });

  React.useEffect(() => {
    const selectedRowsData = table.getSelectedRowModel().flatRows.map((row) => row.original);

    // setSelectedRows(selectedRowsData);
    onSelectionChange?.(selectedRowsData);
  }, [table, rowSelection, onSelectionChange]);

  return (
    <div className='space-y-4'>
      {withToolbar && (
        <DataTableToolbar
          filterColumnId={filterColumnId}
          placeholder={filterInputPlaceholder}
          table={table}
          action={action}
        />
      )}

      <div className=' w-full overflow-y-auto rounded-md border'>
        <Table>
          <TableHeader className={theme}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className='h-11 py-0 text-sm tracking-tight text-black' key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='bg-white'>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-cy={itemCypressTag}
                  className={clsx(onRowClick && "cursor-pointer")}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    e.preventDefault();
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className='py-2.5 text-sm tracking-tight' key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} loadMore={nextPage} />
    </div>
  );
}
