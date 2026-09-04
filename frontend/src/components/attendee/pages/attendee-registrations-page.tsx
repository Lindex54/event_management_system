/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import Link from "next/link";import { Eye,MoreHorizontal,XCircle } from "lucide-react";import { toast } from "sonner";import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";import { DataTable,type ManagementColumn } from "@/components/admin/shared/data-table";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { attendeeApi } from "@/lib/api/attendee";

interface Registration{id:number;referenceCode:string;eventId:number;event:string;registeredAt:string;status:"Confirmed"|"Pending"|"Cancelled";checkInStatus:"Checked In"|"Not Checked In";}

export function AttendeeRegistrationsPage(){
  const[records,setRecords]=React.useState<Registration[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[cancelId,setCancelId]=React.useState<number|null>(null);

  const load=React.useCallback(async()=>{
    try{ setRecords(await attendeeApi<Registration[]>("/registrations")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load registrations"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[]);
  React.useEffect(()=>{ void load(); },[load]);

  async function cancel(){
    if(!cancelId) return;
    try{ await attendeeApi(`/registrations/${cancelId}/cancel`,{method:"PATCH"}); toast.success("Registration cancelled"); setCancelId(null); await load(); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to cancel registration"); }
  }

  const columns=React.useMemo<ManagementColumn<Registration>[]>(()=>[
    {id:"reference",label:"Registration ID",accessor:r=>r.referenceCode},
    {id:"event",label:"Event",accessor:r=>r.event},
    {id:"date",label:"Registration Date",accessor:r=>r.registeredAt},
    {id:"status",label:"Registration Status",accessor:r=>r.status,cell:r=><StatusBadge status={r.status}/>},
    {id:"checkIn",label:"Check-in Status",accessor:r=>r.checkInStatus,cell:r=><StatusBadge status={r.checkInStatus}/>},
    {id:"actions",label:"",accessor:r=>r.id,sortable:false,className:"text-right",cell:r=>(
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href="/attendee/events"><Eye/> View Event</Link></DropdownMenuItem>
          <DropdownMenuItem disabled={r.status==="Cancelled"} variant="destructive" onSelect={()=>setCancelId(r.id)}><XCircle/> Cancel Registration</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ],[]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Registrations" description="Your event registrations and their current status." />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading registrations...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : records.length ? (
        <DataTable data={records} columns={columns} getRowId={r=>String(r.id)} searchPlaceholder="Search event or registration ID..."/>
      ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">You have no registrations yet.</div>}

      <ConfirmDialog
        open={Boolean(cancelId)}
        onOpenChange={open=>{ if(!open) setCancelId(null); }}
        title="Cancel this registration?"
        description="You will lose your spot for this event. This action cannot be undone."
        actionLabel="Cancel Registration"
        onConfirm={()=>void cancel()}
      />
    </div>
  );
}
