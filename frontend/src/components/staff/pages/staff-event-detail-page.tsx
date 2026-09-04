"use client";
import * as React from "react";import Link from "next/link";import { CalendarDays,MapPin,ScanLine,Users } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { staffApi } from "@/lib/api/staff";

interface StaffEvent{id:number;name:string;date:string;dateLabel:string;time:string;endTime:string|null;status:string;venue:string|null;registrations:number;checkedIn:number;}

export function StaffEventDetailPage({eventId}:{eventId:number}){
  const[event,setEvent]=React.useState<StaffEvent|null>(null);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{
    void staffApi<StaffEvent>(`/events/${eventId}`)
      .then(setEvent)
      .catch(e=>{ const message=e instanceof Error?e.message:"Unable to load event"; setError(message); toast.error(message); })
      .finally(()=>setLoading(false));
  },[eventId]);

  if(loading) return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading event...</div></div>;
  if(error||!event) return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error??"Event not found or not assigned to you."}</div></div>;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title={event.name} description="Assigned event details." actions={<StatusBadge status={event.status}/>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 text-text-secondary"><CalendarDays className="size-4"/>{event.dateLabel} · {event.time}{event.endTime?` – ${event.endTime}`:""}</div>
            <div className="flex items-center gap-2 text-text-secondary"><MapPin className="size-4"/>{event.venue??"Venue not set"}</div>
            <div className="flex items-center gap-2 text-text-secondary"><Users className="size-4"/>{event.checkedIn} of {event.registrations} confirmed registrations checked in</div>
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
    </div>
  );
}
