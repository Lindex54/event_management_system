"use client";

import * as React from "react";
import {
  ArrowUpDown,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  Send,
  Users,
} from "lucide-react";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { InvitePeopleDialog } from "@/components/admin/invite-people-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminEvents } from "@/data/admin-dashboard";
import type { AdminEvent } from "@/types/admin";

const statusStyles = {
  Draft: "border-border bg-muted text-text-secondary",
  Upcoming: "border-primary/20 bg-primary/10 text-primary",
  Active: "border-success/20 bg-success/10 text-success",
  Completed: "border-border bg-muted text-text-secondary",
  Cancelled: "border-danger/20 bg-danger/10 text-danger",
};

const features = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

const columnHelper = createColumnHelper<typeof features, AdminEvent>();

async function copyRegistrationLink(event: AdminEvent) {
  try {
    await navigator.clipboard.writeText(event.registrationUrl);
    toast.success("Registration link copied", { description: event.name });
  } catch {
    toast.error("Could not copy the registration link");
  }
}

export function UpcomingEventsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [filter, setFilter] = React.useState("");
  const [inviteEventId, setInviteEventId] = React.useState<string>();

  const columns = React.useMemo(() => columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Event",
      cell: ({ row }) => (
        <div className="max-w-60 whitespace-normal">
          <p className="font-semibold text-text-primary">{row.original.name}</p>
          <p className="mt-0.5 text-xs text-text-secondary">{row.original.id}</p>
        </div>
      ),
    }),
    columnHelper.accessor("organizer", { header: "Organizer" }),
    columnHelper.accessor("date", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date <ArrowUpDown className="size-3.5" />
        </Button>
      ),
      cell: ({ row }) => row.original.dateLabel,
      sortFn: "alphanumeric",
    }),
    columnHelper.accessor("venue", { header: "Venue" }),
    columnHelper.accessor("registrations", {
      header: "Registrations",
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.registrations.toLocaleString()}
          <span className="font-normal text-text-secondary"> / {row.original.capacity.toLocaleString()}</span>
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => <Badge variant="outline" className={statusStyles[row.original.status]}>{row.original.status}</Badge>,
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem><Eye /> View event</DropdownMenuItem>
              <DropdownMenuItem><Pencil /> Edit event</DropdownMenuItem>
              <DropdownMenuItem><Users /> View registrations</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => void copyRegistrationLink(row.original)}>
                <Copy /> Copy registration link
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setInviteEventId(row.original.id)}>
                <Send /> Invite people
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ]), []);

  const table = useTable({
    features,
    data: adminEvents,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    globalFilterFn: "includesString",
  });

  return (
    <>
      <Card id="events" className="min-w-0 gap-0 py-0 shadow-none">
        <CardHeader className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Upcoming events</CardTitle>
            <CardDescription className="mt-1">Monitor events and manage registration links.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" />
            <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search events..." className="h-9 bg-background pl-9" />
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table className="min-w-[980px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="px-4 text-xs text-text-secondary">
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3.5 text-text-secondary">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <InvitePeopleDialog
        key={inviteEventId}
        open={Boolean(inviteEventId)}
        onOpenChange={(open) => { if (!open) setInviteEventId(undefined); }}
        eventId={inviteEventId}
      />
    </>
  );
}
