import Link from "next/link";
import { CalendarClock, CheckCircle2, Clock, ExternalLink, FileText, Mail, MapPin, Phone, UserRound, Users } from "lucide-react";

import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminEvent } from "@/components/admin/pages/events-page";

type Registration = { id:number;referenceCode:string;attendeeId:number;participant:string;email:string;telephone:string|null;registeredAt:string;status:string;checkIn:string;checkedInAt:string|null;verifiedBy:string|null };
type EventAttendee = { id:number;name:string;email:string;telephone:string|null;registrationStatus:string;checkIn:string };
type ScheduleItem = { id:number;title:string;description:string|null;date:string;startTime:string;endTime:string|null;room:string|null;speaker:string|null;createdByRole:string|null;createdBy:string|null };
type Speaker = { id:number;name:string;email:string;telephone:string|null;title:string;organization:string|null;type:string;status:string };
type CheckIn = { id:number;referenceCode:string;participant:string;checkedInAt:string;verifiedBy:string|null };

export type AdminEventDetails = AdminEvent & {
  registrationRecords:Registration[];
  attendees:EventAttendee[];
  schedule:ScheduleItem[];
  speakers:Speaker[];
  checkIns:CheckIn[];
};

export function EventDetailsTabs({event}:{event:AdminEventDetails}) {
  return <Tabs defaultValue="overview">
    <TabsList className="h-auto flex-wrap">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="registrations">Registrations ({event.registrationRecords.length})</TabsTrigger>
      <TabsTrigger value="attendees">Attendees ({event.attendees.length})</TabsTrigger>
      <TabsTrigger value="schedule">Schedule ({event.schedule.length})</TabsTrigger>
      <TabsTrigger value="speakers">Speakers ({event.speakers.length})</TabsTrigger>
      <TabsTrigger value="check-in">Check-in ({event.checkIns.length})</TabsTrigger>
    </TabsList>

    <TabsContent value="overview" className="mt-4">
      <Card className="overflow-hidden shadow-none">
        {event.imageUrl && <div className="h-56 bg-muted bg-cover bg-center sm:h-72" style={{backgroundImage:`url(${JSON.stringify(event.imageUrl)})`}} role="img" aria-label={event.imageAlt||event.name}/>} 
        <CardHeader><CardTitle>Event overview</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <StatusBadge status={event.status}/>
          {event.theme&&<p className="font-medium text-text-primary">{event.theme}</p>}
          <p className="text-sm leading-6 text-text-secondary">{event.description||"No event description has been added yet."}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary"><span>Time zone: {event.timezone}</span>{event.agendaUrl&&<Button asChild size="sm" variant="outline"><a href={event.agendaUrl} target="_blank" rel="noreferrer"><FileText/>View agenda<ExternalLink/></a></Button>}</div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="registrations" className="mt-4">
      <Section title="Event registrations" icon={FileText} actionHref={`/admin/registrations?event=${event.id}`} actionLabel="Manage registrations">
        {event.registrationRecords.length?<div className="overflow-x-auto"><table className="w-full min-w-3xl text-sm"><thead className="border-b text-left text-xs text-text-secondary"><tr><th className="p-3">Registration</th><th className="p-3">Participant</th><th className="p-3">Registered</th><th className="p-3">Status</th><th className="p-3">Check-in</th></tr></thead><tbody>{event.registrationRecords.map(item=><tr key={item.id} className="border-b last:border-0"><td className="p-3 font-mono text-xs font-semibold text-primary">{item.referenceCode}</td><td className="p-3"><p className="font-medium text-text-primary">{item.participant}</p><p className="text-xs text-text-secondary">{item.email}</p></td><td className="p-3 text-text-secondary">{item.registeredAt}</td><td className="p-3"><StatusBadge status={item.status}/></td><td className="p-3"><StatusBadge status={item.checkIn}/></td></tr>)}</tbody></table></div>:<Empty text="No one has registered for this event yet."/>}
      </Section>
    </TabsContent>

    <TabsContent value="attendees" className="mt-4">
      <Section title="Registered attendees" icon={Users} actionHref={`/admin/registrations?event=${event.id}`} actionLabel="Manage attendees">
        {event.attendees.length?<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{event.attendees.map(item=><div key={item.id} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-text-primary">{item.name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary"><Mail className="size-3.5"/>{item.email}</p>{item.telephone&&<p className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary"><Phone className="size-3.5"/>{item.telephone}</p>}</div><StatusBadge status={item.checkIn}/></div></div>)}</div>:<Empty text="No attendees are connected to this event yet."/>}
      </Section>
    </TabsContent>

    <TabsContent value="schedule" className="mt-4">
      <Section title="Event schedule" icon={CalendarClock} actionHref={`/admin/schedule?eventId=${event.id}`} actionLabel="Manage schedule">
        {event.schedule.length?<div className="space-y-3">{event.schedule.map(item=><div key={item.id} className="flex flex-col justify-between gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-text-primary">{item.title}</p>{item.description&&<p className="mt-1 text-sm text-text-secondary">{item.description}</p>}<div className="mt-2 flex flex-wrap gap-3 text-xs text-text-secondary"><span className="flex items-center gap-1"><Clock className="size-3.5"/>{item.date} · {item.startTime}{item.endTime?` – ${item.endTime}`:""}</span>{item.room&&<span className="flex items-center gap-1"><MapPin className="size-3.5"/>{item.room}</span>}{item.speaker&&<span className="flex items-center gap-1"><UserRound className="size-3.5"/>{item.speaker}</span>}</div></div>{item.createdByRole&&<Badge variant="outline">Added by {item.createdByRole==="Admin"?"Admin":item.createdBy||item.createdByRole}</Badge>}</div>)}</div>:<Empty text="No schedule items have been added to this event."/>}
      </Section>
    </TabsContent>

    <TabsContent value="speakers" className="mt-4">
      <Section title="Speakers and guests" icon={UserRound} actionHref="/admin/speakers" actionLabel="Manage speakers">
        {event.speakers.length?<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{event.speakers.map(item=><div key={item.id} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-text-primary">{item.name}</p><p className="text-sm text-primary">{item.title}</p></div><StatusBadge status={item.status}/></div>{item.organization&&<p className="mt-2 text-sm text-text-secondary">{item.organization}</p>}<p className="mt-2 text-xs text-text-secondary">{item.email}</p><Badge variant="outline" className="mt-3">{item.type}</Badge></div>)}</div>:<Empty text="No speakers or guests have been assigned to this event."/>}
      </Section>
    </TabsContent>

    <TabsContent value="check-in" className="mt-4">
      <Section title="Completed check-ins" icon={CheckCircle2} actionHref={`/admin/registrations?event=${event.id}`} actionLabel="Manage check-ins">
        {event.checkIns.length?<div className="space-y-2">{event.checkIns.map(item=><div key={item.id} className="flex flex-col justify-between gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-text-primary">{item.participant}</p><p className="font-mono text-xs text-primary">{item.referenceCode}</p></div><div className="text-sm sm:text-right"><p className="text-text-primary">{new Intl.DateTimeFormat("en",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.checkedInAt))}</p><p className="text-xs text-text-secondary">Verified by {item.verifiedBy||"Unknown administrator"}</p></div></div>)}</div>:<Empty text="No attendees have checked in to this event yet."/>}
      </Section>
    </TabsContent>
  </Tabs>;
}

function Section({title,icon:Icon,actionHref,actionLabel,children}:{title:string;icon:typeof Users;actionHref:string;actionLabel:string;children:React.ReactNode}) {
  return <Card className="gap-0 overflow-hidden py-0 shadow-none"><CardHeader className="flex flex-row items-center justify-between border-b py-4"><CardTitle className="flex items-center gap-2"><Icon className="size-4 text-primary"/>{title}</CardTitle><Button asChild size="sm" variant="outline"><Link href={actionHref}>{actionLabel}<ExternalLink/></Link></Button></CardHeader><CardContent className="p-4 sm:p-5">{children}</CardContent></Card>;
}

function Empty({text}:{text:string}) { return <div className="py-12 text-center text-sm text-text-secondary">{text}</div>; }
