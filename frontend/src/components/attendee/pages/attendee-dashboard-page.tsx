"use client";
import * as React from "react";import Link from "next/link";import { Bell,CalendarCheck2,CalendarDays,Clock,Compass,MapPin,Ticket,TicketCheck } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { StatCards } from "@/components/admin/shared/stat-cards";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Badge } from "@/components/ui/badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { attendeeApi } from "@/lib/api/attendee";

interface RegisteredEvent{eventId:number;name:string;slug:string;dateLabel:string;time:string;venue:string|null;eventStatus:string;registrationId:number;referenceCode:string;ticketToken:string;registrationStatus:string;checkInStatus:string;canEnterEvent:boolean|number;}
interface Dashboard{upcomingRegistered:number;totalRegistrations:number;eventsAttended:number;pendingRegistrations:number;nextEvent:RegisteredEvent|null;upcoming:RegisteredEvent[];recent:RegisteredEvent[];}
interface NotificationItem{id:number;title:string;message:string;isRead:boolean|number;createdAt:string;}

export function AttendeeDashboardPage(){
  const[data,setData]=React.useState<Dashboard|null>(null);
  const[notifications,setNotifications]=React.useState<NotificationItem[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{
    void Promise.all([attendeeApi<Dashboard>("/dashboard"),attendeeApi<NotificationItem[]>("/notifications")])
      .then(([dashboard,notifs])=>{ setData(dashboard); setNotifications(notifs.slice(0,3)); })
      .catch(e=>{ const message=e instanceof Error?e.message:"Unable to load dashboard"; setError(message); toast.error(message); })
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <div className="mx-auto max-w-[1400px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading your dashboard...</div></div>;
  if(error||!data) return <div className="mx-auto max-w-[1400px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div></div>;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Welcome back"
        description="Here's what's coming up for you."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="bg-surface"><Link href="/"><Compass/>Explore Events</Link></Button>
            <Button asChild variant="outline" className="bg-surface"><Link href="/attendee/registrations"><CalendarCheck2/>My Registrations</Link></Button>
            <Button asChild><Link href="/attendee/tickets"><Ticket/>View Ticket</Link></Button>
          </div>
        }
      />

      <StatCards items={[
        {label:"Upcoming Registered",value:data.upcomingRegistered,icon:CalendarDays},
        {label:"Total Registrations",value:data.totalRegistrations,icon:TicketCheck},
        {label:"Events Attended",value:data.eventsAttended,icon:CalendarCheck2},
        {label:"Pending Registrations",value:data.pendingRegistrations,icon:Clock},
      ]}/>

      {data.nextEvent && (
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-surface to-surface">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">Your Next Event</p>
              <h3 className="mt-1 text-xl font-bold text-text-primary">{data.nextEvent.name}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><CalendarDays className="size-4"/>{data.nextEvent.dateLabel} · {data.nextEvent.time}</span>
                {data.nextEvent.venue && <span className="flex items-center gap-1"><MapPin className="size-4"/>{data.nextEvent.venue}</span>}
              </div>
            </div>
            {Boolean(data.nextEvent.canEnterEvent) ? <Button asChild><Link href={`/events/${data.nextEvent.slug}/live?ticket=${data.nextEvent.ticketToken}`}>Enter Event</Link></Button> : <Button asChild variant="outline"><Link href="/attendee/tickets">View Ticket · Check-in Required</Link></Button>}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-text-primary">Upcoming Events</h3><Link href="/attendee/events" className="text-xs font-semibold text-primary hover:underline">View all</Link></div>
            {data.upcoming.length ? (
              <ul className="divide-y divide-border">
                {data.upcoming.map(event=>(
                  <li key={event.registrationId} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{event.name}</p>
                      <p className="text-xs text-text-secondary">{event.dateLabel} · {event.venue??"Venue TBA"}</p>
                    </div>
                    <div className="flex items-center gap-2"><StatusBadge status={event.checkInStatus}/>{Boolean(event.canEnterEvent) ? <Button asChild size="sm"><Link href={`/events/${event.slug}/live?ticket=${event.ticketToken}`}>Enter Event</Link></Button> : <Button size="sm" variant="outline" disabled>Check-in Required</Button>}</div>
                  </li>
                ))}
              </ul>
            ) : <p className="py-6 text-center text-sm text-text-secondary">No upcoming events yet. <Link href="/" className="font-semibold text-primary hover:underline">Explore events</Link></p>}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-text-primary">Notifications</h3><Link href="/attendee/notifications" className="text-xs font-semibold text-primary hover:underline">View all</Link></div>
            {notifications.length ? (
              <ul className="space-y-3">
                {notifications.map(item=>(
                  <li key={item.id} className="flex gap-2.5">
                    <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${item.isRead?"bg-muted text-text-secondary":"bg-primary/10 text-primary"}`}><Bell className="size-3.5"/></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                      <p className="truncate text-xs text-text-secondary">{item.message}</p>
                    </div>
                    {!item.isRead && <Badge className="ml-auto h-fit shrink-0 bg-primary/10 text-primary hover:bg-primary/10">New</Badge>}
                  </li>
                ))}
              </ul>
            ) : <p className="py-6 text-center text-sm text-text-secondary">You&apos;re all caught up.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-3 font-semibold text-text-primary">Recent Registrations</h3>
          {data.recent.length ? (
            <ul className="divide-y divide-border">
              {data.recent.map(event=>(
                <li key={event.registrationId} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{event.name}</p>
                    <p className="text-xs text-text-secondary">{event.referenceCode}</p>
                  </div>
                  <div className="flex items-center gap-2"><StatusBadge status={event.registrationStatus}/><StatusBadge status={event.checkInStatus}/></div>
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-text-secondary">No registrations yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
