"use client";

import * as React from "react";
import { format } from "date-fns";
import { FileText, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { CalendarWithTime } from "@/components/admin/shared/calendar-with-time";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/admin-api";

export type EventEditorRecord = {
  id: number; name: string; organizerId: number; venueId: number; theme?: string | null; description?: string | null;
  date: string; time?: string | null; endTime?: string | null; timezone: string; capacity: number; status: string;
  imageUrl?: string | null; imageAlt?: string | null;
  agendaType?: "None" | "File" | "Url"; agendaUrl?: string | null; agendaFileName?: string | null; agendaFileType?: string | null;
};
type SelectOption = { id: number; name?: string; organization?: string };

export function CreateEventDialog({ trigger, event, open: controlledOpen, onOpenChange, onSaved }: {
  trigger?: React.ReactNode; event?: EventEditorRecord; open?: boolean; onOpenChange?: (open: boolean) => void; onSaved?: () => void | Promise<void>;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const changeOpen = (next: boolean) => { setInternalOpen(next); onOpenChange?.(next); };
  const [organizers, setOrganizers] = React.useState<SelectOption[]>([]);
  const [venues, setVenues] = React.useState<SelectOption[]>([]);
  const [name, setName] = React.useState(event?.name ?? ""); const [organizerId, setOrganizerId] = React.useState(event ? String(event.organizerId) : ""); const [venueId, setVenueId] = React.useState(event ? String(event.venueId) : "");
  const [theme, setTheme] = React.useState(event?.theme ?? ""); const [description, setDescription] = React.useState(event?.description ?? ""); const [capacity, setCapacity] = React.useState(event ? String(event.capacity) : "");
  const [date, setDate] = React.useState<Date | undefined>(event?.date ? new Date(`${event.date.slice(0, 10)}T00:00:00`) : undefined); const [startTime, setStartTime] = React.useState(event?.time ?? ""); const [endTime, setEndTime] = React.useState(event?.endTime ?? "");
  const [timezone, setTimezone] = React.useState(event?.timezone ?? "Africa/Nairobi"); const [status, setStatus] = React.useState(event?.status ?? "Draft");
  const initialImageUrl=event?.imageUrl??"";
  const [imageUrl, setImageUrl] = React.useState(isManagedImageUrl(initialImageUrl)?"":initialImageUrl); const [imageAlt, setImageAlt] = React.useState(event?.imageAlt ?? "");
  const [imageFile, setImageFile] = React.useState<File>(); const [imagePreview, setImagePreview] = React.useState("");
  const [existingImageUrl,setExistingImageUrl]=React.useState(isManagedImageUrl(initialImageUrl)?initialImageUrl:"");
  const [agendaType, setAgendaType] = React.useState(event?.agendaType ?? "None"); const [agendaUrl, setAgendaUrl] = React.useState(event?.agendaType === "Url" ? event?.agendaUrl ?? "" : "");
  const [agendaFile, setAgendaFile] = React.useState<File>(); const [existingAgendaFileName, setExistingAgendaFileName] = React.useState(event?.agendaType === "File" ? event?.agendaFileName ?? "" : "");
  const [error, setError] = React.useState(""); const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    void Promise.all([adminApi<SelectOption[]>("/organizers"), adminApi<SelectOption[]>("/venues")]).then(([organizerResult, venueResult]) => {
      setOrganizers(organizerResult.data ?? []); setVenues(venueResult.data ?? []);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load organizers and venues"));
  }, [open, event]);

  async function selectImage(inputEvent: React.ChangeEvent<HTMLInputElement>) {
    const file = inputEvent.target.files?.[0];
    if (!file) return;
    try {
      setError("");
      setImagePreview(await validateImage(file));
      setImageFile(file);
      setExistingImageUrl("");
      setImageUrl("");
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
    if (!name.trim() || !organizerId || !venueId || !date || !Number(capacity)) { setError("Event name, organizer, venue, date and a positive capacity are required."); return; }
    if (startTime && endTime && endTime <= startTime) { setError("End time must be later than start time."); return; }
    if (agendaType === "Url" && !agendaUrl.trim()) { setError("Provide an agenda URL, or switch the agenda type to None."); return; }
    if (agendaType === "File" && !agendaFile && !existingAgendaFileName) { setError("Upload an agenda file, or switch the agenda type to None."); return; }
    setSaving(true); setError("");
    try {
      const imageUploadPromise = imageFile
        ? readAsDataUrl(imageFile).then((dataUrl) => adminApi<{ imageUrl: string }>("/uploads/event-image", {
            method: "POST",
            body: JSON.stringify({ dataUrl, originalName: imageFile.name }),
          }))
        : Promise.resolve(null);
      const agendaUploadPromise = agendaType === "File" && agendaFile
        ? readAsDataUrl(agendaFile).then((dataUrl) => adminApi<{ agendaUrl: string; agendaFileType: string; agendaFileName: string }>("/uploads/event-agenda", {
            method: "POST",
            body: JSON.stringify({ dataUrl, originalName: agendaFile.name }),
          }))
        : Promise.resolve(null);
      const [imageUpload, agendaUpload] = await Promise.all([imageUploadPromise, agendaUploadPromise]);

      let savedImageUrl = imageUrl.trim()||existingImageUrl;
      if (imageUpload) {
        savedImageUrl = imageUpload.data?.imageUrl ?? "";
        if (!savedImageUrl) throw new Error("The server did not return the uploaded image path");
      }

      let agendaPayload: { agendaType: string; agendaUrl: string | null; agendaFileName: string | null; agendaFileType: string | null } = { agendaType: "None", agendaUrl: null, agendaFileName: null, agendaFileType: null };
      if (agendaType === "Url") {
        agendaPayload = { agendaType: "Url", agendaUrl: agendaUrl.trim(), agendaFileName: null, agendaFileType: null };
      } else if (agendaType === "File") {
        if (agendaUpload) {
          agendaPayload = { agendaType: "File", agendaUrl: agendaUpload.data?.agendaUrl ?? null, agendaFileName: agendaUpload.data?.agendaFileName ?? null, agendaFileType: agendaUpload.data?.agendaFileType ?? null };
        } else {
          agendaPayload = { agendaType: "File", agendaUrl: event?.agendaUrl ?? null, agendaFileName: event?.agendaFileName ?? null, agendaFileType: event?.agendaFileType ?? null };
        }
      }

      await adminApi(`/events${event ? `/${event.id}` : ""}`, { method: event ? "PUT" : "POST", body: JSON.stringify({
        name: name.trim(), organizerId: Number(organizerId), venueId: Number(venueId), theme, description,
        date: format(date, "yyyy-MM-dd"), startTime: startTime || null, endTime: endTime || null, timezone,
        capacity: Number(capacity), status, imageUrl: savedImageUrl, imageAlt, ...agendaPayload,
      }) });
      toast.success(event ? "Event updated" : "Event created");
      changeOpen(false);
      if (onSaved) void Promise.resolve().then(onSaved).catch(() => toast.error("Event saved, but the event list could not be refreshed"));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save event"); }
    finally { setSaving(false); }
  }

  const displayedImage=imagePreview||existingImageUrl||(isExternalImageUrl(imageUrl)?imageUrl:"");
  return <Dialog open={open} onOpenChange={changeOpen}>{trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}<DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle className="text-lg">{event ? "Edit Event" : "Create Event"}</DialogTitle><DialogDescription>Add the event details, date and optional time information.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Event Name *" id="event-name" span><Input id="event-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Innovation Summit 2026" /></Field>
    <Field label="Organizer *" id="event-organizer"><Select value={organizerId} onValueChange={setOrganizerId}><SelectTrigger id="event-organizer" className="h-10 w-full"><SelectValue placeholder="Select organizer" /></SelectTrigger><SelectContent>{organizers.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.organization ?? item.name}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Venue *" id="event-venue"><Select value={venueId} onValueChange={setVenueId}><SelectTrigger id="event-venue" className="h-10 w-full"><SelectValue placeholder="Select venue" /></SelectTrigger><SelectContent>{venues.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Event Theme (Optional)" id="event-theme"><Input id="event-theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="e.g. Innovation for everyone" /></Field>
    <Field label="Capacity *" id="event-capacity"><Input id="event-capacity" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 250" /></Field>
    <Field label="Status *" id="event-status"><Select value={status} onValueChange={setStatus}><SelectTrigger id="event-status" className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent>{["Draft", "Upcoming", "Active", "Completed", "Cancelled"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
    <Field label="Upload Event Image (Optional)" id="event-image-file" span><input id="event-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(inputEvent) => void selectImage(inputEvent)} /><label htmlFor="event-image-file" className="flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-input bg-background px-4 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"><ImagePlus className="size-5" /><span>{imageFile?.name||(existingImageUrl?"Current uploaded image — choose another file to replace it":imageUrl?"Using the image URL below":"Choose an image from your device (JPG, PNG, WebP or GIF; maximum 5 MB)")}</span></label>{displayedImage&&<div className="relative h-44 overflow-hidden rounded-xl border border-border bg-cover bg-center" style={{backgroundImage:`url(${JSON.stringify(displayedImage)})`}}><Button type="button" variant="secondary" size="icon-sm" className="absolute top-2 right-2" onClick={()=>{setImageFile(undefined);setImagePreview("");setExistingImageUrl("");setImageUrl("");}} aria-label="Remove event image"><X/></Button></div>}<p className="text-xs text-text-secondary">Choose either a device upload or an external image URL.</p></Field>
    <Field label="Event Image URL (Optional)" id="event-image"><Input id="event-image" type="url" value={imageUrl} onChange={(e)=>{const next=e.target.value;setImageUrl(next);if(next.trim()){setImageFile(undefined);setImagePreview("");setExistingImageUrl("");}}} placeholder="https://example.com/event.jpg" disabled={Boolean(imageFile||existingImageUrl)}/>{existingImageUrl&&<p className="text-xs text-text-secondary">Remove the current uploaded image above before switching to an external URL.</p>}</Field>
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

function isManagedImageUrl(value:string):boolean{
  if(value.startsWith("/uploads/")||value.startsWith("/api/files/"))return true;
  try{const path=new URL(value).pathname;return path.startsWith("/uploads/")||path.startsWith("/api/files/");}catch{return false;}
}

function isExternalImageUrl(value:string):boolean{return /^https?:\/\//i.test(value.trim());}
