"use client";

import * as React from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

export interface ManagementColumn<T> {
  id: string;
  label: string;
  accessor: (row: T) => string | number;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Search...",
  toolbar,
  pageSize = 6,
}: {
  data: T[];
  columns: ManagementColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  pageSize?: number;
}) {
  const [search, setSearch] = React.useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const filteredData = React.useMemo(
    () => normalizedSearch
      ? data.filter((row) => columns.some((column) => String(column.accessor(row)).toLowerCase().includes(normalizedSearch)))
      : data,
    [columns, data, normalizedSearch],
  );

  const tableColumns = React.useMemo(() => columns.map((definition) => ({
    id: definition.id,
    accessorFn: definition.accessor,
    sortFn: "alphanumeric" as const,
    header: ({ column }: { column: { toggleSorting: (descending?: boolean) => void; getIsSorted: () => false | "asc" | "desc" } }) => (
      definition.sortable === false ? definition.label : (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 px-2 text-xs text-text-secondary"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {definition.label}<ArrowUpDown className="size-3" />
        </Button>
      )
    ),
    cell: ({ row }: { row: { original: T } }) => definition.cell
      ? definition.cell(row.original)
      : String(definition.accessor(row.original)),
  })), [columns]);

  const table = useTable({
    features,
    data: filteredData,
    columns: tableColumns,
    getRowId,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  return (
    <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 bg-background pl-9" placeholder={searchPlaceholder} />
        </div>
        {toolbar && <div className="flex flex-wrap gap-2">{toolbar}</div>}
      </div>
      <Table className="min-w-[900px]">
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="bg-muted/40 hover:bg-muted/40">
              {group.headers.map((header, index) => (
                <TableHead key={header.id} className={`px-4 text-xs text-text-secondary ${columns[index]?.className ?? ""}`}>
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getAllCells().map((cell, index) => (
                <TableCell key={cell.id} className={`px-4 py-3.5 text-text-secondary ${columns[index]?.className ?? ""}`}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-28 text-center text-text-secondary">No matching records found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-xs text-text-secondary">
          {filteredData.length} {filteredData.length === 1 ? "record" : "records"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            Page {table.state.pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Next page">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
