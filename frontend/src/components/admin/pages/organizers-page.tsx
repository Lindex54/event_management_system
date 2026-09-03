"use client";

import * as React from "react";
import { Building2, CheckCircle2, Eye, MoreHorizontal, Pencil, Plus, ShieldAlert, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { FormDialog } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizerRecords as initialRecords } from "@/data/admin-management";
import type { AdminOrganizerRecord } from "@/types/admin";

const organizerFields = [
  { name: "firstName", label: "First Name", required: true }, { name: "lastName", label: "Last Name", required: true },
  { name: "email", label: "Email", type: "email" as const, required: true }, { name: "telephone", label: "Telephone", type: "tel" as const, required: true },
  { name: "organization", label: "Organization", required: true }, { name: "position", label: "Position" },
  { name: "status", label: "Status", type: "select" as const, options: ["Active", "Pending", "Suspended"], required: true },
];

export function OrganizersPage() {
  const [records, setRecords] = React.useState(initialRecords);
  const [status, setStatus] = React.useState("All");
  const [removeId, setRemoveId] = React.useState<string>();
  const update = React.useCallback((id: string, nextStatus: AdminOrganizerRecord["status"]) => { setRecords((items) => items.map((item) => item.id === id ? { ...item, status: nextStatus } : item)); toast.success(`Organizer ${nextStatus.toLowerCase()}`); }, []);
  const columns = React.useMemo<ManagementColumn<AdminOrganizerRecord>[]>(() => [
    { id: "organizer", label: "Organizer", accessor: (row) => `${row.name} ${row.organization}`, cell: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs">{row.id}</p></div> },
    { id: "organization", label: "Organization", accessor: (row) => row.organization }, { id: "contact", label: "Contact", accessor: (row) => row.contact },
    { id: "created", label: "Events Created", accessor: (row) => row.eventsCreated }, { id: "activeEvents", label: "Active Events", accessor: (row) => row.activeEvents },
    { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> }, { id: "joined", label: "Joined", accessor: (row) => row.joined },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => toast.info(`${row.name}: ${row.eventsCreated} events created`)}><Eye /> View organizer</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info("Organizer editor opened")}><Pencil /> Edit</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info("Organizer events selected")}><Building2 /> View events</DropdownMenuItem><DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => update(row.id, "Active")}><CheckCircle2 /> Activate</DropdownMenuItem><DropdownMenuItem onSelect={() => update(row.id, "Suspended")}><ShieldAlert /> Suspend</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setRemoveId(row.id)}><Trash2 /> Delete</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu> },
  ], [update]);
  const filtered = records.filter((item) => status === "All" || item.status === status);
  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6"><PageHeader title="Organizers" description="Review, approve and manage event organizers." actions={<FormDialog trigger={<Button><Plus /> Add Organizer</Button>} title="Add organizer" description="Create a new organizer profile." fields={organizerFields} submitLabel="Add organizer" successMessage="Organizer added" />} />
    <StatCards items={[{ label: "Total Organizers", value: records.length, icon: UserCog }, { label: "Active", value: records.filter((x) => x.status === "Active").length, icon: CheckCircle2 }, { label: "Pending", value: records.filter((x) => x.status === "Pending").length, icon: UserCog }, { label: "Suspended", value: records.filter((x) => x.status === "Suspended").length, icon: ShieldAlert }]} />
    <DataTable data={filtered} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Search organizer, organization or contact..." toolbar={<Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Active", "Pending", "Suspended"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All statuses" : item}</SelectItem>)}</SelectContent></Select>} />
    <ConfirmDialog open={Boolean(removeId)} onOpenChange={(open) => { if (!open) setRemoveId(undefined); }} title="Delete organizer?" description="The organizer will be removed from this local frontend view." actionLabel="Delete" onConfirm={() => { setRecords((items) => items.filter((item) => item.id !== removeId)); setRemoveId(undefined); toast.success("Organizer deleted"); }} />
  </div>;
}
