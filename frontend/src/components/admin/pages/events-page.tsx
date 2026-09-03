"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarCheck, CalendarDays, CalendarPlus, CircleX, Clock3, Copy, Eye, MoreHorizontal, Pencil, Send, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { InvitePeopleDialog } from "@/components/admin/invite-people-dialog";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";
import { FormDialog } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { managementEvents as initialEvents } from "@/data/admin-management";
import type { ManagementEvent } from "@/types/admin";

export function EventsPage() {
  const [events, setEvents] = React.useState(initialEvents);
  const [status, setStatus] = React.useState("All");
  const [venue, setVenue] = React.useState("All");
  const [date, setDate] = React.useState<Date>();
  const [inviteId, setInviteId] = React.useState<string>();
  const [confirm, setConfirm] = React.useState<{ id: string; action: "cancel" | "delete" }>();

  const filtered = events.filter((event) =>
    (status === "All" || event.status === status) &&
    (venue === "All" || event.venue === venue) &&
    (!date || event.date === format(date, "yyyy-MM-dd")),
  );
  const venues = [...new Set(events.map((event) => event.venue))];

  async function copyLink(event: ManagementEvent) {
    try {
      await navigator.clipboard.writeText(event.registrationUrl);
      toast.success("Registration link copied");
    } catch { toast.error("Could not copy registration link"); }
  }

  const columns = React.useMemo<ManagementColumn<ManagementEvent>[]>(() => [
    { id: "event", label: "Event", accessor: (row) => `${row.name} ${row.organizer}`, cell: (row) => <div className="max-w-56 whitespace-normal"><Link href={`/admin/events/${row.id}`} className="font-semibold text-text-primary hover:text-primary">{row.name}</Link><p className="text-xs text-text-secondary">{row.id}</p></div> },
    { id: "organizer", label: "Organizer", accessor: (row) => row.organizer },
    { id: "date", label: "Date", accessor: (row) => row.date, cell: (row) => row.dateLabel },
    { id: "time", label: "Time", accessor: (row) => row.time },
    { id: "venue", label: "Venue", accessor: (row) => row.venue },
    { id: "registrations", label: "Registrations", accessor: (row) => row.registrations, cell: (row) => <span className="font-medium text-text-primary">{row.registrations}<span className="font-normal text-text-secondary"> / {row.capacity}</span></span> },
    { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => (
      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild><Link href={`/admin/events/${row.id}`}><Eye /> View event</Link></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.success("Event editor opened")}><Pencil /> Edit event</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.info("Registration list selected")}><Users /> View registrations</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => toast.info("Attendee list selected")}><Users /> View attendees</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void copyLink(row)}><Copy /> Copy registration link</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setInviteId(row.id)}><Send /> Invite people</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ id: row.id, action: "cancel" })}><CircleX /> Cancel event</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ id: row.id, action: "delete" })}><Trash2 /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) },
  ], []);

  const statItems = [
    { label: "Total Events", value: events.length, icon: CalendarDays },
    { label: "Upcoming", value: events.filter((item) => item.status === "Upcoming").length, icon: Clock3 },
    { label: "Active", value: events.filter((item) => item.status === "Active").length, icon: CalendarCheck },
    { label: "Completed", value: events.filter((item) => item.status === "Completed").length, icon: CalendarCheck },
    { label: "Cancelled", value: events.filter((item) => item.status === "Cancelled").length, icon: CircleX },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Events" description="Manage all events across the platform." actions={<>
        <InvitePeopleDialog trigger={<Button variant="outline" className="bg-surface"><Send /> Invite People</Button>} />
        <FormDialog trigger={<Button><CalendarPlus /> Create Event</Button>} title="Create event" description="Add a new event to the platform." submitLabel="Create event" successMessage="Event created" fields={[
          { name: "name", label: "Event name", required: true }, { name: "organizer", label: "Organizer", required: true },
          { name: "date", label: "Date", type: "date", required: true }, { name: "time", label: "Time", required: true },
          { name: "venue", label: "Venue", required: true }, { name: "status", label: "Status", type: "select", options: ["Draft", "Upcoming", "Active"], required: true },
        ]} />
      </>} />
      <StatCards items={statItems} />
      <DataTable data={filtered} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Search event or organizer..." toolbar={<>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All statuses</SelectItem>{["Draft", "Upcoming", "Active", "Completed", "Cancelled"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        <Select value={venue} onValueChange={setVenue}><SelectTrigger className="h-9 w-40 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All venues</SelectItem>{venues.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        <DatePickerFilter value={date} onChange={setDate} label="Event date" />
        {(status !== "All" || venue !== "All" || date) && <Button variant="ghost" onClick={() => { setStatus("All"); setVenue("All"); setDate(undefined); }}>Clear</Button>}
      </>} />
      <InvitePeopleDialog key={inviteId} eventId={inviteId} open={Boolean(inviteId)} onOpenChange={(open) => { if (!open) setInviteId(undefined); }} />
      <ConfirmDialog open={Boolean(confirm)} onOpenChange={(open) => { if (!open) setConfirm(undefined); }} title={confirm?.action === "delete" ? "Delete this event?" : "Cancel this event?"} description="This frontend action updates the local dashboard data. Backend enforcement will be added later." actionLabel={confirm?.action === "delete" ? "Delete" : "Cancel event"} onConfirm={() => {
        if (!confirm) return;
        setEvents((current) => confirm.action === "delete" ? current.filter((item) => item.id !== confirm.id) : current.map((item) => item.id === confirm.id ? { ...item, status: "Cancelled" } : item));
        toast.success(confirm.action === "delete" ? "Event deleted" : "Event cancelled");
        setConfirm(undefined);
      }} />
    </div>
  );
}
