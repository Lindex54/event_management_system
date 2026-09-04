/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import * as React from "react";import { Bell,CalendarClock,CheckCheck } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { Badge } from "@/components/ui/badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";import { staffApi } from "@/lib/api/staff";

interface StaffNotification{id:number;type:string;title:string;message:string;isRead:boolean|number;createdAt:string;event:string|null;}

export function StaffNotificationsPage(){
  const[items,setItems]=React.useState<StaffNotification[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  const load=React.useCallback(async()=>{
    try{ setItems(await staffApi<StaffNotification[]>("/notifications")); }
    catch(e){ const message=e instanceof Error?e.message:"Unable to load notifications"; setError(message); toast.error(message); }
    finally{ setLoading(false); }
  },[]);
  React.useEffect(()=>{ void load(); },[load]);

  async function markRead(id:number){
    setItems(current=>current.map(item=>item.id===id?{...item,isRead:true}:item));
    try{ await staffApi(`/notifications/${id}/read`,{method:"PATCH"}); toast.success("Notification marked as read"); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to update notification"); }
  }
  async function markAllRead(){
    setItems(current=>current.map(item=>({...item,isRead:true})));
    try{ await staffApi("/notifications/read-all",{method:"PATCH"}); toast.success("All notifications marked as read"); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to update notifications"); }
  }

  function list(mode:"all"|"unread"|"read"){
    const shown=mode==="all"?items:items.filter(item=>Boolean(item.isRead)===(mode==="read"));
    if(!shown.length) return <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No notifications in this view.</div>;
    return (
      <div className="space-y-3">
        {shown.map(item=>(
          <Card key={item.id} className={`py-0 shadow-none ${item.isRead?"":"ring-primary/25"}`}>
            <CardContent className="flex gap-3 p-4">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.isRead?"bg-muted text-text-secondary":"bg-primary/10 text-primary"}`}><Bell className="size-5"/></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-text-primary">{item.title}</p>
                  {!item.isRead && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Unread</Badge>}
                </div>
                <p className="mt-1 text-sm text-text-secondary">{item.message}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-text-secondary"><CalendarClock className="size-3"/>{item.event?`${item.event} · `:""}{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              {!item.isRead && <Button variant="ghost" size="sm" onClick={()=>void markRead(item.id)}>Mark as read</Button>}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <PageHeader title="Notifications" description="Updates about your assigned events." actions={<Button variant="outline" className="bg-surface" onClick={()=>void markAllRead()}><CheckCheck/> Mark all as read</Button>} />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading notifications...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({items.filter(x=>!x.isRead).length})</TabsTrigger>
            <TabsTrigger value="read">Read ({items.filter(x=>x.isRead).length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">{list("all")}</TabsContent>
          <TabsContent value="unread" className="mt-4">{list("unread")}</TabsContent>
          <TabsContent value="read" className="mt-4">{list("read")}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
