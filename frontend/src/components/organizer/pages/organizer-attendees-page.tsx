/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { useSearchParams } from "next/navigation";import { CalendarCheck,Eye,Link2,MoreHorizontal,Users } from "lucide-react";import { toast } from "sonner";import { InvitePeopleDialog } from "@/components/organizer/invite-people-dialog";import { DataTable,type ManagementColumn } from "@/components/admin/shared/data-table";import { PageHeader } from "@/components/admin/shared/page-header";import { StatCards } from "@/components/admin/shared/stat-cards";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { organizerApi } from "@/lib/api/organizer";

interface Attendee{id:number;name:string;email:string;telephone:string|null;eventsRegistered:number;events:string;eventIds:string;lastRegistration:string;attendance:number;}

export function OrganizerAttendeesPage(){
  const searchParams=useSearchParams();
  const eventId=searchParams.get("eventId");
  const[records,setRecords]=React.useState<Attendee[]>([]);
  const[selected,setSelected]=React.useState<Attendee>();
  const[inviting,setInviting]=React.useState(false);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  const load=React.useCallback(async()=>{
    setLoading(true);
    try{ setRecords(await organizerApi<Attendee[]>(eventId?`/attendees?eventId=${eventId}`:"/attendees")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load attendees"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventId]);
  React.useEffect(()=>{ void load(); },[load]);

  const columns=React.useMemo<ManagementColumn<Attendee>[]>(()=>[
    {id:"name",label:"Name",accessor:r=>`${r.name} ${r.email}`,cell:r=><div><p className="font-semibold text-text-primary">{r.name}</p><p className="text-xs">{r.email}</p></div>},
    {id:"telephone",label:"Telephone",accessor:r=>r.telephone??"—"},
    {id:"events",label:"Event(s)",accessor:r=>r.events,cell:r=><span className="whitespace-normal">{r.events}</span>},
    {id:"attendance",label:"Attendance",accessor:r=>r.attendance,cell:r=><StatusBadge status={r.attendance>0?"Checked In":"Not Checked In"}/>},
    {id:"last",label:"Last Registration",accessor:r=>r.lastRegistration},
    {id:"actions",label:"",accessor:r=>r.id,sortable:false,className:"text-right",cell:r=>(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={()=>setSelected(r)}><Eye/> View attendee</DropdownMenuItem>
          <DropdownMenuItem asChild><a href="/organizer/registrations"><CalendarCheck/> View registrations</a></DropdownMenuItem>
          <DropdownMenuItem onSelect={()=>setInviting(true)}><Link2/> Invite to Event</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ],[]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Attendees" description={eventId?"Attendees registered for this event.":"Attendees across all of your events."} />
      <StatCards items={[
        {label:"Total Attendees",value:records.length,icon:Users},
        {label:"Have Attended",value:records.filter(x=>x.attendance>0).length,icon:CalendarCheck},
      ]}/>
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading attendees...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : records.length ? (
        <DataTable data={records} columns={columns} getRowId={r=>String(r.id)} searchPlaceholder="Search name, email or event..."/>
      ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No attendees yet.</div>}

      <Dialog open={Boolean(selected)} onOpenChange={o=>{if(!o)setSelected(undefined);}}>
        <DialogContent><DialogHeader><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>{selected?.email}</DialogDescription></DialogHeader>
          {selected&&<div className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4 text-sm"><Detail label="Telephone" value={selected.telephone??"—"}/><Detail label="Events Registered" value={String(selected.eventsRegistered)}/><Detail label="Event(s)" value={selected.events}/><Detail label="Last Registration" value={selected.lastRegistration}/></div>}
        </DialogContent>
      </Dialog>
      <InvitePeopleDialog open={inviting} onOpenChange={setInviting}/>
    </div>
  );
}

function Detail({label,value}:{label:string;value:string}){return <div><p className="text-text-secondary">{label}</p><p className="font-semibold text-text-primary">{value}</p></div>}
