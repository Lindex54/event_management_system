import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { InvitePeopleDialog } from "@/components/admin/invite-people-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { managementEvents } from "@/data/admin-management";

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = managementEvents.find((item) => item.id === id);
  if (!event) notFound();
  return <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6"><PageHeader title={event.name} description={`${event.organizer} · ${event.dateLabel}`} actions={<InvitePeopleDialog eventId={event.id} trigger={<Button><Users /> Invite People</Button>} />} /><div className="grid gap-4 sm:grid-cols-3"><Card className="shadow-none"><CardContent className="flex gap-3"><CalendarDays className="size-5 text-primary" /><div><p className="text-xs text-text-secondary">Date & time</p><p className="mt-1 font-semibold">{event.dateLabel}, {event.time}</p></div></CardContent></Card><Card className="shadow-none"><CardContent className="flex gap-3"><MapPin className="size-5 text-primary" /><div><p className="text-xs text-text-secondary">Venue</p><p className="mt-1 font-semibold">{event.venue}</p></div></CardContent></Card><Card className="shadow-none"><CardContent className="flex gap-3"><Users className="size-5 text-primary" /><div><p className="text-xs text-text-secondary">Registrations</p><p className="mt-1 font-semibold">{event.registrations} / {event.capacity}</p></div></CardContent></Card></div><Tabs defaultValue="overview"><TabsList className="h-auto flex-wrap"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="registrations">Registrations</TabsTrigger><TabsTrigger value="attendees">Attendees</TabsTrigger><TabsTrigger value="schedule">Schedule</TabsTrigger><TabsTrigger value="speakers">Speakers</TabsTrigger><TabsTrigger value="check-in">Check-in</TabsTrigger></TabsList><TabsContent value="overview" className="mt-4"><Card className="shadow-none"><CardHeader><CardTitle>Event overview</CardTitle></CardHeader><CardContent className="space-y-4"><StatusBadge status={event.status} /><p className="text-sm leading-6 text-text-secondary">This route establishes the event detail architecture. Full event-specific management modules will connect here during the next frontend and backend phases.</p></CardContent></Card></TabsContent>{["registrations", "attendees", "schedule", "speakers", "check-in"].map((tab) => <TabsContent key={tab} value={tab} className="mt-4"><Card className="shadow-none"><CardContent className="p-8 text-center text-sm text-text-secondary">The {tab} workspace is prepared for event-specific functionality.</CardContent></Card></TabsContent>)}</Tabs></div>;
}
