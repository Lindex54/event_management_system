import Link from "next/link";
import { AlertCircle, CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLiveEventAccess } from "@/lib/api/public-events";

export const dynamic = "force-dynamic";

export default async function LiveEventPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ticket?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const access = await getLiveEventAccess(slug, query.ticket ?? "").catch(() => ({ data: null, message: "Unable to verify event access right now" }));
  if (!access.data) return <><PublicHeader /><main className="mx-auto flex min-h-[65vh] max-w-xl items-center px-4 py-12"><Card className="w-full"><CardContent className="p-8 text-center"><AlertCircle className="mx-auto size-10 text-danger" /><h1 className="mt-4 text-2xl font-bold">Event access denied</h1><p className="mt-2 text-sm leading-6 text-text-secondary">{access.message}. Please present your ticket to event staff or seek assistance at the check-in desk.</p><Button asChild variant="outline" className="mt-6"><Link href={`/events/${slug}`}>Back to Event</Link></Button></CardContent></Card></main><PublicFooter /></>;
  const event = access.data;
  return <><PublicHeader /><main className="mx-auto max-w-4xl space-y-6 px-4 py-12 sm:px-6"><div><Badge className="gap-1"><CheckCircle2 className="size-3.5" /> Access verified</Badge><h1 className="mt-3 text-3xl font-bold text-text-primary">{event.event}</h1><p className="mt-2 text-text-secondary">Welcome, {event.attendeeName}. Your staff check-in has unlocked this event.</p></div><Card><CardContent className="grid gap-3 p-5 text-sm sm:grid-cols-3"><p className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" />{event.date}</p><p className="flex items-center gap-2"><Clock className="size-4 text-primary" />{event.time ?? "TBA"}</p><p className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{event.venue ?? "TBA"}</p></CardContent></Card>{event.description && <Card><CardHeader><CardTitle>About this event</CardTitle></CardHeader><CardContent><p className="whitespace-pre-line text-sm leading-6 text-text-secondary">{event.description}</p></CardContent></Card>}{event.agendaType !== "None" && event.agendaUrl && <Card><CardHeader><CardTitle>Agenda</CardTitle></CardHeader><CardContent><Button asChild variant="outline"><a href={event.agendaUrl} target="_blank" rel="noopener noreferrer">Open {event.agendaFileName ?? "Agenda"}</a></Button></CardContent></Card>}<Card><CardHeader><CardTitle>Schedule</CardTitle></CardHeader><CardContent>{event.schedule.length ? <div className="divide-y divide-border">{event.schedule.map((item, index) => <div key={`${item.startTime}-${index}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"><div><p className="font-medium">{item.title}</p>{item.description && <p className="text-sm text-text-secondary">{item.description}</p>}{item.speaker && <p className="text-xs text-text-secondary">{item.speaker}</p>}</div><p className="text-sm text-text-secondary">{item.startTime}{item.endTime ? ` - ${item.endTime}` : ""}{item.room ? ` · ${item.room}` : ""}</p></div>)}</div> : <p className="text-sm text-text-secondary">The event schedule will be shared here.</p>}</CardContent></Card></main><PublicFooter /></>;
}
