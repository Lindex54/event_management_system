"use client";

import * as React from "react";
import { format } from "date-fns";
import { FileText, ImagePlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { CalendarWithTime } from "@/components/admin/shared/calendar-with-time";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { organizerApi } from "@/lib/api/organizer";

type StaffOption = { id: number; name: string; email: string };
type EventApi = <T>(path: string, init?: RequestInit) => Promise<T>;

export type OrganizerEventRecord = {
  id: number; name: string; venueId: number; theme?: string | null; description?: string | null;
  date: string; time?: string | null; endTime?: string | null; timezone: string; capacity: number; status: string;
  imageUrl?: string | null; imageAlt?: string | null;
  agendaType?: "None" | "File" | "Url"; agendaUrl?: string | null; agendaFileName?: string | null; agendaFileType?: string | null;
};
type SelectOption = { id: number; name: string };

export function CreateEventDialog({ trigger, event, open: controlledOpen, onOpenChange, onSaved, api = organizerApi, showCoOrganizers = true }: {
  trigger?: React.ReactNode; event?: OrganizerEventRecord; open?: boolean; onOpenChange?: (open: boolean) => void; onSaved?: () => void | Promise<void>;
  api?: EventApi; showCoOrganizers?: boolean;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const changeOpen = (next: boolean) => { setInternalOpen(next); onOpenChange?.(next); };
  const [venues, setVenues] = React.useState<SelectOption[]>([]);
  const [staffOptions, setStaffOptions] = React.useState<StaffOption[]>([]);
  const [coOrganizerIds, setCoOrganizerIds] = React.useState<number[]>([]);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteFirstName, setInviteFirstName] = React.useState(""); const [inviteLastName, setInviteLastName] = React.useState(""); const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviting, setInviting] = React.useState(false);
  const [name, setName] = React.useState(event?.name ?? ""); const [venueId, setVenueId] = React.useState(event ? String(event.venueId) : "");
  const [theme, setTheme] = React.useState(event?.theme ?? ""); const [description, setDescription] = React.useState(event?.description ?? ""); const [capacity, setCapacity] = React.useState(event ? String(event.capacity) : "");
  const [date, setDate] = React.useState<Date | undefined>(event?.date ? new Date(`${event.date.slice(0, 10)}T00:00:00`) : undefined); const [startTime, setStartTime] = React.useState(event?.time ?? ""); const [endTime, setEndTime] = React.useState(event?.endTime ?? "");
  const [timezone, setTimezone] = React.useState(event?.timezone ?? "Africa/Nairobi"); const [status, setStatus] = React.useState(event?.status ?? "Draft");
  const [imageUrl, setImageUrl] = React.useState(event?.imageUrl ?? ""); const [imageAlt, setImageAlt] = React.useState(event?.imageAlt ?? "");
  const [imageFile, setImageFile] = React.useState<File>(); const [imagePreview, setImagePreview] = React.useState("");
  const [agendaType, setAgendaType] = React.useState(event?.agendaType ?? "None"); const [agendaUrl, setAgendaUrl] = React.useState(event?.agendaType === "Url" ? event?.agendaUrl ?? "" : "");
  const [agendaFile, setAgendaFile] = React.useState<File>(); const [existingAgendaFileName, setExistingAgendaFileName] = React.useState(event?.agendaType === "File" ? event?.agendaFileName ?? "" : "");
  const [error, setError] = React.useState(""); const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    void api<SelectOption[]>("/venues").then(setVenues).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load venues"));
  }, [open, api]);

  React.useEffect(() => {
    if (!open || !showCoOrganizers) return;
    void Promise.all([
      api<StaffOption[]>("/staff-options"),
      event ? api<{ userId: number }[]>(`/events/${event.id}/co-organizers`) : Promise.resolve([]),
    ]).then(([options, assigned]) => { setStaffOptions(options); setCoOrganizerIds(assigned.map((a) => a.userId)); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load co-organizers"));
  }, [open, showCoOrganizers, event, api]);

  function toggleCoOrganizer(userId: number) {
    setCoOrganizerIds((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]);
  }

  async function inviteStaffMember() {
    if (!inviteFirstName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) { toast.error("A first name and valid email are required."); return; }
    setInviting(true);
    try {
      const created = await api<StaffOption>("/staff-options", { method: "POST", body: JSON.stringify({ firstName: inviteFirstName.trim(), lastName: inviteLastName.trim() || undefined, email: inviteEmail.trim() }) });
      toast.success(`Invitation sent to ${created.email}`);
      setStaffOptions((current) => [...current, created]);
      setCoOrganizerIds((current) => [...current, created.id]);
      setInviteFirstName(""); setInviteLastName(""); setInviteEmail(""); setInviteOpen(false);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Unable to invite staff member"); }
    finally { setInviting(false); }
  }

  async function selectImage(inputEvent: React.ChangeEvent<HTMLInputElement>) {
    const file = inputEvent.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      setImagePreview(await validateImage(file));
      setImageFile(file);
    } catch (reason) {
      setImageFile(undefined); setImagePreview(""); inputEvent.target.value = "";
      setError(reason instanceof Error ? reason.message : "Unable to use the selected image");
    }
  }

  function selectAgendaFile(inputEvent: React.ChangeEvent<HTMLInputElement>) {
    const file = inputEvent.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Choose a PDF, JPG, PNG, or WebP file for the agenda"); inputEvent.target.value = ""; return; }
    if (file.size > 5 * 1024 * 1024) { setError("The agenda file must be smaller than 5 MB"); inputEvent.target.value = ""; return; }
    setError(""); setAgendaFile(file); setExistingAgendaFileName("");
  }

  async function submit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!name.trim() || !venueId || !date || !Number(capacity)) { setError("Event name, venue, date and a positive capacity are required."); return; }
    if (startTime && endTime && endTime <= startTime) { setError("End time must be later than start time."); return; }
    if (agendaType === "Url" && !agendaUrl.trim()) { setError("Provide an agenda URL, or switch the agenda type to None."); return; }
    if (agendaType === "File" && !agendaFile && !existingAgendaFileName) { setError("Upload an agenda file, or switch the agenda type to None."); return; }
    setSaving(true); setError("");
    try {
      let savedImageUrl = imageUrl.trim();
      if (imageFile) {
        const upload = await api<{ imageUrl: string }>("/uploads/event-image", {
          method: "POST",
          body: JSON.stringify({ dataUrl: await readAsDataUrl(imageFile), originalName: imageFile.name }),
        });
        savedImageUrl = upload.imageUrl ?? "";
        if (!savedImageUrl) throw new Error("The server did not return the uploaded image path");
      }

      let agendaPayload: { agendaType: string; agendaUrl: string | null; agendaFileName: string | null; agendaFileType: string | null } = { agendaType: "None", agendaUrl: null, agendaFileName: null, agendaFileType: null };
      if (agendaType === "Url") {
        agendaPayload = { agendaType: "Url", agendaUrl: agendaUrl.trim(), agendaFileName: null, agendaFileType: null };
      } else if (agendaType === "File") {
        if (agendaFile) {
          const upload = await api<{ agendaUrl: string; agendaFileType: string; agendaFileName: string }>("/uploads/event-agenda", {
            method: "POST",
            body: JSON.stringify({ dataUrl: await readAsDataUrl(agendaFile), originalName: agendaFile.name }),
          });
          agendaPayload = { agendaType: "File", agendaUrl: upload.agendaUrl, agendaFileName: upload.agendaFileName, agendaFileType: upload.agendaFileType };
        } else {
          agendaPayload = { agendaType: "File", agendaUrl: event?.agendaUrl ?? null, agendaFileName: event?.agendaFileName ?? null, agendaFileType: event?.agendaFileType ?? null };
        }
      }

      const saved = await api<{ id?: number }>(`/events${event ? `/${event.id}` : ""}`, { method: event ? "PUT" : "POST", body: JSON.stringify({
        name: name.trim(), venueId: Number(venueId), theme, description,
        date: format(date, "yyyy-MM-dd"), startTime: startTime || null, endTime: endTime || null, timezone,
        capacity: Number(capacity), status, imageUrl: savedImageUrl, imageAlt, ...agendaPayload,
      }) });
      const eventId = event?.id ?? saved?.id;
      if (showCoOrganizers && eventId) {
        await api(`/events/${eventId}/co-organizers`, { method: "PUT", body: JSON.stringify({ userIds: coOrganizerIds }) });
      }
      toast.success(event ? "Event updated" : "Event created"); await onSaved?.(); changeOpen(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save event"); }
    finally { setSaving(false); }
  }

  return <Dialog open={open} onOpenChange={changeOpen}>{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}<DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle className="text-lg">{event ? "Edit Event" : "Create Event"}</DialogTitle><DialogDescription>Add the event details, date and optional time information.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Event Name *" id="event-name" span><Input id="event-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Innovation Summit 2026" /></Field>
    <Field label="Venue *" id="event-venue"><Select value={venueId} onValueChange={setVenueId}><SelectTrigger id="event-venue" className="h-10 w-full"><SelectValue placeholder="Select venue" /></SelectTrigger><SelectContent>{venues.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Capacity *" id="event-capacity"><Input id="event-capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 250" /></Field>
    <Field label="Event Theme (Optional)" id="event-theme"><Input id="event-theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. Innovation for everyone" /></Field>
    <Field label="Status *" id="event-status"><Select value={status} onValueChange={setStatus}><SelectTrigger id="event-status" className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent>{["Draft", "Upcoming", "Active", "Completed", "Cancelled"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Upload Event Image (Optional)" id="event-image-file" span><input id="event-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(inputEvent) => void selectImage(inputEvent)} /><label htmlFor="event-image-file" className="flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-background px-4 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"><ImagePlus className="size-5" /><span>{imageFile ? imageFile.name : "Choose an image from your device (JPG, PNG, WebP or GIF; maximum 5 MB)"}</span></label>{imagePreview && <div className="relative h-44 overflow-hidden rounded-xl border border-border bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(imagePreview)})` }}><Button type="button" variant="secondary" size="icon-sm" className="absolute right-2 top-2" onClick={() => { setImageFile(undefined); setImagePreview(""); }} aria-label="Remove selected image"><X /></Button></div>}<p className="text-xs text-text-secondary">A device image takes priority over the URL below.</p></Field>
    <Field label="Event Image URL (Optional)" id="event-image"><Input id="event-image" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/event.jpg" /></Field>
    <Field label="Image Description (Optional)" id="event-image-alt"><Input id="event-image-alt" value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Describe the event image" /></Field>
    <Field label="Description (Optional)" id="event-description" span><Textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell attendees what to expect" /></Field>
  </div>

  <div className="space-y-3 rounded-xl border border-border p-4">
    <Label className="flex items-center gap-2"><FileText className="size-4 text-primary" />Agenda</Label>
    <Select value={agendaType} onValueChange={(v) => setAgendaType(v as typeof agendaType)}>
      <SelectTrigger className="h-10 w-full sm:w-64"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="None">No agenda</SelectItem><SelectItem value="File">Upload agenda file</SelectItem><SelectItem value="Url">Provide agenda URL</SelectItem></SelectContent>
    </Select>
    {agendaType === "File" && (
      <div>
        <input id="agenda-file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={selectAgendaFile} />
        <label htmlFor="agenda-file" className="flex min-h-16 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-background px-4 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary">
          <FileText className="size-5" /><span>{agendaFile?.name || existingAgendaFileName || "Choose a PDF, JPG, PNG, or WebP file (maximum 5 MB)"}</span>
        </label>
      </div>
    )}
    {agendaType === "Url" && <Input type="url" value={agendaUrl} onChange={(e) => setAgendaUrl(e.target.value)} placeholder="https://example.com/agenda.pdf" className="h-10" />}
  </div>

  {showCoOrganizers && (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <Label className="flex items-center gap-2"><Users className="size-4 text-primary" />Co-organizers{coOrganizerIds.length > 0 && <Badge variant="secondary">{coOrganizerIds.length} selected</Badge>}</Label>
      {staffOptions.length ? (
        <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
          {staffOptions.map((staff) => (
            <label key={staff.id} htmlFor={`co-organizer-${staff.id}`} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted">
              <Checkbox id={`co-organizer-${staff.id}`} checked={coOrganizerIds.includes(staff.id)} onCheckedChange={() => toggleCoOrganizer(staff.id)} />
              <Avatar className="size-6"><AvatarFallback className="text-[10px]">{staff.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
              <span className="flex-1 truncate text-sm text-text-primary">{staff.name}</span>
              <span className="truncate text-xs text-text-secondary">{staff.email}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-secondary">No active Event Staff accounts are available to assign yet.</p>
      )}
      <p className="text-xs text-text-secondary">Co-organizers can manage this event&apos;s details, registrations, and schedule — they only gain access to events they&apos;re assigned to.</p>
      {(inviteOpen ? (
        <div className="space-y-2.5 rounded-lg border border-dashed border-input p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={inviteFirstName} onChange={(e) => setInviteFirstName(e.target.value)} placeholder="First name" className="h-9" />
            <Input value={inviteLastName} onChange={(e) => setInviteLastName(e.target.value)} placeholder="Last name (optional)" className="h-9" />
          </div>
          <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="staff@example.com" className="h-9" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(false)} disabled={inviting}>Cancel</Button>
            <Button type="button" size="sm" disabled={inviting} onClick={() => void inviteStaffMember()}>{inviting ? "Sending…" : "Send Invite"}</Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={() => setInviteOpen(true)}>+ Invite a new staff member</Button>
      ))}
    </div>
  )}

  <div><Label className="mb-2 block">Event Date *</Label><CalendarWithTime date={date} onDateChange={setDate} startTime={startTime} onStartTimeChange={setStartTime} endTime={endTime} onEndTimeChange={setEndTime} timezone={timezone} onTimezoneChange={setTimezone} /></div>{error && <p className="text-sm text-danger" role="alert">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => changeOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : event ? "Save Changes" : "Create Event"}</Button></DialogFooter></form></DialogContent></Dialog>;
}

function Field({ label, id, span, children }: { label: string; id: string; span?: boolean; children: React.ReactNode }) { return <div className={`space-y-2${span ? " sm:col-span-2" : ""}`}><Label htmlFor={id}>{label}</Label>{children}</div>; }

async function readAsDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Unable to read the selected image")); reader.readAsDataURL(file); });
}

async function validateImage(file: File): Promise<string> {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) throw new Error("Choose a JPG, PNG, WebP, or GIF image");
  if (file.size > 5 * 1024 * 1024) throw new Error("The event image must be smaller than 5 MB");
  return await readAsDataUrl(file);
}
