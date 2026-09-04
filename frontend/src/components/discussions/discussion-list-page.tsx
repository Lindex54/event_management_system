"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Lock, MessageSquare, Search, Unlock, Users } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { discussionApi } from "@/lib/api/discussions";
import type { EventDiscussionSummary } from "@/types/event-discussion";

export function DiscussionListPage({ basePath }: { basePath: string }) {
  const [items, setItems] = React.useState<EventDiscussionSummary[]>([]);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"All" | "Open" | "Closed">("All");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load=()=>discussionApi.list().then((data)=>{setItems(data);setError("");}).catch((reason:Error)=>setError(reason.message)).finally(()=>setLoading(false));
    void load();const interval=window.setInterval(()=>void load(),20_000);return()=>window.clearInterval(interval);
  }, []);
  const visible = items.filter((item) => (status === "All" || item.status === status) && `${item.eventName} ${item.latestMessage ?? ""}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="mx-auto max-w-[1200px] space-y-5 p-4 sm:p-6">
    <div><h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary"><MessageSquare className="size-6 text-primary" /> Event Discussions</h1><p className="mt-1 text-sm text-text-secondary">Conversations for events you are authorized to access.</p></div>
    <Card className="shadow-none"><CardContent className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by event or message..." className="pl-9" /></div><div className="flex gap-2">{(["All","Open","Closed"] as const).map((value) => <Button key={value} variant={status===value?"default":"outline"} onClick={() => setStatus(value)}>{value}</Button>)}</div></CardContent></Card>
    {error && <Alert variant="destructive"><Lock /><AlertTitle>Could not load discussions</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
    <div className="space-y-3">{loading ? <Card><CardContent className="py-12 text-center text-sm text-text-secondary">Loading discussions...</CardContent></Card> : visible.length === 0 ? <Card><CardContent className="py-12 text-center"><MessageSquare className="mx-auto size-7 text-text-secondary" /><p className="mt-3 font-semibold">No discussions found</p><p className="text-sm text-text-secondary">Only events connected to your account appear here.</p></CardContent></Card> : visible.map((item) => <Card key={item.eventId} className="shadow-none transition-colors hover:border-primary/30"><CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-semibold text-text-primary">{item.eventName}</h2><Badge variant={item.status === "Open" ? "default" : "secondary"}>{item.status === "Open" ? <Unlock /> : <Lock />}{item.status}</Badge></div><p className="mt-2 line-clamp-2 text-sm text-text-secondary">{item.latestMessage ?? (item.status === "Open" ? "The room is open. Start the conversation." : "The discussion room has not been opened.")}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-text-secondary"><span className="flex items-center gap-1"><MessageSquare className="size-3.5" /> {Number(item.messageCount)} messages</span><span className="flex items-center gap-1"><Users className="size-3.5" /> {Number(item.participantCount)} participants</span><span className="flex items-center gap-1"><Clock className="size-3.5" /> {item.lastActivityAt ? new Intl.DateTimeFormat("en", { dateStyle:"medium", timeStyle:"short" }).format(new Date(item.lastActivityAt)) : new Intl.DateTimeFormat("en", { dateStyle:"medium" }).format(new Date(item.eventDate))}</span></div></div><Button asChild><Link href={`${basePath}/${item.eventId}`}>View Discussion</Link></Button></CardContent></Card>)}</div>
  </div>;
}
