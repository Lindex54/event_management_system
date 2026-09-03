"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Info, MessageSquare, MoreHorizontal, Paperclip, Pin, Send, Users } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Message, MessageAvatar, MessageContent, MessageGroup } from "@/components/ui/message";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { discussionMessages } from "@/data/discussion-messages";
import type { Discussion, DiscussionMessage } from "@/types/discussion";

const participantAvatars = [
  { name: "Sarah Namuli", initials: "SN" },
  { name: "Daniel Okello", initials: "DO" },
  { name: "Grace Nakato", initials: "GN" },
  { name: "Martha Achieng", initials: "MA" },
];

export function DiscussionRoom({ discussion }: { discussion: Discussion }) {
  const initialMessages = discussionMessages.filter((message) => message.discussionId === discussion.id);
  const [messages, setMessages] = React.useState<DiscussionMessage[]>(initialMessages.length ? initialMessages : [
    { id: "welcome", discussionId: discussion.id, author: discussion.startedBy.name, initials: discussion.startedBy.initials, body: discussion.preview, sentAt: discussion.lastActivity },
    { id: "response", discussionId: discussion.id, author: "Administrator", initials: "AD", body: "Thank you for starting this discussion. The administration team is following the conversation.", sentAt: "Recently", own: true },
  ]);
  const [message, setMessage] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    setMessages((current) => [...current, {
      id: `local-${Date.now()}`,
      discussionId: discussion.id,
      author: "Administrator",
      initials: "AD",
      body: message.trim(),
      sentAt: new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date()),
      own: true,
    }]);
    setMessage("");
    toast.success("Message added to the local discussion");
  }

  return <div className="mx-auto max-w-[1500px] space-y-4 p-4 sm:p-6"><Button variant="ghost" asChild className="-ml-2"><Link href="/admin/discussions"><ArrowLeft /> Back to Discussions</Link></Button><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><div className="flex items-start gap-2"><MessageSquareIcon /><div><h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">{discussion.title}</h1><p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary"><CalendarDays className="size-4" /> {discussion.eventName}</p></div></div></div><div className="flex items-center gap-2">{discussion.pinned && <span className="flex items-center gap-1.5 text-xs font-medium text-primary"><Pin className="size-3.5 fill-current" /> Pinned</span>}<StatusBadge status={discussion.status} /><Button variant="outline" size="icon" aria-label="Discussion options"><MoreHorizontal /></Button></div></div><div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]"><Card className="min-w-0 gap-0 py-0 shadow-none"><CardHeader className="flex flex-row items-center justify-between border-b border-border py-3.5"><div><CardTitle>Conversation</CardTitle><p className="mt-0.5 text-xs text-text-secondary">{messages.length} messages · {discussion.participantsCount} participants</p></div><AvatarGroup>{participantAvatars.slice(0, 3).map((participant) => <Avatar key={participant.initials} size="sm" title={participant.name}><AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{participant.initials}</AvatarFallback></Avatar>)}<AvatarGroupCount className="size-6 text-[10px]">+{Math.max(discussion.participantsCount - 3, 0)}</AvatarGroupCount></AvatarGroup></CardHeader><CardContent className="px-0"><div className="h-[min(58vh,610px)] min-h-[430px] overflow-y-auto bg-background/55 px-4 py-5 sm:px-6"><div className="mb-6 flex items-center gap-3"><Separator className="flex-1" /><span className="text-[11px] font-medium text-text-secondary">Today</span><Separator className="flex-1" /></div><MessageGroup>{messages.map((item) => <Message key={item.id} from={item.own ? "me" : "other"}><MessageAvatar><Avatar><AvatarFallback className={item.own ? "bg-primary font-semibold text-primary-foreground" : "bg-surface font-semibold text-text-secondary"}>{item.initials}</AvatarFallback></Avatar></MessageAvatar><MessageContent><div className={`flex items-center gap-2 px-1 text-[11px] ${item.own ? "flex-row-reverse" : ""}`}><span className="font-semibold text-text-primary">{item.own ? "You" : item.author}</span><span className="text-text-secondary">{item.sentAt}</span></div><Bubble variant={item.own ? "default" : "muted"}><BubbleContent>{item.body}</BubbleContent></Bubble></MessageContent></Message>)}<div ref={endRef} /></MessageGroup></div><form onSubmit={sendMessage} className="border-t border-border bg-surface p-3 sm:p-4"><Textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={discussion.status === "Closed" ? "This discussion is closed" : "Write a message..."} disabled={discussion.status === "Closed"} className="min-h-20 resize-none bg-background" /><div className="mt-2 flex items-center justify-between"><Button type="button" variant="ghost" size="sm" disabled={discussion.status === "Closed"} onClick={() => toast.info("Attachments will be connected in the backend phase")}><Paperclip /> Attach</Button><div className="flex items-center gap-3"><span className="hidden text-[11px] text-text-secondary sm:block">Enter to send · Shift + Enter for new line</span><Button type="submit" disabled={!message.trim() || discussion.status === "Closed"}><Send /> Send</Button></div></div></form></CardContent></Card><aside className="space-y-4"><Card className="shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><Info className="size-4 text-primary" /> Discussion details</CardTitle></CardHeader><CardContent className="space-y-4"><Detail label="Event" value={discussion.eventName} /><Separator /><Detail label="Started by" value={discussion.startedBy.name} /><Separator /><Detail label="Created" value={new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(discussion.createdAt))} /><Separator /><Detail label="Last activity" value={discussion.lastActivity} /></CardContent></Card><Card className="shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-4 text-primary" /> Participants</CardTitle></CardHeader><CardContent className="space-y-3">{participantAvatars.map((participant, index) => <div key={participant.initials} className="flex items-center gap-2.5"><Avatar size="sm"><AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{participant.initials}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{participant.name}</p><p className="text-[11px] text-text-secondary">{index === 0 ? "Discussion starter" : "Participant"}</p></div></div>)}{discussion.participantsCount > participantAvatars.length && <Button variant="outline" size="sm" className="w-full"><Users /> View all {discussion.participantsCount}</Button>}</CardContent></Card></aside></div></div>;
}

function MessageSquareIcon() {
  return <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><MessageSquare className="size-4" /></span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] font-medium tracking-wide text-text-secondary uppercase">{label}</p><p className="mt-1 text-sm font-medium text-text-primary">{value}</p></div>;
}
