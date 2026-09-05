"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, ChevronLeft, MapPin, Users } from "lucide-react";
import { EventDetailsTabs, type AdminEventDetails } from "@/components/admin/events/event-details-tabs";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/admin-api";

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = React.useState<AdminEventDetails>();
  const [error, setError] = React.useState("");
  React.useEffect(() => { void adminApi<AdminEventDetails>(`/events/${params.id}`).then((result) => setEvent(result.data)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load event")); }, [params.id]);
  if (error) return <div className="p-6"><Card><CardContent className="space-y-4 p-8 text-center"><p className="text-danger">{error}</p><Button asChild variant="outline"><Link href="/admin/events"><ChevronLeft /> Back to events</Link></Button></CardContent></Card></div>;
  if (!event) return <p className="p-8 text-center text-sm text-text-secondary">Loading event…</p>;

  const time = event.time ? `${event.time}${event.endTime ? ` – ${event.endTime}` : ""}` : "Time not set";
  return <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6"><PageHeader title={event.name} description={`${event.organizer} · ${event.dateLabel}`} actions={<Button asChild variant="outline"><Link href="/admin/events"><ChevronLeft /> All Events</Link></Button>} />
    <div className="grid gap-4 sm:grid-cols-3"><Summary icon={CalendarDays} label="Date & time" value={`${event.dateLabel}, ${time}`} /><Summary icon={MapPin} label="Venue" value={event.venue} /><Summary icon={Users} label="Registrations" value={`${event.registrations} / ${event.capacity}`} /></div>
    <EventDetailsTabs event={event}/>
  </div>;
}

function Summary({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <Card className="shadow-none"><CardContent className="flex gap-3"><Icon className="size-5 shrink-0 text-primary" /><div><p className="text-xs text-text-secondary">{label}</p><p className="mt-1 font-semibold text-text-primary">{value}</p></div></CardContent></Card>; }
