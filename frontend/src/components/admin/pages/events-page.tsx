"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarCheck, CalendarDays, CalendarPlus, CircleX, Clock3, Copy, Eye, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { CreateEventDialog, type EventEditorRecord } from "@/components/admin/create-event-dialog";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/admin-api";

export type AdminEvent = EventEditorRecord & { slug: string; organizer: string; venue: string; dateLabel: string; registrations: number };

export function EventsPage() {
  const [events, setEvents] = React.useState<AdminEvent[]>([]);
  const [status, setStatus] = React.useState("All"); const [venue, setVenue] = React.useState("All"); const [date, setDate] = React.useState<Date>();
  const [editing, setEditing] = React.useState<AdminEvent>(); const [confirm, setConfirm] = React.useState<{ event: AdminEvent; action: "cancel" | "delete" }>(); const [loading, setLoading] = React.useState(true);
  const load = React.useCallback(async () => { try { const result = await adminApi<AdminEvent[]>("/events"); setEvents(result.data ?? []); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load events"); } finally { setLoading(false); } }, []);
  React.useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const filtered = events.filter((item) => (status === "All" || item.status === status) && (venue === "All" || item.venue === venue) && (!date || item.date.slice(0, 10) === format(date, "yyyy-MM-dd")));
  const venues = [...new Set(events.map((item) => item.venue))];
  async function copyLink(item: AdminEvent) { try { await navigator.clipboard.writeText(`${window.location.origin}/events/${item.slug}`); toast.success("Event link copied"); } catch { toast.error("Could not copy event link"); } }
  async function cancelEvent(item: AdminEvent) { await adminApi(`/events/${item.id}`, { method: "PUT", body: JSON.stringify({ ...item, status: "Cancelled", startTime: item.time }) }); }

  const columns: ManagementColumn<AdminEvent>[] = [
    { id: "event", label: "Event", accessor: (row) => `${row.name} ${row.organizer}`, cell: (row) => <div className="max-w-56 whitespace-normal"><Link href={`/admin/events/${row.id}`} className="font-semibold text-text-primary hover:text-primary">{row.name}</Link><p className="text-xs text-text-secondary">EVT-{String(row.id).padStart(5, "0")}</p></div> },
    { id: "organizer", label: "Organizer", accessor: (row) => row.organizer }, { id: "date", label: "Date", accessor: (row) => row.date, cell: (row) => row.dateLabel },
    { id: "time", label: "Time", accessor: (row) => row.time || "Not set" }, { id: "venue", label: "Venue", accessor: (row) => row.venue },
    { id: "registrations", label: "Registrations", accessor: (row) => Number(row.registrations), cell: (row) => <span className="font-medium text-text-primary">{row.registrations}<span className="font-normal text-text-secondary"> / {row.capacity}</span></span> },
    { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-52"><DropdownMenuItem asChild><Link href={`/admin/events/${row.id}`}><Eye /> View event</Link></DropdownMenuItem><DropdownMenuItem onSelect={() => setEditing(row)}><Pencil /> Edit event</DropdownMenuItem><DropdownMenuItem asChild><Link href={`/admin/registrations?event=${row.id}`}><Users /> View registrations</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void copyLink(row)}><Copy /> Copy event link</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ event: row, action: "cancel" })}><CircleX /> Cancel event</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setConfirm({ event: row, action: "delete" })}><Trash2 /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu> },
  ];

  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6"><PageHeader title="Events" description="Create and manage every event in the platform database." actions={<CreateEventDialog trigger={<Button><CalendarPlus /> Create Event</Button>} onSaved={load} />} />
    <StatCards items={[{ label: "Total Events", value: events.length, icon: CalendarDays }, { label: "Upcoming", value: events.filter((item) => item.status === "Upcoming").length, icon: Clock3 }, { label: "Active", value: events.filter((item) => item.status === "Active").length, icon: CalendarCheck }, { label: "Completed", value: events.filter((item) => item.status === "Completed").length, icon: CalendarCheck }, { label: "Cancelled", value: events.filter((item) => item.status === "Cancelled").length, icon: CircleX }]} />
    {loading ? <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-text-secondary">Loading events…</p> : <DataTable data={filtered} columns={columns} getRowId={(row) => String(row.id)} searchPlaceholder="Search event or organizer..." toolbar={<><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All statuses</SelectItem>{["Draft", "Upcoming", "Active", "Completed", "Cancelled"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={venue} onValueChange={setVenue}><SelectTrigger className="h-9 w-40 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All venues</SelectItem>{venues.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><DatePickerFilter value={date} onChange={setDate} label="Event date" />{(status !== "All" || venue !== "All" || date) && <Button variant="ghost" onClick={() => { setStatus("All"); setVenue("All"); setDate(undefined); }}>Clear</Button>}</>} />}
    {editing && <CreateEventDialog key={editing.id} event={editing} open onOpenChange={(open) => { if (!open) setEditing(undefined); }} onSaved={load} />}
    <ConfirmDialog open={Boolean(confirm)} onOpenChange={(open) => { if (!open) setConfirm(undefined); }} title={confirm?.action === "delete" ? "Delete this event?" : "Cancel this event?"} description={confirm?.action === "delete" ? "The event will be archived while its history remains in the database." : "Registration history remains available, but the event status will become Cancelled."} actionLabel={confirm?.action === "delete" ? "Delete" : "Cancel event"} onConfirm={() => void (async () => { if (!confirm) return; try { if (confirm.action === "delete") await adminApi(`/events/${confirm.event.id}`, { method: "DELETE" }); else await cancelEvent(confirm.event); toast.success(confirm.action === "delete" ? "Event deleted" : "Event cancelled"); setConfirm(undefined); await load(); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update event"); } })()} />
  </div>;
}
