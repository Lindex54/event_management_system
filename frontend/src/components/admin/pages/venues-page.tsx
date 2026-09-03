"use client";

import * as React from "react";
import { Ban, Building2, CalendarDays, Eye, MapPin, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { FormDialog } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { venueRecords as initialRecords } from "@/data/admin-management";
import type { VenueRecord } from "@/types/admin";

const venueFields = [
  { name: "name", label: "Venue name", required: true }, { name: "location", label: "Address / Location", required: true },
  { name: "capacity", label: "Capacity", type: "number" as const, required: true }, { name: "status", label: "Status", type: "select" as const, options: ["Available", "Active", "Disabled"], required: true },
  { name: "description", label: "Description", type: "textarea" as const },
];

export function VenuesPage() {
  const [records, setRecords] = React.useState(initialRecords);
  const [removeId, setRemoveId] = React.useState<string>();
  const columns = React.useMemo<ManagementColumn<VenueRecord>[]>(() => [
    { id: "venue", label: "Venue", accessor: (row) => `${row.name} ${row.location}`, cell: (row) => <div className="max-w-56 whitespace-normal"><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs">{row.location}</p></div> },
    { id: "capacity", label: "Capacity", accessor: (row) => row.capacity, cell: (row) => row.capacity.toLocaleString() }, { id: "events", label: "Events", accessor: (row) => row.events },
    { id: "status", label: "Availability", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> }, { id: "contact", label: "Contact", accessor: (row) => row.contact },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => toast.info(row.description)}><Eye /> View</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info("Venue editor opened")}><Pencil /> Edit</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info(`${row.events} venue events selected`)}><CalendarDays /> View events</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => { setRecords((items) => items.map((item) => item.id === row.id ? { ...item, status: "Disabled" } : item)); toast.success("Venue disabled"); }}><Ban /> Disable</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setRemoveId(row.id)}><Trash2 /> Delete</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu> },
  ], []);
  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6"><PageHeader title="Venues" description="Manage locations, capacity and event availability." actions={<FormDialog trigger={<Button><Plus /> Add Venue</Button>} title="Add venue" description="Create a venue for future events." fields={venueFields} submitLabel="Save venue" successMessage="Venue saved" />} />
    <StatCards items={[{ label: "Total Venues", value: records.length, icon: Building2 }, { label: "Available", value: records.filter((x) => x.status === "Available").length, icon: MapPin }, { label: "Combined Capacity", value: records.reduce((sum, x) => sum + x.capacity, 0).toLocaleString(), icon: Users }, { label: "Events Hosted", value: records.reduce((sum, x) => sum + x.events, 0), icon: CalendarDays }]} />
    <DataTable data={records} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Search venue or location..." />
    <ConfirmDialog open={Boolean(removeId)} onOpenChange={(open) => { if (!open) setRemoveId(undefined); }} title="Delete venue?" description="This removes the venue from the local frontend dataset." actionLabel="Delete" onConfirm={() => { setRecords((items) => items.filter((item) => item.id !== removeId)); setRemoveId(undefined); toast.success("Venue deleted"); }} />
  </div>;
}
