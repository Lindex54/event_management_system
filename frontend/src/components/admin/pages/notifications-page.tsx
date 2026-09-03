"use client";

import * as React from "react";
import { Bell, CalendarClock, CheckCheck, MoreHorizontal, Trash2, Users, XCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notificationRecords } from "@/data/admin-management";

const typeIcons: Record<string, typeof Bell> = { "Registration closing": CalendarClock, "Organizer approval": Users, "Event cancelled": XCircle };

export function NotificationsPage() {
  const [items, setItems] = React.useState(notificationRecords);
  function markRead(id: string) { setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item)); toast.success("Notification marked as read"); }
  function list(mode: "all" | "unread" | "read") { const shown = mode === "all" ? items : items.filter((item) => item.read === (mode === "read")); return <div className="space-y-3">{shown.map((item) => { const Icon = typeIcons[item.type] ?? Bell; return <Card key={item.id} className={`py-0 shadow-none ${item.read ? "" : "ring-primary/25"}`}><CardContent className="flex gap-3 p-4"><span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.read ? "bg-muted text-text-secondary" : "bg-primary/10 text-primary"}`}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-text-primary">{item.title}</p>{!item.read && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Unread</Badge>}</div><p className="mt-1 text-sm text-text-secondary">{item.description}</p><p className="mt-2 text-xs text-text-secondary">{item.type} · {item.time}</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => markRead(item.id)}><CheckCheck /> Mark as read</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => { setItems((current) => current.filter((currentItem) => currentItem.id !== item.id)); toast.success("Notification deleted"); }}><Trash2 /> Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></CardContent></Card>; })}{!shown.length && <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No notifications in this view.</div>}</div>; }
  return <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6"><PageHeader title="Notifications" description="Review platform updates and items requiring attention." actions={<Button variant="outline" className="bg-surface" onClick={() => { setItems((current) => current.map((item) => ({ ...item, read: true }))); toast.success("All notifications marked as read"); }}><CheckCheck /> Mark all as read</Button>} /><Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All ({items.length})</TabsTrigger><TabsTrigger value="unread">Unread ({items.filter((x) => !x.read).length})</TabsTrigger><TabsTrigger value="read">Read ({items.filter((x) => x.read).length})</TabsTrigger></TabsList><TabsContent value="all" className="mt-4">{list("all")}</TabsContent><TabsContent value="unread" className="mt-4">{list("unread")}</TabsContent><TabsContent value="read" className="mt-4">{list("read")}</TabsContent></Tabs></div>;
}
