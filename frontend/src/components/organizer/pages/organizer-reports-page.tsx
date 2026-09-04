/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { format } from "date-fns";import { CalendarCheck,ClipboardList,Users } from "lucide-react";import { toast } from "sonner";import { ChartCard } from "@/components/admin/shared/chart-card";import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";import { PageHeader } from "@/components/admin/shared/page-header";import { StatCards } from "@/components/admin/shared/stat-cards";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { organizerApi } from "@/lib/api/organizer";

interface EventOption{id:number;name:string;}
interface EventReportRow{id:number;name:string;status:string;date:string;registrations:number;attendance:number;}
interface TrendRow{date:string;registrations:number;attendance:number;}
interface ReportData{byEvent:EventReportRow[];trend:TrendRow[];}

export function OrganizerReportsPage(){
  const[events,setEvents]=React.useState<EventOption[]>([]);
  const[eventId,setEventId]=React.useState("all");
  const[status,setStatus]=React.useState("All");
  const[start,setStart]=React.useState<Date>();
  const[end,setEnd]=React.useState<Date>();
  const[report,setReport]=React.useState<ReportData|null>(null);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{ void organizerApi<EventOption[]>("/events").then(setEvents).catch(()=>undefined); },[]);

  const load=React.useCallback(async()=>{
    setLoading(true);
    const params=new URLSearchParams();
    if(eventId!=="all") params.set("eventId",eventId);
    if(status!=="All") params.set("status",status);
    if(start) params.set("start",format(start,"yyyy-MM-dd"));
    if(end) params.set("end",format(end,"yyyy-MM-dd"));
    try{ setReport(await organizerApi<ReportData>(`/reports${params.toString()?`?${params}`:""}`)); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load reports"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventId,status,start,end]);
  React.useEffect(()=>{ void load(); },[load]);

  const totals=report?report.byEvent.reduce((acc,row)=>({registrations:acc.registrations+row.registrations,attendance:acc.attendance+row.attendance}),{registrations:0,attendance:0}):{registrations:0,attendance:0};

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Reports"
        description="Event, registration and attendance reports for your events."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={eventId} onValueChange={setEventId}><SelectTrigger className="h-9 w-48 bg-surface"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All events</SelectItem>{events.map(e=><SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent></Select>
            <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue/></SelectTrigger><SelectContent>{["All","Draft","Upcoming","Active","Completed","Cancelled"].map(s=><SelectItem key={s} value={s}>{s==="All"?"All statuses":s}</SelectItem>)}</SelectContent></Select>
            <DatePickerFilter value={start} onChange={setStart} label="Start date"/>
            <DatePickerFilter value={end} onChange={setEnd} label="End date"/>
            {(eventId!=="all"||status!=="All"||start||end)&&<Button variant="ghost" onClick={()=>{setEventId("all");setStatus("All");setStart(undefined);setEnd(undefined);}}>Clear</Button>}
          </div>
        }
      />

      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading reports...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : report && (
        <>
          <StatCards items={[
            {label:"Events in Range",value:report.byEvent.length,icon:ClipboardList},
            {label:"Total Registrations",value:totals.registrations,icon:Users},
            {label:"Total Attendance",value:totals.attendance,icon:CalendarCheck},
          ]}/>

          {report.trend.length>0 && (
            <ChartCard
              title="Registration & Attendance Trend"
              description="Daily registrations vs. attendance for the selected filters"
              type="line"
              categories={report.trend.map(t=>t.date)}
              series={[{name:"Registrations",data:report.trend.map(t=>t.registrations)},{name:"Attendance",data:report.trend.map(t=>t.attendance)}]}
              height={300}
            />
          )}

          <div>
            <h3 className="mb-3 font-semibold text-text-primary">Event Report</h3>
            {report.byEvent.length ? (
              <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40 text-xs text-text-secondary"><tr><Th>Event</Th><Th>Date</Th><Th>Status</Th><Th>Registrations</Th><Th>Attendance</Th></tr></thead>
                <tbody className="divide-y divide-border">{report.byEvent.map(row=><tr key={row.id}><Td className="font-semibold text-text-primary">{row.name}</Td><Td>{row.date}</Td><Td><StatusBadge status={row.status}/></Td><Td>{row.registrations}</Td><Td>{row.attendance}</Td></tr>)}</tbody>
              </table></div></div>
            ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No data for the selected filters.</div>}
          </div>
        </>
      )}
    </div>
  );
}

function Th({children}:{children:React.ReactNode}){return <th className="px-4 py-3 text-left font-medium">{children}</th>}
function Td({children,className}:{children:React.ReactNode;className?:string}){return <td className={`px-4 py-3.5 text-text-secondary ${className??""}`}>{children}</td>}
