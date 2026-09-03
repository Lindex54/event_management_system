"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, Mail, Mic, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { FormDialog } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { managementEvents, speakerRecords as initialRecords } from "@/data/admin-management";
import type { SpeakerRecord } from "@/types/admin";

const eventNames = managementEvents.map((event) => event.name);
const speakerFields = [
  { name: "name", label: "Speaker Name", placeholder: "e.g. Dr. Amina Nsubuga", required: true },
  { name: "email", label: "Email Address", type: "email" as const, placeholder: "speaker@example.com", required: true },
  { name: "title", label: "Professional Title", placeholder: "e.g. Research Director", required: true },
  { name: "organization", label: "Organization", placeholder: "Company or institution" },
  { name: "event", label: "Select Event", type: "select" as const, options: eventNames, required: true },
  { name: "status", label: "Invitation Status", type: "select" as const, options: ["Confirmed", "Pending"], required: true },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function SpeakersPage() {
  const [records, setRecords] = React.useState<SpeakerRecord[]>(initialRecords);
  const [eventFilter, setEventFilter] = React.useState("All");
  const [removeId, setRemoveId] = React.useState<string>();

  const addSpeaker = React.useCallback((values: Record<string, string>) => {
    setRecords((current) => [{
      id: `SPK-${String(100 + current.length + 1)}`,
      name: values.name,
      email: values.email,
      title: values.title,
      organization: values.organization || "Independent",
      event: values.event,
      status: values.status as SpeakerRecord["status"],
      initials: initials(values.name),
    }, ...current]);
  }, []);

  const columns = React.useMemo<ManagementColumn<SpeakerRecord>[]>(() => [
    { id: "speaker", label: "Speaker", accessor: (row) => `${row.name} ${row.email}`, cell: (row) => <div className="flex items-center gap-3"><Avatar><AvatarFallback className="bg-primary/10 font-semibold text-primary">{row.initials}</AvatarFallback></Avatar><div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs">{row.email}</p></div></div> },
    { id: "role", label: "Role", accessor: (row) => `${row.title} ${row.organization}`, cell: (row) => <div><p className="font-medium text-text-primary">{row.title}</p><p className="text-xs">{row.organization}</p></div> },
    { id: "event", label: "Assigned Event", accessor: (row) => row.event, cell: (row) => <span className="inline-flex max-w-64 items-center gap-1.5 whitespace-normal"><CalendarDays className="size-3.5 shrink-0 text-primary" />{row.event}</span> },
    { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => toast.info("Speaker editor will be connected to the backend next.")}><Pencil /> Edit speaker</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info(`Email invitation prepared for ${row.email}`)}><Mail /> Send invitation</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onSelect={() => setRemoveId(row.id)}><Trash2 /> Remove speaker</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ], []);

  const filtered = records.filter((speaker) => eventFilter === "All" || speaker.event === eventFilter);
  const assignedEvents = new Set(records.map((speaker) => speaker.event)).size;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Speakers"
        description="Add speakers and assign each speaker to an event."
        actions={<FormDialog trigger={<Button><Plus /> Add Speaker</Button>} title="Add speaker" description="Create a speaker profile and select the event they will speak at." fields={speakerFields} submitLabel="Add speaker" successMessage="Speaker added to the event" onSave={addSpeaker} />}
      />
      <StatCards items={[
        { label: "Total Speakers", value: records.length, icon: Mic },
        { label: "Confirmed", value: records.filter((speaker) => speaker.status === "Confirmed").length, icon: CheckCircle2 },
        { label: "Pending", value: records.filter((speaker) => speaker.status === "Pending").length, icon: Mail },
        { label: "Events Represented", value: assignedEvents, icon: CalendarDays },
      ]} />
      <DataTable
        data={filtered}
        columns={columns}
        getRowId={(row) => row.id}
        searchPlaceholder="Search speaker, email, role or event..."
        toolbar={<Select value={eventFilter} onValueChange={setEventFilter}><SelectTrigger className="h-9 w-full bg-surface sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All events</SelectItem>{eventNames.map((event) => <SelectItem key={event} value={event}>{event}</SelectItem>)}</SelectContent></Select>}
      />
      <ConfirmDialog open={Boolean(removeId)} onOpenChange={(open) => { if (!open) setRemoveId(undefined); }} title="Remove speaker?" description="The speaker will be removed from this local frontend view and unassigned from their event." actionLabel="Remove" onConfirm={() => { setRecords((current) => current.filter((speaker) => speaker.id !== removeId)); setRemoveId(undefined); toast.success("Speaker removed"); }} />
    </div>
  );
}
