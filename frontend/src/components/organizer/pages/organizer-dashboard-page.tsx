/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import Link from "next/link";import { CalendarCheck,CalendarDays,CalendarPlus,Clock3,Copy,Eye,Link2,ListChecks,MoreHorizontal,Pencil,UserCheck,Users } from "lucide-react";import { toast } from "sonner";import { CreateEventDialog } from "@/components/organizer/create-event-dialog";import { InvitePeopleDialog } from "@/components/organizer/invite-people-dialog";import { ChartCard } from "@/components/admin/shared/chart-card";import { PageHeader } from "@/components/admin/shared/page-header";import { StatCards } from "@/components/admin/shared/stat-cards";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { Tabs,TabsList,TabsTrigger } from "@/components/ui/tabs";import { organizerApi } from "@/lib/api/organizer";

interface Stats{totalEvents:number;upcomingEvents:number;totalRegistrations:number;totalAttendees:number;eventsToday:number;averageAttendance:string|number|null;}
interface StatusCount{status:string;value:number;}
interface UpcomingEvent{id:number;name:string;slug:string;dateLabel:string;time:string|null;endTime:string|null;venue:string|null;capacity:number;status:string;registrations:number;}
interface Dashboard{stats:Stats;statuses:StatusCount[];upcoming:UpcomingEvent[];}
interface TrendPoint{date:string;label:string;value:number;}

const statusOrder=["Draft","Upcoming","Active","Completed","Cancelled"];
const rangeOptions=[{value:"7d",label:"7 Days"},{value:"30d",label:"30 Days"},{value:"90d",label:"90 Days"}];

export function OrganizerDashboardPage(){
  const[data,setData]=React.useState<Dashboard|null>(null);
  const[range,setRange]=React.useState("7d");
  const[trend,setTrend]=React.useState<TrendPoint[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[trendLoading,setTrendLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[createOpen,setCreateOpen]=React.useState(false);
  const[inviteOpen,setInviteOpen]=React.useState(false);

  const load=React.useCallback(async()=>{
    try{ setData(await organizerApi<Dashboard>("/dashboard")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load dashboard"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[]);
  React.useEffect(()=>{ void load(); },[load]);

  React.useEffect(()=>{
    setTrendLoading(true);
    void organizerApi<TrendPoint[]>(`/dashboard/registration-trends?range=${range}`)
      .then(setTrend)
      .catch(()=>toast.error("Unable to load registration trend"))
      .finally(()=>setTrendLoading(false));
  },[range]);

  async function copyLink(slug:string){
    try{ await navigator.clipboard.writeText(`${window.location.origin}/events/${slug}`); toast.success("Registration link copied"); }
    catch{ toast.error("Could not copy the link"); }
  }

  if(loading) return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading dashboard...</div></div>;
  if(error||!data) return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div></div>;

  const statusMap=new Map(data.statuses.map(s=>[s.status,s.value]));
  const statusCategories=statusOrder.filter(s=>statusMap.has(s));
  const statusSeries=statusCategories.map(s=>statusMap.get(s)??0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Organizer Dashboard"
        description="What's happening with your events."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="bg-surface" onClick={()=>setInviteOpen(true)}><Link2/>Invite People</Button>
            <Button asChild variant="outline" className="bg-surface"><Link href="/organizer/registrations"><ListChecks/>View Registrations</Link></Button>
            <Button onClick={()=>setCreateOpen(true)}><CalendarPlus/>Create Event</Button>
          </div>
        }
      />

      <StatCards items={[
        {label:"Total Events",value:data.stats.totalEvents,icon:CalendarDays},
        {label:"Upcoming Events",value:data.stats.upcomingEvents,icon:Clock3},
        {label:"Events Today",value:data.stats.eventsToday,icon:CalendarCheck},
        {label:"Total Registrations",value:data.stats.totalRegistrations,icon:ListChecks},
        {label:"Total Attendees",value:data.stats.totalAttendees,icon:Users},
        {label:"Attendance Rate",value:data.stats.averageAttendance!=null?`${data.stats.averageAttendance}%`:"—",icon:UserCheck},
      ]}/>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <Tabs value={range} onValueChange={setRange}>
            <TabsList className="ml-auto flex w-fit">{rangeOptions.map(o=><TabsTrigger key={o.value} value={o.value}>{o.label}</TabsTrigger>)}</TabsList>
          </Tabs>
          {trendLoading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading trend...</div> : (
            <ChartCard title="Registration Trend" description={`Registrations received over the last ${range.replace("d"," days")}`} type="area" categories={trend.map(t=>t.label)} series={[{name:"Registrations",data:trend.map(t=>t.value)}]} height={300}/>
          )}
        </div>
        {statusCategories.length>0 && (
          <ChartCard title="Event Status" description="Distribution of your events by status" type="donut" categories={statusCategories} series={statusSeries} height={300}/>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-text-primary">Upcoming Events</h3><Link href="/organizer/events" className="text-xs font-semibold text-primary hover:underline">View all</Link></div>
        {data.upcoming.length ? (
          <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-muted/40 text-xs text-text-secondary"><tr><Th>Event</Th><Th>Date</Th><Th>Time</Th><Th>Venue</Th><Th>Registrations</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
                <tbody className="divide-y divide-border">
                  {data.upcoming.map(event=>(
                    <tr key={event.id}>
                      <Td><Link href={`/organizer/events/${event.id}`} className="font-semibold text-text-primary hover:text-primary">{event.name}</Link></Td>
                      <Td>{event.dateLabel}</Td>
                      <Td>{event.time?`${event.time}${event.endTime?` – ${event.endTime}`:""}`:"Not set"}</Td>
                      <Td>{event.venue??"—"}</Td>
                      <Td><span className="font-medium text-text-primary">{event.registrations}</span><span className="text-text-secondary"> / {event.capacity}</span></Td>
                      <Td><StatusBadge status={event.status}/></Td>
                      <Td className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem asChild><Link href={`/organizer/events/${event.id}`}><Eye/> View</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/organizer/events/${event.id}?tab=overview&edit=1`}><Pencil/> Edit</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/organizer/registrations?eventId=${event.id}`}><ListChecks/> Registrations</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/organizer/attendees?eventId=${event.id}`}><Users/> Attendees</Link></DropdownMenuItem>
                            <DropdownMenuItem onSelect={()=>void copyLink(event.slug)}><Copy/> Copy Registration Link</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No upcoming events. Create one to get started.</div>}
      </div>

      <CreateEventDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={load}/>
      <InvitePeopleDialog open={inviteOpen} onOpenChange={setInviteOpen}/>
    </div>
  );
}

function Th({children,className}:{children:React.ReactNode;className?:string}){return <th className={`px-4 py-3 text-left font-medium ${className??""}`}>{children}</th>}
function Td({children,className}:{children:React.ReactNode;className?:string}){return <td className={`px-4 py-3.5 text-text-secondary ${className??""}`}>{children}</td>}
