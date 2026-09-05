/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import { CalendarCheck, CheckCircle2, ClipboardList, Eye, MoreHorizontal, Plus, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { FormDialog, type FormField } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/admin-api";

type Registration = { id: number; referenceCode: string; participant: string; email: string; eventId: number; event: string; attendeeId: number; date: string; status: string; checkIn: string; verifiedBy?: string | null; verifiedByEmail?: string | null };
type ScanLogEntry = { id: number; scanMethod: string; result: string; scannedAt: string; scannedBy: string | null; scannedByEmail: string | null };
type Option = { id: number; name?: string; email?: string };

export function RegistrationsPage() {
  const [records, setRecords] = React.useState<Registration[]>([]);
  const [events, setEvents] = React.useState<Option[]>([]);
  const [attendees, setAttendees] = React.useState<Option[]>([]);
  const [eventFilter, setEventFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [checkInFilter, setCheckInFilter] = React.useState("All");
  const [selected, setSelected] = React.useState<Registration>();
  const [editing, setEditing] = React.useState<Registration>();
  const [removeId, setRemoveId] = React.useState<number>();
  const [loading, setLoading] = React.useState(true);
  const [scanLog, setScanLog] = React.useState<ScanLogEntry[]>([]);
  const [scanLogLoading, setScanLogLoading] = React.useState(false);

  React.useEffect(() => {
    if (!selected) { setScanLog([]); return; }
    setScanLogLoading(true);
    adminApi<ScanLogEntry[]>(`/registrations/${selected.id}/scan-log`)
      .then((result) => setScanLog(result.data ?? []))
      .catch(() => setScanLog([]))
      .finally(() => setScanLogLoading(false));
  }, [selected]);

  const load = React.useCallback(async () => {
    try {
      const [registrationResult, eventResult, attendeeResult] = await Promise.all([
        adminApi<Registration[]>("/registrations"), adminApi<Option[]>("/events"), adminApi<Option[]>("/attendees"),
      ]);
      setRecords(registrationResult.data ?? []);
      setEvents(eventResult.data ?? []);
      setAttendees(attendeeResult.data ?? []);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load registrations"); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const createFields: FormField[] = [
    { name: "eventId", label: "Event", type: "select", required: true, options: events.map((item) => ({ label: item.name ?? `Event ${item.id}`, value: String(item.id) })) },
    { name: "attendeeId", label: "Attendee", type: "select", required: true, options: attendees.map((item) => ({ label: `${item.name ?? `Attendee ${item.id}`} — ${item.email ?? "No email"}`, value: String(item.id) })) },
    { name: "status", label: "Status", type: "select", required: true, options: ["Pending", "Confirmed", "Cancelled"] },
  ];
  const editFields: FormField[] = [
    { name: "status", label: "Registration status", type: "select", required: true, options: ["Pending", "Confirmed", "Cancelled"] },
    { name: "checkIn", label: "Check-in status", type: "select", required: true, options: ["Not Checked In", "Checked In"] },
  ];

  async function create(values: Record<string, string>) {
    await adminApi("/registrations", { method: "POST", body: JSON.stringify({ ...values, eventId: Number(values.eventId), attendeeId: Number(values.attendeeId) }) });
    await load();
  }
  async function update(record: Registration, changes: Partial<Registration>, message: string) {
    try {
      await adminApi(`/registrations/${record.id}`, { method: "PUT", body: JSON.stringify({ status: changes.status ?? record.status, checkIn: changes.checkIn ?? record.checkIn }) });
      toast.success(message); await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update registration"); }
  }

  const filtered = records.filter((item) => (eventFilter === "All" || String(item.eventId) === eventFilter) && (statusFilter === "All" || item.status === statusFilter) && (checkInFilter === "All" || item.checkIn === checkInFilter));
  const columns: ManagementColumn<Registration>[] = [
    { id: "id", label: "Registration ID", accessor: (row) => row.referenceCode, cell: (row) => <span className="font-mono text-xs font-semibold text-primary">{row.referenceCode}</span> },
    { id: "participant", label: "Participant", accessor: (row) => `${row.participant} ${row.email}`, cell: (row) => <div><p className="font-semibold text-text-primary">{row.participant}</p><p className="text-xs">{row.email}</p></div> },
    { id: "event", label: "Event", accessor: (row) => row.event }, { id: "date", label: "Registration Date", accessor: (row) => row.date },
    { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
    { id: "checkIn", label: "Check-in", accessor: (row) => row.checkIn, cell: (row) => <StatusBadge status={row.checkIn} /> },
    { id: "verifiedBy", label: "Verified By", accessor: (row) => row.verifiedBy ?? "", cell: (row) => row.checkIn === "Checked In" ? <span className="text-text-primary">{row.verifiedBy ?? "—"}</span> : <span className="text-text-secondary">—</span> },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuItem onSelect={() => setSelected(row)}><Eye /> View details</DropdownMenuItem><DropdownMenuItem onSelect={() => setEditing(row)}><ClipboardList /> Edit registration</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void update(row, { status: "Confirmed" }, "Registration confirmed")}><CheckCircle2 /> Confirm</DropdownMenuItem><DropdownMenuItem onSelect={() => void update(row, { checkIn: "Checked In" }, "Attendee checked in")}><CalendarCheck /> Mark checked in</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setRemoveId(row.id)}><Trash2 /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ];

  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
    <PageHeader title="Registrations" description="Create registrations, manage approval and record event check-ins." actions={<FormDialog trigger={<Button><Plus /> Add Registration</Button>} title="Add registration" description="Register an existing attendee for an event." fields={createFields} initialValues={{ status: "Pending" }} submitLabel="Create registration" successMessage="Registration created" onSave={create} />} />
    <StatCards items={[{ label: "Total Registrations", value: records.length, icon: ClipboardList }, { label: "Confirmed", value: records.filter((item) => item.status === "Confirmed").length, icon: CheckCircle2 }, { label: "Pending", value: records.filter((item) => item.status === "Pending").length, icon: ClipboardList }, { label: "Cancelled", value: records.filter((item) => item.status === "Cancelled").length, icon: XCircle }, { label: "Checked In", value: records.filter((item) => item.checkIn === "Checked In").length, icon: CalendarCheck }]} />
    {loading ? <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-secondary">Loading registrations…</p> : <DataTable data={filtered} columns={columns} getRowId={(row) => String(row.id)} searchPlaceholder="Search name, email, event or reference..." toolbar={<><Select value={eventFilter} onValueChange={setEventFilter}><SelectTrigger className="h-9 w-44 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All events</SelectItem>{events.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Confirmed", "Pending", "Cancelled"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All statuses" : item}</SelectItem>)}</SelectContent></Select><Select value={checkInFilter} onValueChange={setCheckInFilter}><SelectTrigger className="h-9 w-40 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Checked In", "Not Checked In"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All check-ins" : item}</SelectItem>)}</SelectContent></Select></>} />}
    {editing && <FormDialog key={editing.id} open onOpenChange={(open) => { if (!open) setEditing(undefined); }} title="Edit registration" description={`Update ${editing.referenceCode}.`} fields={editFields} initialValues={{ status: editing.status, checkIn: editing.checkIn }} submitLabel="Save changes" successMessage="Registration updated" onSave={async (values) => { await adminApi(`/registrations/${editing.id}`, { method: "PUT", body: JSON.stringify(values) }); await load(); }} />}
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined); }}><DialogContent><DialogHeader><DialogTitle>Registration details</DialogTitle><DialogDescription>{selected?.referenceCode}</DialogDescription></DialogHeader>{selected && <div className="space-y-4"><div className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4 text-sm"><Detail label="Participant" value={selected.participant} /><Detail label="Event" value={selected.event} /><Detail label="Email" value={selected.email} /><Detail label="Registered" value={selected.date} /><Detail label="Status" value={selected.status} /><Detail label="Check-in" value={selected.checkIn} />{selected.checkIn === "Checked In" && <Detail label="Verified By" value={selected.verifiedBy ? `${selected.verifiedBy}${selected.verifiedByEmail ? ` (${selected.verifiedByEmail})` : ""}` : "Unknown"} />}</div><div><p className="mb-2 text-xs font-semibold tracking-wide text-text-secondary uppercase">Scan Activity</p>{scanLogLoading ? <p className="text-sm text-text-secondary">Loading scan history…</p> : scanLog.length ? <ul className="space-y-2 text-sm">{scanLog.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2"><span><span className="font-medium text-text-primary">{entry.scannedBy ?? "Unknown"}</span> · {entry.scanMethod} · {entry.result.replaceAll("_", " ")}</span><span className="text-xs text-text-secondary">{new Date(entry.scannedAt).toLocaleString()}</span></li>)}</ul> : <p className="text-sm text-text-secondary">No scan attempts recorded yet.</p>}</div></div>}</DialogContent></Dialog>
    <ConfirmDialog open={Boolean(removeId)} onOpenChange={(open) => { if (!open) setRemoveId(undefined); }} title="Delete registration?" description="The registration will be archived and removed from active records." actionLabel="Delete" onConfirm={() => void (async () => { try { await adminApi(`/registrations/${removeId}`, { method: "DELETE" }); setRemoveId(undefined); toast.success("Registration deleted"); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to delete registration"); } })()} />
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-text-secondary">{label}</p><p className="font-semibold text-text-primary">{value}</p></div>; }
