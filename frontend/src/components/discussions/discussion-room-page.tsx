"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle,ArrowLeft,Calendar,Clock,Lock,MapPin,MessageSquare,MoreHorizontal,Send,Unlock,UserMinus,Users } from "lucide-react";
import { toast } from "sonner";

import { Alert,AlertDescription,AlertTitle } from "@/components/ui/alert";
import { Avatar,AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { discussionApi } from "@/lib/api/discussions";
import type { DiscussionParticipant,DiscussionTypingUser,EventDiscussionDetail,EventDiscussionMessage } from "@/types/event-discussion";

const initials=(name:string)=>name.split(/\s+/).slice(0,2).map(part=>part[0]).join("").toUpperCase();

export function DiscussionRoomPage({eventId,basePath}:{eventId:number;basePath:string}){
  const[discussion,setDiscussion]=React.useState<EventDiscussionDetail|null>(null);
  const[messages,setMessages]=React.useState<EventDiscussionMessage[]>([]);
  const[typingUsers,setTypingUsers]=React.useState<DiscussionTypingUser[]>([]);
  const[participants,setParticipants]=React.useState<DiscussionParticipant[]>([]);
  const[message,setMessage]=React.useState("");const[error,setError]=React.useState("");const[sending,setSending]=React.useState(false);
  const lastId=React.useRef(0);const lastTyping=React.useRef(0);const endRef=React.useRef<HTMLDivElement>(null);

  const poll=React.useCallback(async(initial=false)=>{try{const[result,typing]=await Promise.all([discussionApi.messages(eventId,initial?0:lastId.current),discussionApi.typingUsers(eventId)]);setDiscussion(result.discussion);setTypingUsers(typing);if(result.discussion.isAdministrator)void discussionApi.participants(eventId).then(setParticipants).catch(()=>undefined);if(result.messages.length){lastId.current=result.messages.at(-1)!.id;setMessages(current=>initial?result.messages:[...current,...result.messages.filter(next=>!current.some(existing=>existing.id===next.id))]);}setError("");}catch(reason){setError(reason instanceof Error?reason.message:"Unable to load this discussion");}},[eventId]);
  React.useEffect(()=>{void poll(true);const interval=window.setInterval(()=>void poll(false),4000);return()=>window.clearInterval(interval);},[poll]);
  React.useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth",block:"nearest"});},[messages.length]);

  async function send(event:React.FormEvent){event.preventDefault();const body=message.trim();if(!body||sending)return;setSending(true);try{await discussionApi.send(eventId,body);setMessage("");await poll(false);toast.success("Message sent");}catch(reason){toast.error(reason instanceof Error?reason.message:"Unable to send message");await poll(false);}finally{setSending(false);}}
  async function changeStatus(status:"Open"|"Closed"){try{if(status==="Open")await discussionApi.open(eventId);else await discussionApi.close(eventId);await poll(false);toast.success(status==="Open"?"Discussion opened":"Discussion closed");}catch(reason){toast.error(reason instanceof Error?reason.message:"Unable to update discussion");}}
  async function removeParticipant(participant:DiscussionParticipant){try{await discussionApi.removeParticipant(eventId,participant.userId);setParticipants(current=>current.filter(item=>item.userId!==participant.userId));toast.success(`${participant.name} removed from this discussion`);}catch(reason){toast.error(reason instanceof Error?reason.message:"Unable to remove attendee");}}
  function notifyTyping(value:string){setMessage(value);const now=Date.now();if(value.trim()&&now-lastTyping.current>2500){lastTyping.current=now;void discussionApi.typing(eventId).catch(()=>undefined);}}

  if(!discussion&&!error)return <div className="p-8 text-center text-sm text-text-secondary">Loading discussion...</div>;
  if(!discussion)return <div className="mx-auto max-w-3xl p-6"><Alert variant="destructive"><AlertCircle/><AlertTitle>Discussion unavailable</AlertTitle><AlertDescription>{error}</AlertDescription></Alert><Button asChild variant="ghost" className="mt-4"><Link href={basePath}><ArrowLeft/>Back to discussions</Link></Button></div>;
  const closed=discussion.status==="Closed";const showControl=(closed&&discussion.canOpen)||(!closed&&discussion.canClose);

  return <div className="mx-auto max-w-[1400px] space-y-4 p-4 sm:p-6">
    <Button asChild variant="ghost" className="-ml-2"><Link href={basePath}><ArrowLeft/>Back to discussions</Link></Button>
    {error&&<Alert variant="destructive"><AlertCircle/><AlertTitle>Connection problem</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="flex items-center gap-2 text-2xl font-bold"><MessageSquare className="text-primary"/>{discussion.eventName}</h1><div className="mt-2 flex flex-wrap gap-4 text-sm text-text-secondary"><span className="flex items-center gap-1"><Calendar className="size-4"/>{new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(new Date(`${discussion.eventDate}T00:00:00`))}</span>{discussion.startTime&&<span className="flex items-center gap-1"><Clock className="size-4"/>{discussion.startTime.slice(0,5)}</span>}{discussion.venueName&&<span className="flex items-center gap-1"><MapPin className="size-4"/>{discussion.venueName}</span>}</div></div><div className="flex items-center gap-2"><Badge variant={closed?"secondary":"default"}>{closed?<Lock/>:<Unlock/>}{discussion.status}</Badge>{showControl&&<DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon"><MoreHorizontal/><span className="sr-only">Discussion controls</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{closed?<DropdownMenuItem onSelect={()=>void changeStatus("Open")}><Unlock/>Open discussion</DropdownMenuItem>:<DropdownMenuItem onSelect={()=>void changeStatus("Closed")}><Lock/>Close discussion</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>}</div></div>
    {closed&&!discussion.controlsActive&&!discussion.isAdministrator&&<Alert><Clock/><AlertTitle>Discussion opens shortly</AlertTitle><AlertDescription>The room and organizer controls activate automatically 20 minutes before the event starts.</AlertDescription></Alert>}
    {closed&&<Alert><Lock/><AlertTitle>This discussion is closed</AlertTitle><AlertDescription>Messages remain visible, but no new messages can be sent until an authorized manager reopens it.</AlertDescription></Alert>}
    <div className={discussion.isAdministrator?"grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]":""}>
      <Card className="gap-0 py-0 shadow-none"><CardHeader className="border-b py-4"><CardTitle className="flex items-center gap-2"><Users className="size-4 text-primary"/>Conversation</CardTitle></CardHeader><CardContent className="p-0"><ScrollArea className="h-[min(60vh,640px)] min-h-[420px] bg-background/50"><div className="space-y-4 p-4 sm:p-6">{messages.length===0?<div className="py-20 text-center text-sm text-text-secondary">{closed?"No messages were posted in this room.":"No messages yet. Start the conversation."}</div>:messages.map(item=>{const own=item.userId===discussion.currentUserId;return <div key={item.id} className={`flex gap-2.5 ${own?"flex-row-reverse":""}`}><Avatar><AvatarFallback className={own?"bg-primary text-primary-foreground":"bg-muted"}>{initials(item.senderName)}</AvatarFallback></Avatar><div className={`max-w-[82%] ${own?"text-right":""}`}><div className={`mb-1 flex items-center gap-2 text-xs ${own?"flex-row-reverse":""}`}><span className="font-semibold">{own?"You":item.senderName}</span><Badge variant="outline" className="text-[10px]">{item.senderRole}</Badge><time className="text-text-secondary">{new Intl.DateTimeFormat("en",{hour:"numeric",minute:"2-digit"}).format(new Date(item.createdAt))}</time></div><div className={`rounded-2xl px-4 py-2.5 text-left text-sm whitespace-pre-wrap ${own?"bg-primary text-primary-foreground":"border bg-surface text-text-primary"}`}>{item.message}</div></div></div>})}<div ref={endRef}/></div></ScrollArea><Separator/><form onSubmit={send} className="p-3 sm:p-4"><Textarea value={message} onChange={event=>notifyTyping(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit();}}} disabled={closed} maxLength={2000} placeholder={closed?"This discussion is closed":"Write a message..."} className="min-h-20 resize-none"/><div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-text-secondary">{typingUsers.length?`${typingUsers.map(item=>item.name).join(", ")} ${typingUsers.length===1?"is":"are"} typing...`:"Enter to send · Shift + Enter for a new line"}</span><Button type="submit" disabled={closed||sending||!message.trim()}><Send/>{sending?"Sending...":"Send"}</Button></div></form></CardContent></Card>
      {discussion.isAdministrator&&<Card className="h-fit shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-4 text-primary"/>Participants</CardTitle></CardHeader><CardContent><ScrollArea className="max-h-[520px]"><div className="space-y-3 pr-3">{participants.length===0?<p className="text-sm text-text-secondary">No confirmed attendees.</p>:participants.map(participant=><div key={participant.userId} className="flex items-center gap-2"><Avatar size="sm"><AvatarFallback>{initials(participant.name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{participant.name}</p><p className="truncate text-xs text-text-secondary">{participant.email}</p></div><Button variant="ghost" size="icon-sm" onClick={()=>void removeParticipant(participant)} aria-label={`Remove ${participant.name}`}><UserMinus className="text-danger"/></Button></div>)}</div></ScrollArea></CardContent></Card>}
    </div>
  </div>;
}
