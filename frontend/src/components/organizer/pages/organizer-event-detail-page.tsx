/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import Link from "next/link";import { CalendarDays,ChevronLeft,Copy,MapPin,Pencil,Users } from "lucide-react";import { toast } from "sonner";import { CreateEventDialog,type OrganizerEventRecord } from "@/components/organizer/create-event-dialog";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Input } from "@/components/ui/input";import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";import { organizerApi } from "@/lib/api/organizer";

type EventDetail=OrganizerEventRecord&{slug:string;dateLabel:string;venue:string|null;registrations:number;description?:string|null};
interface Registration{id:number;referenceCode:string;attendee:string;email:string;registeredAt:string;status:string;checkIn:string;}
interface Attendee{id:number;name:string;email:string;telephone:string|null;lastRegistration:string;attendance:number;}
interface ScheduleItem{id:number;title:string;description:string|null;date:string;startTime:string;endTime:string|null;room:string|null;speaker:string;}
interface Speaker{id:number;name:string;title:string;organization:string|null;type:string;status:string;email:string;}

export function OrganizerEventDetailPage({eventId}:{eventId:number}){
  const[event,setEvent]=React.useState<EventDetail|null>(null);
  const[registrations,setRegistrations]=React.useState<Registration[]>([]);
  const[attendees,setAttendees]=React.useState<Attendee[]>([]);
  const[schedule,setSchedule]=React.useState<ScheduleItem[]>([]);
  const[speakers,setSpeakers]=React.useState<Speaker[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[editOpen,setEditOpen]=React.useState(false);

  const load=React.useCallback(async()=>{
    try{
      const[ev,regs,atts,sched,spk]=await Promise.all([
        organizerApi<EventDetail>(`/events/${eventId}`),
        organizerApi<Registration[]>(`/registrations?eventId=${eventId}`),
        organizerApi<Attendee[]>(`/attendees?eventId=${eventId}`),
        organizerApi<ScheduleItem[]>(`/schedule?eventId=${eventId}`),
        organizerApi<Speaker[]>(`/speakers?eventId=${eventId}`),
      ]);
      setEvent(ev); setRegistrations(regs); setAttendees(atts); setSchedule(sched); setSpeakers(spk);
    }catch(e){ const message=e instanceof Error?e.message:"Unable to load this event"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventId]);
  React.useEffect(()=>{ void load(); },[load]);

  async function copyLink(){
    if(!event) return;
    try{ await navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`); toast.success("Registration link copied"); }
    catch{ toast.error("Could not copy the link"); }
  }

  if(loading) return <div className="mx-auto max-w-[1400px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading event...</div></div>;
  if(error||!event) return <div className="mx-auto max-w-[1400px] p-4 sm:p-6"><Card><CardContent className="space-y-4 p-8 text-center"><p className="text-danger">{error??"Event not found."}</p><Button asChild variant="outline"><Link href="/organizer/events"><ChevronLeft/> Back to events</Link></Button></CardContent></Card></div>;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title={event.name}
        description={`${event.dateLabel}${event.venue?` · ${event.venue}`:""}`}
        actions={<div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link href="/organizer/events"><ChevronLeft/> All Events</Link></Button><Button variant="outline" onClick={()=>void copyLink()}><Copy/> Copy Link</Button><Button onClick={()=>setEditOpen(true)}><Pencil/> Edit</Button></div>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary icon={CalendarDays} label="Date & time" value={`${event.dateLabel}${event.time?`, ${event.time}${event.endTime?` – ${event.endTime}`:""}`:""}`}/>
        <Summary icon={MapPin} label="Venue" value={event.venue??"Not set"}/>
        <Summary icon={Users} label="Registrations" value={`${event.registrations} / ${event.capacity}`}/>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations ({registrations.length})</TabsTrigger>
          <TabsTrigger value="attendees">Attendees ({attendees.length})</TabsTrigger>
          <TabsTrigger value="schedule">Schedule ({schedule.length})</TabsTrigger>
          <TabsTrigger value="speakers">Speakers & Guests ({speakers.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="shadow-none"><CardContent className="space-y-4 p-6">
            <StatusBadge status={event.status}/>
            {event.theme && <p className="font-medium text-text-primary">{event.theme}</p>}
            <p className="text-sm leading-6 text-text-secondary">{event.description||"No event description has been added yet."}</p>
            <p className="text-xs text-text-secondary">Time zone: {event.timezone}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="registrations" className="mt-4">
          {registrations.length ? (
            <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/40 text-xs text-text-secondary"><tr><Th>Attendee</Th><Th>Registered</Th><Th>Status</Th><Th>Check-in</Th></tr></thead>
              <tbody className="divide-y divide-border">{registrations.map(r=><tr key={r.id}><Td><p className="font-semibold text-text-primary">{r.attendee}</p><p className="text-xs">{r.email}</p></Td><Td>{r.registeredAt}</Td><Td><StatusBadge status={r.status}/></Td><Td><StatusBadge status={r.checkIn}/></Td></tr>)}</tbody>
            </table></div></div>
          ) : <Empty text="No registrations for this event yet."/>}
          <div className="mt-3 text-right"><Link href={`/organizer/registrations?eventId=${eventId}`} className="text-xs font-semibold text-primary hover:underline">Manage registrations →</Link></div>
        </TabsContent>

        <TabsContent value="attendees" className="mt-4">
          {attendees.length ? (
            <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-xs text-text-secondary"><tr><Th>Name</Th><Th>Email</Th><Th>Telephone</Th><Th>Attendance</Th></tr></thead>
              <tbody className="divide-y divide-border">{attendees.map(a=><tr key={a.id}><Td className="font-semibold text-text-primary">{a.name}</Td><Td>{a.email}</Td><Td>{a.telephone??"—"}</Td><Td>{a.attendance?"Attended":"Not yet"}</Td></tr>)}</tbody>
            </table></div></div>
          ) : <Empty text="No attendees for this event yet."/>}
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          {schedule.length ? (
            <div className="space-y-2.5">{schedule.map(item=>(
              <Card key={item.id}><CardContent className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-text-primary">{item.title}</p>{item.description&&<p className="text-xs text-text-secondary">{item.description}</p>}</div><div className="flex flex-wrap gap-3 text-xs text-text-secondary"><span>{item.startTime}{item.endTime?` – ${item.endTime}`:""}</span>{item.room&&<span>{item.room}</span>}{item.speaker&&<span>{item.speaker}</span>}</div></CardContent></Card>
            ))}</div>
          ) : <Empty text="No schedule items yet."/>}
          <div className="mt-3 text-right"><Link href={`/organizer/schedule?eventId=${eventId}`} className="text-xs font-semibold text-primary hover:underline">Manage schedule →</Link></div>
        </TabsContent>

        <TabsContent value="speakers" className="mt-4">
          {speakers.length ? (
            <div className="grid gap-3 sm:grid-cols-2">{speakers.map(s=>(
              <Card key={s.id}><CardContent className="flex items-center justify-between gap-3 p-4"><div><p className="font-semibold text-text-primary">{s.name}</p><p className="text-xs text-text-secondary">{s.title}{s.organization?` · ${s.organization}`:""}</p></div><StatusBadge status={s.status}/></CardContent></Card>
            ))}</div>
          ) : <Empty text="No speakers or guests assigned yet."/>}
          <div className="mt-3 text-right"><Link href={`/organizer/speakers?eventId=${eventId}`} className="text-xs font-semibold text-primary hover:underline">Manage speakers →</Link></div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <Card className="shadow-none"><CardContent className="space-y-3 p-6">
            <p className="text-sm text-text-secondary">Share this link so people can register for {event.name}.</p>
            <div className="flex gap-2"><Input readOnly value={`${typeof window!=="undefined"?window.location.origin:""}/events/${event.slug}`} className="h-10"/><Button variant="outline" size="icon-lg" onClick={()=>void copyLink()}><Copy/></Button></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <CreateEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} onSaved={load}/>
    </div>
  );
}

function Summary({icon:Icon,label,value}:{icon:typeof CalendarDays;label:string;value:string}){return <Card className="shadow-none"><CardContent className="flex gap-3"><Icon className="size-5 shrink-0 text-primary"/><div><p className="text-xs text-text-secondary">{label}</p><p className="mt-1 font-semibold text-text-primary">{value}</p></div></CardContent></Card>}
function Th({children}:{children:React.ReactNode}){return <th className="px-4 py-3 text-left font-medium">{children}</th>}
function Td({children,className}:{children:React.ReactNode;className?:string}){return <td className={`px-4 py-3.5 text-text-secondary ${className??""}`}>{children}</td>}
function Empty({text}:{text:string}){return <div className="rounded-xl bg-surface p-8 text-center text-sm text-text-secondary ring-1 ring-foreground/10">{text}</div>}
