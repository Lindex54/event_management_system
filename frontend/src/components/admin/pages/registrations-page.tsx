"use client";

import * as React from "react";
import { CalendarCheck, CheckCircle2, ClipboardList, Eye, MoreHorizontal, UserRound, XCircle } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { managementEvents, registrationRecords } from "@/data/admin-management";
import type { AdminRegistrationRecord } from "@/types/admin";

export function RegistrationsPage() {
  const [records, setRecords] = React.useState(registrationRecords);
  const [eventFilter, setEventFilter] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [checkIn, setCheckIn] = React.useState("All");
  const [date, setDate] = React.useState<Date>();
  const [selected, setSelected] = React.useState<AdminRegistrationRecord>();
  const update = React.useCallback((id: string, changes: Partial<AdminRegistrationRecord>, message: string) => {
    setRecords((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    toast.success(message);
  }, []);
  const filtered = records.filter((item) =>
    (eventFilter === "All" || item.event === eventFilter) &&
    (status === "All" || item.status === status) &&
    (checkIn === "All" || item.checkIn === checkIn) &&
    (!date || item.date.startsWith(new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date))),
  );
  const columns = React.useMemo<ManagementColumn<AdminRegistrationRecord>[]>(() => [
    { id: "id", label: "Registration ID", accessor: (row) => row.id, cell: (row) => <span className="font-mono text-xs font-semibold text-primary">{row.id}</span> },
    { id: "participant", label: "Participant", accessor: (row) => `${row.participant} ${row.email}`, cell: (row) => <div><p className="font-semibold text-text-primary">{row.participant}</p><p className="text-xs">{row.email}</p></div> },
    { id: "event", label: "Event", accessor: (row) => row.event },
    { id: "email", label: "Email", accessor: (row) => row.email },
    { id: "date", label: "Registration Date", accessor: (row) => row.date },
    { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
    { id: "checkIn", label: "Check-in", accessor: (row) => row.checkIn, cell: (row) => <StatusBadge status={row.checkIn} /> },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onSelect={() => setSelected(row)}><Eye /> View registration</DropdownMenuItem><DropdownMenuItem onSelect={() => setSelected(row)}><UserRound /> View attendee</DropdownMenuItem><DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => update(row.id, { status: "Confirmed" }, "Registration confirmed")}><CheckCircle2 /> Confirm</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => update(row.id, { checkIn: "Checked In" }, "Attendee marked as checked in")}><CalendarCheck /> Mark checked in</DropdownMenuItem>
      <DropdownMenuItem variant="destructive" onSelect={() => update(row.id, { status: "Cancelled" }, "Registration cancelled")}><XCircle /> Cancel</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu> },
  ], [update]);

  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
    <PageHeader title="Registrations" description="Review participant registrations and manage check-in status." />
    <StatCards items={[
      { label: "Total Registrations", value: records.length, icon: ClipboardList },
      { label: "Confirmed", value: records.filter((item) => item.status === "Confirmed").length, icon: CheckCircle2 },
      { label: "Pending", value: records.filter((item) => item.status === "Pending").length, icon: ClipboardList },
      { label: "Cancelled", value: records.filter((item) => item.status === "Cancelled").length, icon: XCircle },
      { label: "Checked In", value: records.filter((item) => item.checkIn === "Checked In").length, icon: CalendarCheck },
    ]} />
    <DataTable data={filtered} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Search name, email or event..." toolbar={<>
      <Select value={eventFilter} onValueChange={setEventFilter}><SelectTrigger className="h-9 w-40 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All events</SelectItem>{managementEvents.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select>
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-34 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Confirmed", "Pending", "Cancelled"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All statuses" : item}</SelectItem>)}</SelectContent></Select>
      <Select value={checkIn} onValueChange={setCheckIn}><SelectTrigger className="h-9 w-40 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Checked In", "Not Checked In"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All check-ins" : item}</SelectItem>)}</SelectContent></Select>
      <DatePickerFilter value={date} onChange={setDate} label="Registration date" />
    </>} />
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined); }}><DialogContent><DialogHeader><DialogTitle>Registration details</DialogTitle><DialogDescription>Frontend record for {selected?.id}</DialogDescription></DialogHeader>{selected && <div className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4 text-sm"><div><p className="text-text-secondary">Participant</p><p className="font-semibold">{selected.participant}</p></div><div><p className="text-text-secondary">Event</p><p className="font-semibold">{selected.event}</p></div><div><p className="text-text-secondary">Email</p><p>{selected.email}</p></div><div><p className="text-text-secondary">Registered</p><p>{selected.date}</p></div></div>}</DialogContent></Dialog>
  </div>;
}
