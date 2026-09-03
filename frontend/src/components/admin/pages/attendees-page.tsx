"use client";

import * as React from "react";
import { CalendarCheck, Eye, MoreHorizontal, Repeat2, Send, UserRoundCheck, Users, UserX } from "lucide-react";
import { toast } from "sonner";

import { InvitePeopleDialog } from "@/components/admin/invite-people-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { attendeeRecords as initialRecords } from "@/data/admin-management";
import type { AdminAttendeeRecord } from "@/types/admin";

export function AttendeesPage() {
  const [records, setRecords] = React.useState(initialRecords);
  const [selected, setSelected] = React.useState<AdminAttendeeRecord>();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const columns = React.useMemo<ManagementColumn<AdminAttendeeRecord>[]>(() => [
    { id: "attendee", label: "Attendee", accessor: (row) => `${row.name} ${row.email} ${row.telephone}`, cell: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs">{row.id}</p></div> },
    { id: "email", label: "Email", accessor: (row) => row.email },
    { id: "telephone", label: "Telephone", accessor: (row) => row.telephone },
    { id: "events", label: "Events Registered", accessor: (row) => row.eventsRegistered },
    { id: "last", label: "Last Registration", accessor: (row) => row.lastRegistration },
    { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
      <DropdownMenuItem onSelect={() => setSelected(row)}><Eye /> View profile</DropdownMenuItem><DropdownMenuItem onSelect={() => setSelected(row)}><CalendarCheck /> View registrations</DropdownMenuItem><DropdownMenuItem onSelect={() => setInviteOpen(true)}><Send /> Invite to event</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => { setRecords((current) => current.map((item) => item.id === row.id ? { ...item, status: "Disabled" } : item)); toast.success("Attendee account disabled"); }}><UserX /> Disable account</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu> },
  ], []);
  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
    <PageHeader title="Attendees" description="Understand attendee engagement and registration history." actions={<InvitePeopleDialog trigger={<Button><Send /> Invite to Event</Button>} />} />
    <StatCards items={[
      { label: "Total Attendees", value: records.length, icon: Users }, { label: "Registered This Month", value: 4, icon: UserRoundCheck },
      { label: "Checked In", value: 3, icon: CalendarCheck }, { label: "Returning Attendees", value: records.filter((item) => item.returning).length, icon: Repeat2 },
    ]} />
    <DataTable data={records} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Search name, email or telephone..." />
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined); }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Attendee profile</DialogTitle><DialogDescription>Profile, registration and attendance summary.</DialogDescription></DialogHeader>{selected && <div className="space-y-4"><div className="rounded-lg bg-background p-4"><p className="text-lg font-semibold">{selected.name}</p><p className="text-sm text-text-secondary">{selected.email} · {selected.telephone}</p></div><div className="grid grid-cols-3 gap-3 text-center"><div className="rounded-lg border p-3"><p className="text-xl font-bold">{selected.eventsRegistered}</p><p className="text-xs text-text-secondary">Registrations</p></div><div className="rounded-lg border p-3"><p className="text-xl font-bold">{selected.returning ? "Yes" : "No"}</p><p className="text-xs text-text-secondary">Returning</p></div><div className="rounded-lg border p-3"><StatusBadge status={selected.status} /><p className="mt-2 text-xs text-text-secondary">Account</p></div></div><div><p className="text-sm font-semibold">Recent event history</p><p className="mt-2 rounded-lg border p-3 text-sm text-text-secondary">Last registered on {selected.lastRegistration}. Full backend history will appear here.</p></div></div>}</DialogContent></Dialog>
    <InvitePeopleDialog open={inviteOpen} onOpenChange={setInviteOpen} />
  </div>;
}
