"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { managementEvents } from "@/data/admin-management";
import type { Discussion } from "@/types/discussion";

export function NewDiscussionDialog({ onCreate }: { onCreate: (discussion: Discussion) => void }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [eventId, setEventId] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedEvent = managementEvents.find((item) => item.id === eventId);
    if (!title.trim() || !selectedEvent || !message.trim()) {
      setError("Discussion title, event and opening message are required.");
      return;
    }
    const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    onCreate({
      id: `${slug}-${Date.now().toString().slice(-5)}`,
      title: title.trim(),
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      startedBy: { name: "Administrator", initials: "AD" },
      preview: message.trim(),
      participantsCount: 1,
      repliesCount: 0,
      unreadCount: 0,
      status: "Active",
      pinned: false,
      lastActivity: "Just now",
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setTitle(""); setEventId(""); setMessage(""); setError(""); setOpen(false);
    toast.success("Discussion created");
  }

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button><Plus /> New Discussion</Button></DialogTrigger><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle className="text-lg">New Discussion</DialogTitle><DialogDescription>Start a conversation associated with an event.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="discussion-title">Discussion Title</Label><Input id="discussion-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Enter a clear discussion topic" /></div><div className="space-y-2"><Label>Event</Label><Select value={eventId} onValueChange={setEventId}><SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select an event" /></SelectTrigger><SelectContent>{managementEvents.map((event) => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="opening-message">Description / Opening Message</Label><Textarea id="opening-message" value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-32" placeholder="Start the conversation..." /></div>{error && <p className="text-sm text-danger" role="alert">{error}</p>}<DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create Discussion</Button></DialogFooter></form></DialogContent></Dialog>;
}
