/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { useSearchParams } from "next/navigation";import { Mic2,MoreHorizontal,Pencil,Plus,Trash2,UserPlus2 } from "lucide-react";import { toast } from "sonner";import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";import { Badge } from "@/components/ui/badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";import { Input } from "@/components/ui/input";import { Label } from "@/components/ui/label";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { Textarea } from "@/components/ui/textarea";import { organizerApi } from "@/lib/api/organizer";

interface EventOption{id:number;name:string;}
interface Speaker{id:number;eventId:number;event:string;name:string;firstName:string;lastName:string|null;email:string;telephone:string|null;title:string;organization:string|null;bio:string|null;photoUrl:string|null;type:"Speaker"|"Guest";status:"Pending"|"Confirmed";}

const emptyForm={id:0,eventId:"",firstName:"",lastName:"",email:"",telephone:"",title:"",organization:"",bio:"",photoUrl:"",type:"Speaker",status:"Pending"};

export function OrganizerSpeakersPage(){
  const searchParams=useSearchParams();
  const[events,setEvents]=React.useState<EventOption[]>([]);
  const[eventFilter,setEventFilter]=React.useState(searchParams.get("eventId")??"all");
  const[speakers,setSpeakers]=React.useState<Speaker[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[dialogOpen,setDialogOpen]=React.useState(false);
  const[form,setForm]=React.useState(emptyForm);
  const[saving,setSaving]=React.useState(false);
  const[removing,setRemoving]=React.useState<Speaker>();

  React.useEffect(()=>{ void organizerApi<EventOption[]>("/events").then(setEvents).catch(()=>undefined); },[]);

  const load=React.useCallback(async()=>{
    setLoading(true);
    try{ setSpeakers(await organizerApi<Speaker[]>(eventFilter&&eventFilter!=="all"?`/speakers?eventId=${eventFilter}`:"/speakers")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load speakers"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[eventFilter]);
  React.useEffect(()=>{ void load(); },[load]);

  function openCreate(){ setForm({...emptyForm,eventId:eventFilter!=="all"?eventFilter:(events[0]?String(events[0].id):"")}); setDialogOpen(true); }
  function openEdit(speaker:Speaker){ setForm({id:speaker.id,eventId:String(speaker.eventId),firstName:speaker.firstName,lastName:speaker.lastName??"",email:speaker.email,telephone:speaker.telephone??"",title:speaker.title,organization:speaker.organization??"",bio:speaker.bio??"",photoUrl:speaker.photoUrl??"",type:speaker.type,status:speaker.status}); setDialogOpen(true); }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!form.eventId||!form.firstName.trim()||!form.email.trim()||!form.title.trim()){ toast.error("Event, first name, email and title are required"); return; }
    setSaving(true);
    try{
      const body=JSON.stringify({eventId:Number(form.eventId),firstName:form.firstName.trim(),lastName:form.lastName.trim()||null,email:form.email.trim(),telephone:form.telephone.trim()||null,title:form.title.trim(),organization:form.organization.trim()||null,bio:form.bio.trim()||null,photoUrl:form.photoUrl.trim()||null,type:form.type,status:form.status});
      await organizerApi(form.id?`/speakers/${form.id}`:"/speakers",{method:form.id?"PUT":"POST",body});
      toast.success(form.id?`${form.type} updated`:`${form.type} added`);
      setDialogOpen(false); await load();
    }catch(e){ toast.error(e instanceof Error?e.message:"Unable to save this record"); }
    finally{ setSaving(false); }
  }
  async function remove(){
    if(!removing) return;
    try{ await organizerApi(`/speakers/${removing.id}?eventId=${removing.eventId}`,{method:"DELETE"}); toast.success("Removed from event"); setRemoving(undefined); await load(); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to remove"); }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Speakers & Guests"
        description="Manage speakers and guests for your events."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={eventFilter} onValueChange={setEventFilter}><SelectTrigger className="h-9 w-56"><SelectValue placeholder="All events"/></SelectTrigger><SelectContent><SelectItem value="all">All events</SelectItem>{events.map(e=><SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent></Select>
            <Button onClick={openCreate}><Plus/> Add Speaker/Guest</Button>
          </div>
        }
      />

      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading speakers...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : speakers.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {speakers.map(s=>(
            <Card key={`${s.id}-${s.eventId}`}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11"><AvatarImage src={s.photoUrl??undefined} alt={s.name}/><AvatarFallback className="bg-primary/10 font-semibold text-primary">{s.name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase()}</AvatarFallback></Avatar>
                    <div><p className="font-semibold text-text-primary">{s.name}</p><p className="text-xs text-text-secondary">{s.title}{s.organization?` · ${s.organization}`:""}</p></div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={()=>openEdit(s)}><Pencil/> Edit</DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={()=>setRemoving(s)}><Trash2/> Remove</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {s.bio && <p className="line-clamp-2 text-xs text-text-secondary">{s.bio}</p>}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline">{s.type}</Badge>
                  <StatusBadge status={s.status}/>
                  <Badge variant="outline" className="max-w-full truncate"><Mic2 className="size-3"/>{s.event}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No speakers or guests yet.</div>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus2 className="size-4"/>{form.id?"Edit speaker/guest":"Add speaker/guest"}</DialogTitle><DialogDescription>Assign a speaker or guest to one of your events.</DialogDescription></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Event *</Label><Select value={form.eventId} onValueChange={v=>setForm(f=>({...f,eventId:v}))} disabled={Boolean(form.id)}><SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select event"/></SelectTrigger><SelectContent>{events.map(e=><SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}</SelectContent></Select>{Boolean(form.id)&&<p className="text-xs text-text-secondary">Remove and re-add to assign this person to a different event.</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="sp-first">First Name *</Label><Input id="sp-first" value={form.firstName} onChange={e=>setForm(f=>({...f,firstName:e.target.value}))}/></div>
              <div className="space-y-2"><Label htmlFor="sp-last">Last Name</Label><Input id="sp-last" value={form.lastName} onChange={e=>setForm(f=>({...f,lastName:e.target.value}))}/></div>
              <div className="space-y-2"><Label htmlFor="sp-email">Email *</Label><Input id="sp-email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
              <div className="space-y-2"><Label htmlFor="sp-tel">Telephone</Label><Input id="sp-tel" value={form.telephone} onChange={e=>setForm(f=>({...f,telephone:e.target.value}))}/></div>
              <div className="space-y-2"><Label htmlFor="sp-title">Position/Title *</Label><Input id="sp-title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
              <div className="space-y-2"><Label htmlFor="sp-org">Organization</Label><Input id="sp-org" value={form.organization} onChange={e=>setForm(f=>({...f,organization:e.target.value}))}/></div>
              <div className="space-y-2"><Label>Type *</Label><Select value={form.type} onValueChange={v=>setForm(f=>({...f,type:v}))}><SelectTrigger className="h-10 w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Speaker">Speaker</SelectItem><SelectItem value="Guest">Guest</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Status *</Label><Select value={form.status} onValueChange={v=>setForm(f=>({...f,status:v}))}><SelectTrigger className="h-10 w-full"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Confirmed">Confirmed</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="sp-photo">Photo URL</Label><Input id="sp-photo" type="url" value={form.photoUrl} onChange={e=>setForm(f=>({...f,photoUrl:e.target.value}))} placeholder="https://example.com/photo.jpg"/></div>
            <div className="space-y-2"><Label htmlFor="sp-bio">Bio</Label><Textarea id="sp-bio" value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))}/></div>
            <DialogFooter><Button type="button" variant="outline" onClick={()=>setDialogOpen(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving?"Saving...":form.id?"Save Changes":"Add"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={Boolean(removing)} onOpenChange={o=>{if(!o)setRemoving(undefined);}} title="Remove this person from the event?" description="They will no longer be listed as a speaker or guest for this event." actionLabel="Remove" onConfirm={()=>void remove()}/>
    </div>
  );
}
