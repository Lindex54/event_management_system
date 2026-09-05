/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { useSearchParams } from "next/navigation";import { CheckCircle2,MoreHorizontal,UserRoundSearch } from "lucide-react";import { toast } from "sonner";import { DataTable,type ManagementColumn } from "@/components/admin/shared/data-table";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { staffApi } from "@/lib/api/staff";

interface StaffEvent{id:number;name:string;}
interface StaffAttendee{id:number;referenceCode:string;attendee:string;email:string;eventId:number;event:string;status:"Confirmed"|"Pending"|"Cancelled";checkInStatus:"Checked In"|"Not Checked In";checkedInAt:string|null;}

export function StaffAttendeesPage(){
  const searchParams=useSearchParams();
  const[events,setEvents]=React.useState<StaffEvent[]>([]);
  const[eventId,setEventId]=React.useState<string>(searchParams.get("eventId")??"all");
  const[records,setRecords]=React.useState<StaffAttendee[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[selected,setSelected]=React.useState<StaffAttendee|null>(null);

  React.useEffect(()=>{ void staffApi<StaffEvent[]>("/events").then(setEvents).catch(()=>undefined); },[]);

  const load=React.useCallback(async()=>{
    setLoading(true);
    try{
      const path=eventId&&eventId!=="all"?`/attendees?eventId=${eventId}`:"/attendees";
      setRecords(await staffApi<StaffAttendee[]>(path));
    }catch(e){ const message=e instanceof Error?e.message:"Unable to load attendees"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventId]);
  React.useEffect(()=>{ void load(); },[load]);

  async function confirmRegistration(registration:StaffAttendee){
    try{
      await staffApi(`/registrations/${registration.id}/status`,{method:"PATCH",body:JSON.stringify({status:"Confirmed"})});
      toast.success("Registration confirmed");
      setRecords(current=>current.map(r=>r.id===registration.id?{...r,status:"Confirmed"}:r));
      setSelected(current=>current&&current.id===registration.id?{...current,status:"Confirmed"}:current);
    }catch(e){ toast.error(e instanceof Error?e.message:"Unable to confirm registration"); }
  }

  const columns=React.useMemo<ManagementColumn<StaffAttendee>[]>(()=>[
    {id:"attendee",label:"Attendee",accessor:r=>`${r.attendee} ${r.email}`,cell:r=><div><p className="font-semibold text-text-primary">{r.attendee}</p><p className="text-xs text-text-secondary">{r.email}</p></div>},
    {id:"event",label:"Event",accessor:r=>r.event},
    {id:"reference",label:"Registration ID",accessor:r=>r.referenceCode},
    {id:"status",label:"Registration Status",accessor:r=>r.status,cell:r=><StatusBadge status={r.status}/>},
    {id:"checkIn",label:"Check-in Status",accessor:r=>r.checkInStatus,cell:r=><StatusBadge status={r.checkInStatus}/>},
    {id:"actions",label:"",accessor:r=>r.id,sortable:false,className:"text-right",cell:r=>(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={()=>setSelected(r)}><UserRoundSearch/> View Registration</DropdownMenuItem>
          <DropdownMenuItem disabled={r.status==="Confirmed"} onSelect={()=>void confirmRegistration(r)}><CheckCircle2/> Confirm</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ],[]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Attendees"
        description="Attendees registered across your assigned events."
        actions={
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger className="h-9 w-56"><SelectValue placeholder="All assigned events"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assigned events</SelectItem>
              {events.map(e=><SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
      {loading ? <Loading/> : error ? <ErrorState message={error}/> : records.length ? (
        <DataTable data={records} columns={columns} getRowId={r=>String(r.id)} searchPlaceholder="Search attendee, email, or registration ID..."/>
      ) : <Empty/>}

      <Dialog open={Boolean(selected)} onOpenChange={open=>{ if(!open) setSelected(null); }}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.attendee}</DialogTitle>
                <DialogDescription>{selected.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Event</span><span className="font-medium text-text-primary">{selected.event}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Registration ID</span><span className="font-medium text-text-primary">{selected.referenceCode}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Registration Status</span><StatusBadge status={selected.status}/></div>
                <div className="flex justify-between"><span className="text-text-secondary">Check-in Status</span><StatusBadge status={selected.checkInStatus}/></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Loading(){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading attendees...</div>}
function ErrorState({message}:{message:string}){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{message}</div>}
function Empty(){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No attendees found for this selection.</div>}
