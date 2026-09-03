"use client";

import * as React from "react";
import { CalendarDays, Copy, Link2, MapPin, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { managementEvents } from "@/data/admin-management";

interface InvitePeopleDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  eventId?: string;
}

export function InvitePeopleDialog({ trigger, open, onOpenChange, eventId }: InvitePeopleDialogProps) {
  const [selectedId, setSelectedId] = React.useState(eventId ?? managementEvents[0].id);

  const event = managementEvents.find((item) => item.id === selectedId) ?? managementEvents[0];

  async function copyLink(showToast = true) {
    try {
      await navigator.clipboard.writeText(event.registrationUrl);
      if (showToast) toast.success("Invitation link copied");
      return true;
    } catch {
      toast.error("Could not copy the invitation link");
      return false;
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Register for ${event.name}`,
          url: event.registrationUrl,
        });
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
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Link2 className="size-4" />
            </span>
            Invite people to an event
          </DialogTitle>
          <DialogDescription>
            Select an event, then copy or share its public registration link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-2">
            <Label htmlFor="invite-event">Event</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger id="invite-event" className="h-10 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {managementEvents.filter((item) => item.status !== "Completed" && item.status !== "Cancelled").map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-text-primary">{event.name}</p>
                <div className="mt-2 space-y-1.5 text-xs text-text-secondary">
                  <p className="flex items-center gap-2"><CalendarDays className="size-3.5 text-primary" /> {event.dateLabel}</p>
                  <p className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" /> {event.venue}</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success hover:bg-success/10">Active</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="registration-link">Registration / invitation link</Label>
              <span className="text-xs text-text-secondary">Closes {event.registrationDeadline}</span>
            </div>
            <div className="flex gap-2">
              <Input id="registration-link" value={event.registrationUrl} readOnly className="h-10 min-w-0 bg-background" />
              <Button type="button" variant="outline" size="icon-lg" onClick={() => void copyLink()} aria-label="Copy invitation link">
                <Copy className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => void copyLink()}>
            <Copy /> Copy link
          </Button>
          <Button type="button" onClick={() => void shareLink()}>
            <Share2 /> Share link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
