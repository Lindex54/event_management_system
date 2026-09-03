"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { CalendarWithTime } from "@/components/admin/shared/calendar-with-time";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreateEventDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date>();
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [timezone, setTimezone] = React.useState("Africa/Nairobi");
  const [status, setStatus] = React.useState("Draft");
  const [error, setError] = React.useState("");
  const [imageName, setImageName] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState("");

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageName(file.name);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageName("");
    setImagePreview("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!form.get("name") || !form.get("organizer") || !form.get("venue") || !date) {
      setError("Event name, organizer, venue and date are required.");
      return;
    }
    setError("");
    setOpen(false);
    toast.success("Event created", {
      description: `Scheduled in ${timezone}${startTime ? ` at ${startTime}` : ""}.`,
    });
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild>{trigger}</DialogTrigger><DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle className="text-lg">Create Event</DialogTitle><DialogDescription>Add the event details, date and optional time information.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2 sm:col-span-2"><Label htmlFor="event-name">Event Name *</Label><Input id="event-name" name="name" placeholder="e.g. Innovation Summit 2026" /></div><div className="space-y-2"><Label htmlFor="event-organizer">Organizer *</Label><Input id="event-organizer" name="organizer" placeholder="Organizer or organization" /></div><div className="space-y-2"><Label htmlFor="event-venue">Venue *</Label><Input id="event-venue" name="venue" placeholder="Event venue" /></div><div className="space-y-2"><Label htmlFor="event-theme">Event Theme (Optional)</Label><Input id="event-theme" name="theme" placeholder="e.g. Innovation for everyone" /></div><div className="space-y-2"><Label>Status *</Label><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent>{["Draft", "Upcoming", "Active"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="event-image">Event Image (Optional)</Label><input id="event-image" type="file" accept="image/*" onChange={selectImage} className="sr-only" /><label htmlFor="event-image" className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"><ImagePlus className="size-4" /><span className="truncate">{imageName || "Choose event image"}</span></label></div>{imagePreview && <div className="relative aspect-[16/7] overflow-hidden rounded-lg border border-border sm:col-span-2"><Image src={imagePreview} alt="Selected event preview" fill unoptimized className="object-cover" /><Button type="button" variant="secondary" size="icon-sm" onClick={removeImage} className="absolute top-2 right-2" aria-label="Remove event image"><X /></Button></div>}</div><div><Label className="mb-2 block">Event Date *</Label><CalendarWithTime date={date} onDateChange={setDate} startTime={startTime} onStartTimeChange={setStartTime} endTime={endTime} onEndTimeChange={setEndTime} timezone={timezone} onTimezoneChange={setTimezone} /></div>{error && <p className="text-sm text-danger" role="alert">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create Event</Button></DialogFooter></form></DialogContent></Dialog>;
}
