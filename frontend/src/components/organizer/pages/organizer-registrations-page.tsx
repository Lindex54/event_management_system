/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { useSearchParams } from "next/navigation";import { CalendarCheck,CheckCircle2,ClipboardList,Eye,MoreHorizontal,XCircle } from "lucide-react";import { toast } from "sonner";import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";import { DataTable,type ManagementColumn } from "@/components/admin/shared/data-table";import { PageHeader } from "@/components/admin/shared/page-header";import { StatCards } from "@/components/admin/shared/stat-cards";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { organizerApi } from "@/lib/api/organizer";

interface Registration{id:number;referenceCode:string;attendee:string;email:string;eventId:number;event:string;registeredAt:string;status:"Confirmed"|"Pending"|"Cancelled";checkIn:"Checked In"|"Not Checked In";}
interface EventOption{id:number;name:string;}

export function OrganizerRegistrationsPage(){
  const searchParams=useSearchParams();
  const[records,setRecords]=React.useState<Registration[]>([]);
  const[events,setEvents]=React.useState<EventOption[]>([]);
  const[eventFilter,setEventFilter]=React.useState(searchParams.get("eventId")??"All");
  const[statusFilter,setStatusFilter]=React.useState("All");
  const[checkInFilter,setCheckInFilter]=React.useState("All");
  const[selected,setSelected]=React.useState<Registration>();
  const[cancelling,setCancelling]=React.useState<Registration>();
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  const load=React.useCallback(async()=>{
    try{
      const[regs,evts]=await Promise.all([organizerApi<Registration[]>("/registrations"),organizerApi<EventOption[]>("/events")]);
      setRecords(regs); setEvents(evts);
    }catch(e){ const message=e instanceof Error?e.message:"Unable to load registrations"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[]);
  React.useEffect(()=>{ void load(); },[load]);

  async function updateStatus(record:Registration,status:string,message:string){
    try{ await organizerApi(`/registrations/${record.id}/status`,{method:"PATCH",body:JSON.stringify({status})}); toast.success(message); await load(); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to update registration"); }
  }
  async function checkIn(record:Registration,checkedIn:boolean){
    try{ await organizerApi(`/registrations/${record.id}/check-in`,{method:"POST",body:JSON.stringify({checkedIn})}); toast.success(checkedIn?"Attendee checked in":"Check-in removed"); await load(); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to update check-in"); }
  }

  const filtered=records.filter(item=>(eventFilter==="All"||String(item.eventId)===eventFilter)&&(statusFilter==="All"||item.status===statusFilter)&&(checkInFilter==="All"||item.checkIn===checkInFilter));

  const columns:ManagementColumn<Registration>[]=[
    {id:"id",label:"Registration ID",accessor:r=>r.referenceCode,cell:r=><span className="font-mono text-xs font-semibold text-primary">{r.referenceCode}</span>},
    {id:"attendee",label:"Attendee",accessor:r=>`${r.attendee} ${r.email}`,cell:r=><div><p className="font-semibold text-text-primary">{r.attendee}</p><p className="text-xs">{r.email}</p></div>},
    {id:"event",label:"Event",accessor:r=>r.event},
    {id:"date",label:"Registration Date",accessor:r=>r.registeredAt},
    {id:"status",label:"Status",accessor:r=>r.status,cell:r=><StatusBadge status={r.status}/>},
    {id:"checkIn",label:"Check-in Status",accessor:r=>r.checkIn,cell:r=><StatusBadge status={r.checkIn}/>},
    {id:"actions",label:"",accessor:r=>r.id,sortable:false,className:"text-right",cell:r=>(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={()=>setSelected(r)}><Eye/> View details</DropdownMenuItem>
          <DropdownMenuItem disabled={r.status==="Confirmed"} onSelect={()=>void updateStatus(r,"Confirmed","Registration confirmed")}><CheckCircle2/> Confirm</DropdownMenuItem>
          <DropdownMenuItem disabled={r.checkIn==="Checked In"} onSelect={()=>void checkIn(r,true)}><CalendarCheck/> Check In</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" disabled={r.status==="Cancelled"} onSelect={()=>setCancelling(r)}><XCircle/> Cancel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Registrations" description="Manage registrations for your events." />
      <StatCards items={[
        {label:"Total Registrations",value:records.length,icon:ClipboardList},
        {label:"Confirmed",value:records.filter(x=>x.status==="Confirmed").length,icon:CheckCircle2},
        {label:"Pending",value:records.filter(x=>x.status==="Pending").length,icon:ClipboardList},
        {label:"Cancelled",value:records.filter(x=>x.status==="Cancelled").length,icon:XCircle},
        {label:"Checked In",value:records.filter(x=>x.checkIn==="Checked In").length,icon:CalendarCheck},
      ]}/>
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading registrations...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : (
        <DataTable
          data={filtered}
          columns={columns}
          getRowId={r=>String(r.id)}
          searchPlaceholder="Search name, email, event or reference..."
          toolbar={
            <>
              <Select value={eventFilter} onValueChange={setEventFilter}><SelectTrigger className="h-9 w-44 bg-surface"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="All">All events</SelectItem>{events.map(item=><SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue/></SelectTrigger><SelectContent>{["All","Confirmed","Pending","Cancelled"].map(item=><SelectItem key={item} value={item}>{item==="All"?"All statuses":item}</SelectItem>)}</SelectContent></Select>
              <Select value={checkInFilter} onValueChange={setCheckInFilter}><SelectTrigger className="h-9 w-40 bg-surface"><SelectValue/></SelectTrigger><SelectContent>{["All","Checked In","Not Checked In"].map(item=><SelectItem key={item} value={item}>{item==="All"?"All check-ins":item}</SelectItem>)}</SelectContent></Select>
            </>
          }
        />
      )}
      <Dialog open={Boolean(selected)} onOpenChange={o=>{if(!o)setSelected(undefined);}}>
        <DialogContent><DialogHeader><DialogTitle>Registration details</DialogTitle><DialogDescription>{selected?.referenceCode}</DialogDescription></DialogHeader>
          {selected&&<div className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4 text-sm"><Detail label="Attendee" value={selected.attendee}/><Detail label="Event" value={selected.event}/><Detail label="Email" value={selected.email}/><Detail label="Registered" value={selected.registeredAt}/><Detail label="Status" value={selected.status}/><Detail label="Check-in" value={selected.checkIn}/></div>}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(cancelling)}
        onOpenChange={o=>{if(!o)setCancelling(undefined);}}
        title="Cancel this registration?"
        description="The attendee's spot will be released. This does not delete their registration history."
        actionLabel="Cancel Registration"
        onConfirm={()=>{ if(cancelling) void updateStatus(cancelling,"Cancelled","Registration cancelled").then(()=>setCancelling(undefined)); }}
      />
    </div>
  );
}

function Detail({label,value}:{label:string;value:string}){return <div><p className="text-text-secondary">{label}</p><p className="font-semibold text-text-primary">{value}</p></div>}
