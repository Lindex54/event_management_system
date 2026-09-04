/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import Link from "next/link";import { format } from "date-fns";import { CalendarCheck,CalendarDays,CalendarPlus,CircleX,Clock3,Copy,Eye,Mic2,MoreHorizontal,Pencil,UserPlus,Users } from "lucide-react";import { toast } from "sonner";import { CreateEventDialog,type OrganizerEventRecord } from "@/components/organizer/create-event-dialog";import { InvitePeopleDialog } from "@/components/organizer/invite-people-dialog";import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";import { DataTable,type ManagementColumn } from "@/components/admin/shared/data-table";import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";import { PageHeader } from "@/components/admin/shared/page-header";import { StatCards } from "@/components/admin/shared/stat-cards";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { organizerApi } from "@/lib/api/organizer";

export type OrganizerEvent=OrganizerEventRecord&{slug:string;dateLabel:string;venue:string|null;registrations:number};

export function OrganizerEventsPage(){
  const[events,setEvents]=React.useState<OrganizerEvent[]>([]);
  const[status,setStatus]=React.useState("All");
  const[venue,setVenue]=React.useState("All");
  const[date,setDate]=React.useState<Date>();
  const[editing,setEditing]=React.useState<OrganizerEvent>();
  const[cancelling,setCancelling]=React.useState<OrganizerEvent>();
  const[inviting,setInviting]=React.useState<OrganizerEvent>();
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  const load=React.useCallback(async()=>{
    try{ setEvents(await organizerApi<OrganizerEvent[]>("/events")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load events"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[]);
  React.useEffect(()=>{ void load(); },[load]);

  const filtered=events.filter(item=>(status==="All"||item.status===status)&&(venue==="All"||item.venue===venue)&&(!date||item.date.slice(0,10)===format(date,"yyyy-MM-dd")));
  const venues=[...new Set(events.map(item=>item.venue).filter((v):v is string=>Boolean(v)))];

  async function copyLink(item:OrganizerEvent){
    try{ await navigator.clipboard.writeText(`${window.location.origin}/events/${item.slug}`); toast.success("Registration link copied"); }
    catch{ toast.error("Could not copy the link"); }
  }
  async function cancelEvent(item:OrganizerEvent){
    try{ await organizerApi(`/events/${item.id}/cancel`,{method:"PATCH"}); toast.success("Event cancelled"); setCancelling(undefined); await load(); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to cancel event"); }
  }

  const columns=React.useMemo<ManagementColumn<OrganizerEvent>[]>(()=>[
    {id:"event",label:"Event",accessor:r=>r.name,cell:r=><Link href={`/organizer/events/${r.id}`} className="font-semibold text-text-primary hover:text-primary">{r.name}</Link>},
    {id:"date",label:"Date",accessor:r=>r.date,cell:r=>r.dateLabel},
    {id:"time",label:"Time",accessor:r=>r.time??"",cell:r=>r.time?`${r.time}${r.endTime?` – ${r.endTime}`:""}`:"Not set"},
    {id:"venue",label:"Venue",accessor:r=>r.venue??"—"},
    {id:"registrations",label:"Registrations",accessor:r=>Number(r.registrations)},
    {id:"capacity",label:"Capacity",accessor:r=>Number(r.capacity)},
    {id:"status",label:"Status",accessor:r=>r.status,cell:r=><StatusBadge status={r.status}/>},
    {id:"actions",label:"",accessor:r=>r.id,sortable:false,className:"text-right",cell:r=>(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild><Link href={`/organizer/events/${r.id}`}><Eye/> View</Link></DropdownMenuItem>
          <DropdownMenuItem onSelect={()=>setEditing(r)}><Pencil/> Edit</DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/organizer/registrations?eventId=${r.id}`}><CalendarCheck/> View Registrations</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/organizer/attendees?eventId=${r.id}`}><Users/> View Attendees</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/organizer/schedule?eventId=${r.id}`}><CalendarDays/> Schedule</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/organizer/speakers?eventId=${r.id}`}><Mic2/> Speakers</Link></DropdownMenuItem>
          <DropdownMenuSeparator/>
          <DropdownMenuItem onSelect={()=>void copyLink(r)}><Copy/> Copy Registration Link</DropdownMenuItem>
          <DropdownMenuItem onSelect={()=>setInviting(r)}><UserPlus/> Invite People</DropdownMenuItem>
          <DropdownMenuSeparator/>
          <DropdownMenuItem variant="destructive" disabled={r.status==="Cancelled"} onSelect={()=>setCancelling(r)}><CircleX/> Cancel Event</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ],[]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title="My Events" description="Create and manage every event you organize." actions={<CreateEventDialog trigger={<Button><CalendarPlus/> Create Event</Button>} onSaved={load}/>} />
      <StatCards items={[
        {label:"Total Events",value:events.length,icon:CalendarDays},
        {label:"Upcoming",value:events.filter(x=>x.status==="Upcoming").length,icon:Clock3},
        {label:"Active",value:events.filter(x=>x.status==="Active").length,icon:CalendarCheck},
        {label:"Completed",value:events.filter(x=>x.status==="Completed").length,icon:CalendarCheck},
        {label:"Cancelled",value:events.filter(x=>x.status==="Cancelled").length,icon:CircleX},
      ]}/>
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading events...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={r=>String(r.id)}
          searchPlaceholder="Search event or venue..."
          toolbar={
            <>
              <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All">All statuses</SelectItem>{["Draft","Upcoming","Active","Completed","Cancelled"].map(item=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
              <Select value={venue} onValueChange={setVenue}><SelectTrigger className="h-9 w-44 bg-surface"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All">All venues</SelectItem>{venues.map(item=><SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
              <DatePickerFilter value={date} onChange={setDate} label="Event date"/>
              {(status!=="All"||venue!=="All"||date)&&<Button variant="ghost" onClick={()=>{setStatus("All");setVenue("All");setDate(undefined);}}>Clear</Button>}
            </>
          }
        />
      )}
      {editing&&<CreateEventDialog key={editing.id} event={editing} open onOpenChange={o=>{if(!o)setEditing(undefined);}} onSaved={load}/>}
      {inviting&&<InvitePeopleDialog eventId={inviting.id} open onOpenChange={o=>{if(!o)setInviting(undefined);}}/>}
      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={o=>{if(!o)setCancelling(undefined);}}
        title="Cancel this event?"
        description="Registration history remains available, but the event status will become Cancelled and attendees will no longer be able to register."
        actionLabel="Cancel Event"
        onConfirm={()=>{ if(cancelling) void cancelEvent(cancelling); }}
      />
    </div>
  );
}
