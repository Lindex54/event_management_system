"use client";
import * as React from "react";import Link from "next/link";import { CalendarClock,CalendarDays,ScanLine,Search,UserCheck,Users } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { StatCards } from "@/components/admin/shared/stat-cards";import { Button } from "@/components/ui/button";import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";import { staffApi } from "@/lib/api/staff";

interface ScheduleItem{id:number;eventId:number;event:string;title:string;startTime:string;endTime:string|null;room:string|null;}
interface Dashboard{assignedEvents:number;eventsToday:number;expectedToday:number;checkedInToday:number;remainingCheckIns:number;todaySchedule:ScheduleItem[];}

export function StaffDashboardPage(){
  const[data,setData]=React.useState<Dashboard|null>(null);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{
    void staffApi<Dashboard>("/dashboard")
      .then(setData)
      .catch(e=>setError(e instanceof Error?e.message:"Unable to load dashboard"))
      .finally(()=>setLoading(false));
  },[]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Staff Dashboard" description="Fast access to your event operations for today." />

      {loading ? <Loading/> : error ? <ErrorState message={error}/> : data && (
        <>
          <StatCards items={[
            {label:"Assigned Events",value:data.assignedEvents,icon:CalendarDays},
            {label:"Events Today",value:data.eventsToday,icon:CalendarClock},
            {label:"Expected Attendees",value:data.expectedToday,icon:Users},
            {label:"Checked In Today",value:data.checkedInToday,icon:UserCheck},
            {label:"Remaining Check-ins",value:data.remainingCheckIns,icon:ScanLine},
          ]}/>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                <Button asChild className="justify-start"><Link href="/staff/check-in"><ScanLine/>Start Check-in</Link></Button>
                <Button asChild variant="outline" className="justify-start"><Link href="/staff/check-in"><Search/>Search Attendee</Link></Button>
                <Button asChild variant="outline" className="justify-start"><Link href="/staff/schedule"><CalendarClock/>View Today&apos;s Schedule</Link></Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Today&apos;s Schedule</CardTitle></CardHeader>
              <CardContent>
                {data.todaySchedule.length ? (
                  <ul className="divide-y divide-border">
                    {data.todaySchedule.map(item=>(
                      <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                          <p className="text-xs text-text-secondary">{item.event}{item.room?` · ${item.room}`:""}</p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-text-secondary">{item.startTime}{item.endTime?` – ${item.endTime}`:""}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-6 text-center text-sm text-text-secondary">Nothing scheduled for today on your assigned events.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Loading(){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading dashboard...</div>}
function ErrorState({message}:{message:string}){React.useEffect(()=>{toast.error(message)},[message]);return <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{message}</div>}
