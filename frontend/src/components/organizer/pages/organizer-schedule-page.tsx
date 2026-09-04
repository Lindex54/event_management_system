/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { useSearchParams } from "next/navigation";import { format,parseISO } from "date-fns";import { Clock,MapPin,Mic2,MoreHorizontal,Pencil,Plus,Trash2 } from "lucide-react";import { toast } from "sonner";import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";import { PageHeader } from "@/components/admin/shared/page-header";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { Input } from "@/components/ui/input";import { Label } from "@/components/ui/label";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { Textarea } from "@/components/ui/textarea";import { organizerApi } from "@/lib/api/organizer";

interface EventOption{id:number;name:string;}
interface Speaker{id:number;name:string;eventId:number;}
interface ScheduleItem{id:number;eventId:number;event:string;speakerId:number|null;speaker:string;title:string;description:string|null;date:string;startTime:string;endTime:string|null;room:string|null;sortOrder:number;}

const emptyForm={id:0,eventId:"",speakerId:"none",title:"",description:"",date:undefined as Date|undefined,startTime:"",endTime:"",room:""};

export function OrganizerSchedulePage(){
  const searchParams=useSearchParams();
  const[events,setEvents]=React.useState<EventOption[]>([]);
  const[speakers,setSpeakers]=React.useState<Speaker[]>([]);
  const[eventFilter,setEventFilter]=React.useState(searchParams.get("eventId")??"all");
  const[items,setItems]=React.useState<ScheduleItem[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[dialogOpen,setDialogOpen]=React.useState(false);
  const[form,setForm]=React.useState(emptyForm);
  const[saving,setSaving]=React.useState(false);
  const[deleting,setDeleting]=React.useState<ScheduleItem>();

  React.useEffect(()=>{ void organizerApi<EventOption[]>("/events").then(setEvents).catch(()=>undefined); },[]);
  React.useEffect(()=>{ void organizerApi<Speaker[]>("/speakers").then(setSpeakers).catch(()=>undefined); },[]);

  const load=React.useCallback(async()=>{
    setLoading(true);
    try{ setItems(await organizerApi<ScheduleItem[]>(eventFilter&&eventFilter!=="all"?`/schedule?eventId=${eventFilter}`:"/schedule")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load schedule"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventFilter]);
  React.useEffect(()=>{ void load(); },[load]);

  function openCreate(){ setForm({...emptyForm,eventId:eventFilter!=="all"?eventFilter:(events[0]?String(events[0].id):"")}); setDialogOpen(true); }
  function openEdit(item:ScheduleItem){ setForm({id:item.id,eventId:String(item.eventId),speakerId:item.speakerId?String(item.speakerId):"none",title:item.title,description:item.description??"",date:new Date(`${item.date}T00:00:00`),startTime:item.startTime,endTime:item.endTime??"",room:item.room??""}); setDialogOpen(true); }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!form.eventId||!form.title.trim()||!form.date||!form.startTime){ toast.error("Event, title, date and start time are required"); return; }
    setSaving(true);
    try{
      const body=JSON.stringify({eventId:Number(form.eventId),speakerId:form.speakerId!=="none"?Number(form.speakerId):null,title:form.title.trim(),description:form.description.trim()||null,date:format(form.date,"yyyy-MM-dd"),startTime:form.startTime,endTime:form.endTime||null,room:form.room.trim()||null,sortOrder:0});
      await organizerApi(form.id?`/schedule/${form.id}`:"/schedule",{method:form.id?"PUT":"POST",body});
      toast.success(form.id?"Schedule item updated":"Schedule item added");
      setDialogOpen(false); await load();
    }catch(e){ toast.error(e instanceof Error?e.message:"Unable to save schedule item"); }
    finally{ setSaving(false); }
  }
  async function remove(){
    if(!deleting) return;
    try{ await organizerApi(`/schedule/${deleting.id}`,{method:"DELETE"}); toast.success("Schedule item removed"); setDeleting(undefined); await load(); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to remove schedule item"); }
  }

  const grouped=React.useMemo(()=>{
    const map=new Map<string,ScheduleItem[]>();
    for(const item of items){ const list=map.get(item.date)??[]; list.push(item); map.set(item.date,list); }
    return[...map.entries()].sort(([a],[b])=>a.localeCompare(b));
  },[items]);
  const eligibleSpeakers=speakers.filter(s=>String(s.eventId)===form.eventId);

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Schedule"
        description="Manage session schedules for your events."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={eventFilter} onValueChange={setEventFilter}><SelectTrigger className="h-9 w-56"><SelectValue placeholder="All events"/></SelectTrigger><SelectContent><SelectItem value="all">All events</SelectItem>{events.map(e=><SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent></Select>
            <Button onClick={openCreate}><Plus/> Add Schedule Item</Button>
          </div>
        }
      />

      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading schedule...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : grouped.length ? (
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
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        <span className="flex items-center gap-1"><Clock className="size-3.5"/>{item.startTime}{item.endTime?` – ${item.endTime}`:""}</span>
                        {item.room && <span className="flex items-center gap-1"><MapPin className="size-3.5"/>{item.room}</span>}
                        {item.speaker && <span className="flex items-center gap-1"><Mic2 className="size-3.5"/>{item.speaker}</span>}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={()=>openEdit(item)}><Pencil/> Edit</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onSelect={()=>setDeleting(item)}><Trash2/> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No schedule items yet.</div>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{form.id?"Edit schedule item":"Add schedule item"}</DialogTitle><DialogDescription>Sessions appear on the event schedule in chronological order.</DialogDescription></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Event *</Label><Select value={form.eventId} onValueChange={v=>setForm(f=>({...f,eventId:v,speakerId:"none"}))}><SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select event"/></SelectTrigger><SelectContent>{events.map(e=><SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="sched-title">Title *</Label><Input id="sched-title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div className="space-y-2"><Label htmlFor="sched-desc">Description</Label><Textarea id="sched-desc" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Date *</Label><DatePickerFilter value={form.date} onChange={d=>setForm(f=>({...f,date:d}))} label="Select date"/></div>
              <div className="space-y-2"><Label htmlFor="sched-room">Room / Venue</Label><Input id="sched-room" value={form.room} onChange={e=>setForm(f=>({...f,room:e.target.value}))}/></div>
              <div className="space-y-2"><Label htmlFor="sched-start">Start Time *</Label><Input id="sched-start" type="time" value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}/></div>
              <div className="space-y-2"><Label htmlFor="sched-end">End Time</Label><Input id="sched-end" type="time" value={form.endTime} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}/></div>
            </div>
            <div className="space-y-2"><Label>Speaker</Label><Select value={form.speakerId} onValueChange={v=>setForm(f=>({...f,speakerId:v}))}><SelectTrigger className="h-10 w-full"><SelectValue placeholder="No speaker"/></SelectTrigger><SelectContent><SelectItem value="none">No speaker</SelectItem>{eligibleSpeakers.map(s=><SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent></Select>{form.eventId&&!eligibleSpeakers.length&&<p className="text-xs text-text-secondary">No speakers assigned to this event yet.</p>}</div>
            <DialogFooter><Button type="button" variant="outline" onClick={()=>setDialogOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving?"Saving...":form.id?"Save Changes":"Add Item"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={Boolean(deleting)} onOpenChange={o=>{if(!o)setDeleting(undefined);}} title="Delete this schedule item?" description="This session will be removed from the event schedule." actionLabel="Delete" onConfirm={()=>void remove()}/>
    </div>
  );
}
