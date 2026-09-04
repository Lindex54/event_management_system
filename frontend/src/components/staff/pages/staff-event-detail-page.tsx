"use client";
import * as React from "react";import Link from "next/link";import { CalendarDays,Copy,MapPin,Pencil,ScanLine,Users } from "lucide-react";import { toast } from "sonner";import { CreateEventDialog,type OrganizerEventRecord } from "@/components/organizer/create-event-dialog";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { staffApi } from "@/lib/api/staff";

type StaffEvent=OrganizerEventRecord&{slug:string;dateLabel:string;venue:string|null;registrations:number;checkedIn:number;description?:string|null;};

export function StaffEventDetailPage({eventId}:{eventId:number}){
  const[event,setEvent]=React.useState<StaffEvent|null>(null);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[editOpen,setEditOpen]=React.useState(false);

  const load=React.useCallback(async()=>{
    try{ setEvent(await staffApi<StaffEvent>(`/events/${eventId}`)); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load event"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventId]);
  React.useEffect(()=>{ void load(); },[load]);

  async function copyLink(){
    if(!event) return;
    try{ await navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`); toast.success("Registration link copied"); }
    catch{ toast.error("Could not copy the link"); }
  }

  if(loading) return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading event...</div></div>;
  if(error||!event) return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error??"Event not found or not assigned to you."}</div></div>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title={event.name} description="Assigned event details — you are a co-organizer for this event." actions={<div className="flex items-center gap-2"><StatusBadge status={event.status}/><Button size="sm" variant="outline" onClick={()=>void copyLink()}><Copy/>Copy Link</Button><Button size="sm" onClick={()=>setEditOpen(true)}><Pencil/>Edit</Button></div>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 text-text-secondary"><CalendarDays className="size-4"/>{event.dateLabel} · {event.time}{event.endTime?` – ${event.endTime}`:""}</div>
            <div className="flex items-center gap-2 text-text-secondary"><MapPin className="size-4"/>{event.venue??"Venue not set"}</div>
            <div className="flex items-center gap-2 text-text-secondary"><Users className="size-4"/>{event.checkedIn} of {event.registrations} confirmed registrations checked in</div>
            {event.description && <p className="border-t border-border pt-3 leading-6 text-text-secondary">{event.description}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2.5 p-5">
            <Button asChild className="justify-start"><Link href={`/staff/check-in?eventId=${event.id}`}><ScanLine/>Start Check-in</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href={`/staff/attendees?eventId=${event.id}`}><Users/>View Attendees</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href={`/staff/schedule?eventId=${event.id}`}><CalendarDays/>View Schedule</Link></Button>
          </CardContent>
        </Card>
      </div>
      <CreateEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} onSaved={load} api={staffApi} showCoOrganizers={false}/>
    </div>
  );
}
