/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import Link from "next/link";import { CalendarDays,Eye,MoreHorizontal,ScanLine,Users } from "lucide-react";import { toast } from "sonner";import { DataTable,type ManagementColumn } from "@/components/admin/shared/data-table";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";import { staffApi } from "@/lib/api/staff";

interface StaffEvent{id:number;name:string;slug:string;date:string;dateLabel:string;time:string;endTime:string|null;status:string;venue:string|null;registrations:number;checkedIn:number;}

export function StaffEventsPage(){
  const[records,setRecords]=React.useState<StaffEvent[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  const load=React.useCallback(async()=>{
    try{ setRecords(await staffApi<StaffEvent[]>("/events")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load assigned events"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[]);
  React.useEffect(()=>{ void load(); },[load]);

  const columns=React.useMemo<ManagementColumn<StaffEvent>[]>(()=>[
    {id:"event",label:"Event",accessor:r=>r.name,cell:r=><p className="font-semibold text-text-primary">{r.name}</p>},
    {id:"date",label:"Date",accessor:r=>r.date,cell:r=>r.dateLabel},
    {id:"time",label:"Time",accessor:r=>r.time,cell:r=>r.endTime?`${r.time} – ${r.endTime}`:r.time},
    {id:"venue",label:"Venue",accessor:r=>r.venue??"—"},
    {id:"registrations",label:"Registrations",accessor:r=>r.registrations},
    {id:"checkedIn",label:"Checked In",accessor:r=>r.checkedIn},
    {id:"status",label:"Status",accessor:r=>r.status,cell:r=><StatusBadge status={r.status}/>},
    {id:"actions",label:"",accessor:r=>r.id,sortable:false,className:"text-right",cell:r=>(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/staff/events/${r.id}`}><Eye/> View Event</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/staff/check-in?eventId=${r.id}`}><ScanLine/> Start Check-in</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/staff/attendees?eventId=${r.id}`}><Users/> View Attendees</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/staff/schedule?eventId=${r.id}`}><CalendarDays/> View Schedule</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ],[]);

  const today=new Date().toISOString().slice(0,10);
  const upcoming=records.filter(r=>r.date>=today);
  const past=records.filter(r=>r.date<today);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Assigned Events" description="Events you have been assigned to work." />
      {loading ? <Loading/> : error ? <ErrorState message={error}/> : records.length ? (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4">
            {upcoming.length ? <DataTable data={upcoming} columns={columns} getRowId={r=>String(r.id)} searchPlaceholder="Search event or venue..."/> : <Empty text="No upcoming assigned events."/>}
          </TabsContent>
          <TabsContent value="past" className="mt-4">
            {past.length ? <DataTable data={past} columns={columns} getRowId={r=>String(r.id)} searchPlaceholder="Search event or venue..."/> : <Empty text="No past assigned events."/>}
          </TabsContent>
        </Tabs>
      ) : <Empty/>}
    </div>
  );
}

function Loading(){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading assigned events...</div>}
function ErrorState({message}:{message:string}){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{message}</div>}
function Empty({text}:{text?:string}={}){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">{text??"You have not been assigned to any events yet."}</div>}
