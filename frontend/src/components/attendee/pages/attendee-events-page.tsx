/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import Link from "next/link";import { CalendarDays,Clock,ImageOff,MapPin,Ticket,UserPlus } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";import { attendeeApi } from "@/lib/api/attendee";

interface RegisteredEvent{eventId:number;name:string;slug:string;dateLabel:string;time:string;imageUrl:string|null;imageAlt:string|null;venue:string|null;eventStatus:string;registrationId:number;referenceCode:string;registrationStatus:string;checkInStatus:string;}
interface AvailableEvent{id:number;name:string;slug:string;dateLabel:string;time:string;imageUrl:string|null;imageAlt:string|null;venue:string|null;capacity:number;registeredCount:number;registrationId:number|null;registrationStatus:string|null;}

export function AttendeeEventsPage(){
  const[registered,setRegistered]=React.useState<RegisteredEvent[]>([]);
  const[available,setAvailable]=React.useState<AvailableEvent[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[registeringId,setRegisteringId]=React.useState<number|null>(null);

  const load=React.useCallback(async()=>{
    setLoading(true);
    try{
      const[reg,avail]=await Promise.all([attendeeApi<RegisteredEvent[]>("/events"),attendeeApi<AvailableEvent[]>("/events/available")]);
      setRegistered(reg); setAvailable(avail);
    }catch(e){ const message=e instanceof Error?e.message:"Unable to load events"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[]);
  React.useEffect(()=>{ void load(); },[load]);

  async function register(eventId:number){
    setRegisteringId(eventId);
    try{ await attendeeApi(`/events/${eventId}/register`,{method:"POST"}); toast.success("You are registered for this event"); await load(); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to register for this event"); }
    finally{ setRegisteringId(null); }
  }

  if(loading) return <div className="mx-auto max-w-[1400px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading events...</div></div>;
  if(error) return <div className="mx-auto max-w-[1400px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div></div>;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
      <PageHeader title="My Events" description="Events you're registered for, and new ones to discover." />
      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My Events ({registered.length})</TabsTrigger>
          <TabsTrigger value="explore">Explore Events ({available.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mine" className="mt-4">
          {registered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {registered.map(event=>(
                <Card key={event.registrationId} className="overflow-hidden py-0">
                  <EventImage url={event.imageUrl} alt={event.imageAlt??event.name}/>
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <h3 className="font-semibold text-text-primary">{event.name}</h3>
                      <div className="mt-1.5 flex flex-col gap-1 text-xs text-text-secondary">
                        <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5"/>{event.dateLabel}</span>
                        <span className="flex items-center gap-1.5"><Clock className="size-3.5"/>{event.time}</span>
                        {event.venue && <span className="flex items-center gap-1.5"><MapPin className="size-3.5"/>{event.venue}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5"><StatusBadge status={event.registrationStatus}/><StatusBadge status={event.eventStatus}/></div>
                    <div className="flex gap-2 pt-1">
                      <Button asChild size="sm" variant="outline" className="flex-1"><Link href="/attendee/registrations">Registration</Link></Button>
                      <Button asChild size="sm" className="flex-1"><Link href="/attendee/tickets"><Ticket/>Ticket</Link></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <Empty message="You haven't registered for any events yet. Explore events to get started."/>}
        </TabsContent>

        <TabsContent value="explore" className="mt-4">
          {available.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {available.map(event=>{
                const full=event.registeredCount>=event.capacity;
                const registeredAlready=Boolean(event.registrationId)&&event.registrationStatus!=="Cancelled";
                return (
                  <Card key={event.id} className="overflow-hidden py-0">
                    <EventImage url={event.imageUrl} alt={event.imageAlt??event.name}/>
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <h3 className="font-semibold text-text-primary">{event.name}</h3>
                        <div className="mt-1.5 flex flex-col gap-1 text-xs text-text-secondary">
                          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5"/>{event.dateLabel}</span>
                          <span className="flex items-center gap-1.5"><Clock className="size-3.5"/>{event.time}</span>
                          {event.venue && <span className="flex items-center gap-1.5"><MapPin className="size-3.5"/>{event.venue}</span>}
                        </div>
                      </div>
                      <Button size="sm" className="w-full" disabled={registeredAlready||full||registeringId===event.id} onClick={()=>void register(event.id)}>
                        <UserPlus/>{registeredAlready?"Already Registered":full?"Event Full":registeringId===event.id?"Registering...":"Register"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : <Empty message="No upcoming events are open for registration right now."/>}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EventImage({url,alt}:{url:string|null;alt:string}){
  if(url) return <img src={url} alt={alt} className="h-36 w-full object-cover"/>;
  return <div className="flex h-36 w-full items-center justify-center bg-muted text-text-secondary"><ImageOff className="size-6"/></div>;
}
function Empty({message}:{message:string}){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">{message}</div>}
