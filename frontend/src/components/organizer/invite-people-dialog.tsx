"use client";

import * as React from "react";
import { CalendarDays, Copy, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizerApi } from "@/lib/api/organizer";

interface InvitationEvent { id: number; name: string; slug: string; status: string; registrationClosesAt: string | null; eventDate: string; }

export function InvitePeopleDialog({ trigger, open, onOpenChange, eventId }: {
  trigger?: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; eventId?: number;
}) {
  const [events, setEvents] = React.useState<InvitationEvent[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>(eventId ? String(eventId) : "");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    void organizerApi<InvitationEvent[]>("/invitations").then((data) => {
      setEvents(data);
      if (!selectedId && data.length) setSelectedId(String(eventId ?? data[0]!.id));
    }).catch(() => toast.error("Unable to load your events")).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const event = events.find((item) => String(item.id) === selectedId);
  const registrationUrl = event ? `${window.location.origin}/events/${event.slug}` : "";

  async function copyLink(showToast = true) {
    if (!registrationUrl) return false;
    try {
      await navigator.clipboard.writeText(registrationUrl);
      if (showToast) toast.success("Invitation link copied");
      return true;
    } catch {
      toast.error("Could not copy the invitation link");
      return false;
    }
  }

  async function shareLink() {
    if (!event) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.name, text: `Register for ${event.name}`, url: registrationUrl });
        toast.success("Invitation link shared");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast.error("Could not share the invitation link");
      }
      return;
    }
    if (await copyLink(false)) toast.success("Sharing is unavailable, so the link was copied");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Link2 className="size-4" /></span>
            Invite people to an event
          </DialogTitle>
          <DialogDescription>Select one of your events, then copy or share its registration link.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-6 text-center text-sm text-text-secondary">Loading your events...</p>
        ) : !events.length ? (
          <p className="py-6 text-center text-sm text-text-secondary">You don&apos;t have any events yet.</p>
        ) : (
          <div className="space-y-5 py-1">
            <div className="space-y-2">
              <Label htmlFor="invite-event">Event</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger id="invite-event" className="h-10 w-full bg-background"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {events.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {event && (
              <>
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{event.name}</p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-text-secondary"><CalendarDays className="size-3.5 text-primary" /> {new Date(event.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <Badge className="bg-success/10 text-success hover:bg-success/10">{event.status}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="registration-link">Registration / invitation link</Label>
                    <span className="text-xs text-text-secondary">{event.registrationClosesAt ? `Closes ${new Date(event.registrationClosesAt).toLocaleDateString()}` : "No closing date set"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input id="registration-link" value={registrationUrl} readOnly className="h-10 min-w-0 bg-background" />
                    <Button type="button" variant="outline" size="icon-lg" onClick={() => void copyLink()} aria-label="Copy invitation link"><Copy className="size-4" /></Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => void copyLink()} disabled={!event}><Copy /> Copy link</Button>
          <Button type="button" onClick={() => void shareLink()} disabled={!event}><Share2 /> Share link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
