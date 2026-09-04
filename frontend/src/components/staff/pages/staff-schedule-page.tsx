/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { useSearchParams } from "next/navigation";import { format,isSameDay,parseISO } from "date-fns";import { Clock,MapPin,Mic2,X } from "lucide-react";import { toast } from "sonner";import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";import { PageHeader } from "@/components/admin/shared/page-header";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { staffApi } from "@/lib/api/staff";

interface StaffEvent{id:number;name:string;}
interface ScheduleItem{id:number;eventId:number;event:string;speaker:string|null;title:string;description:string|null;date:string;startTime:string;endTime:string|null;room:string|null;}

export function StaffSchedulePage(){
  const searchParams=useSearchParams();
  const[events,setEvents]=React.useState<StaffEvent[]>([]);
  const[eventId,setEventId]=React.useState<string>(searchParams.get("eventId")??"all");
  const[date,setDate]=React.useState<Date|undefined>();
  const[items,setItems]=React.useState<ScheduleItem[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{ void staffApi<StaffEvent[]>("/events").then(setEvents).catch(()=>undefined); },[]);

  const load=React.useCallback(async()=>{
    setLoading(true);
    try{
      const path=eventId&&eventId!=="all"?`/schedule?eventId=${eventId}`:"/schedule";
      setItems(await staffApi<ScheduleItem[]>(path));
    }catch(e){ const message=e instanceof Error?e.message:"Unable to load schedule"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventId]);
  React.useEffect(()=>{ void load(); },[load]);

  const filtered=date?items.filter(item=>isSameDay(parseISO(item.date),date)):items;
  const grouped=React.useMemo(()=>{
    const map=new Map<string,ScheduleItem[]>();
    for(const item of filtered){
      const list=map.get(item.date)??[];
      list.push(item);
      map.set(item.date,list);
    }
    return[...map.entries()].sort(([a],[b])=>a.localeCompare(b));
  },[filtered]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Schedule"
        description="Session schedule for your assigned events."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="h-9 w-56"><SelectValue placeholder="All assigned events"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All assigned events</SelectItem>
                {events.map(e=><SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <DatePickerFilter value={date} onChange={setDate} label="Filter by date"/>
            {date && <Button variant="ghost" size="icon-sm" onClick={()=>setDate(undefined)}><X/></Button>}
          </div>
        }
      />

      {loading ? <Loading/> : error ? <ErrorState message={error}/> : grouped.length ? (
        <div className="space-y-6">
          {grouped.map(([day,dayItems])=>(
            <div key={day}>
              <p className="mb-2.5 text-sm font-semibold text-text-primary">{format(parseISO(day),"EEEE, MMM d, yyyy")}</p>
              <div className="space-y-2.5">
                {dayItems.map(item=>(
                  <Card key={item.id}>
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-text-primary">{item.title}</p>
                        <p className="text-xs text-text-secondary">{item.event}</p>
                        {item.description && <p className="mt-1 text-xs text-text-secondary">{item.description}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary sm:shrink-0">
                        <span className="flex items-center gap-1"><Clock className="size-3.5"/>{item.startTime}{item.endTime?` – ${item.endTime}`:""}</span>
                        {item.room && <span className="flex items-center gap-1"><MapPin className="size-3.5"/>{item.room}</span>}
                        {item.speaker && <span className="flex items-center gap-1"><Mic2 className="size-3.5"/>{item.speaker}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : <Empty/>}
    </div>
  );
}

function Loading(){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading schedule...</div>}
function ErrorState({message}:{message:string}){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{message}</div>}
function Empty(){return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No schedule items for this selection.</div>}
