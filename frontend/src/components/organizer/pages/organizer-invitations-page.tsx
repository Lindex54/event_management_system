"use client";
import * as React from "react";import { CalendarDays,Copy,Link2,Share2 } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { Badge } from "@/components/ui/badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Input } from "@/components/ui/input";import { Label } from "@/components/ui/label";import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";import { organizerApi } from "@/lib/api/organizer";

interface InvitationEvent{id:number;name:string;slug:string;status:string;registrationClosesAt:string|null;eventDate:string;}

export function OrganizerInvitationsPage(){
  const[events,setEvents]=React.useState<InvitationEvent[]>([]);
  const[selectedId,setSelectedId]=React.useState("");
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{
    void organizerApi<InvitationEvent[]>("/invitations")
      .then(data=>{ setEvents(data); if(data.length) setSelectedId(String(data[0]!.id)); })
      .catch(e=>{ const message=e instanceof Error?e.message:"Unable to load your events"; setError(message); toast.error(message); })
      .finally(()=>setLoading(false));
  },[]);

  const event=events.find(item=>String(item.id)===selectedId);
  const registrationUrl=event&&typeof window!=="undefined"?`${window.location.origin}/events/${event.slug}`:"";

  async function copyLink(showToast=true){
    if(!registrationUrl) return false;
    try{ await navigator.clipboard.writeText(registrationUrl); if(showToast) toast.success("Invitation link copied"); return true; }
    catch{ toast.error("Could not copy the invitation link"); return false; }
  }
  async function shareLink(){
    if(!event) return;
    if(navigator.share){
      try{ await navigator.share({title:event.name,text:`Register for ${event.name}`,url:registrationUrl}); toast.success("Invitation link shared"); }
      catch(error){ if(error instanceof DOMException&&error.name==="AbortError") return; toast.error("Could not share the invitation link"); }
      return;
    }
    if(await copyLink(false)) toast.success("Sharing is unavailable, so the link was copied");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
      <PageHeader title="Invitations" description="Share registration links for your events." />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading your events...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : !events.length ? (
        <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">You don&apos;t have any events yet.</div>
      ) : (
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="invite-event" className="flex items-center gap-2"><Link2 className="size-4 text-primary"/>Event</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger id="invite-event" className="h-10 w-full bg-background"><SelectValue/></SelectTrigger>
                <SelectContent position="popper">{events.map(item=><SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {event && (
              <>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{event.name}</p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-text-secondary"><CalendarDays className="size-3.5 text-primary"/>{new Date(event.eventDate).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</p>
                    </div>
                    <Badge className="bg-success/10 text-success hover:bg-success/10">{event.status}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="registration-link">Registration / invitation link</Label>
                    <span className="text-xs text-text-secondary">{event.registrationClosesAt?`Closes ${new Date(event.registrationClosesAt).toLocaleDateString()}`:"No closing date set"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input id="registration-link" value={registrationUrl} readOnly className="h-10 min-w-0 bg-background"/>
                    <Button type="button" variant="outline" size="icon-lg" onClick={()=>void copyLink()} aria-label="Copy invitation link"><Copy className="size-4"/></Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={()=>void copyLink()}><Copy/> Copy link</Button>
                  <Button type="button" onClick={()=>void shareLink()}><Share2/> Share link</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
