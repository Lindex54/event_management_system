"use client";
import * as React from "react";import { CalendarDays,Clock,MapPin,QrCode,User } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Card,CardContent } from "@/components/ui/card";import { attendeeApi } from "@/lib/api/attendee";

interface TicketRecord{registrationId:number;referenceCode:string;event:string;date:string;time:string;venue:string|null;status:"Confirmed"|"Pending"|"Cancelled";attendeeName:string;}

export function AttendeeTicketsPage(){
  const[tickets,setTickets]=React.useState<TicketRecord[]>([]);
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{
    void attendeeApi<TicketRecord[]>("/tickets")
      .then(setTickets)
      .catch(e=>{ const message=e instanceof Error?e.message:"Unable to load tickets"; setError(message); toast.error(message); })
      .finally(()=>setLoading(false));
  },[]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Tickets" description="Your digital tickets for upcoming and past events." />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading tickets...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : tickets.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {tickets.map(ticket=>(
            <Card key={ticket.registrationId} className="overflow-hidden py-0">
              <CardContent className="flex flex-col gap-4 p-0 sm:flex-row">
                <div className="flex-1 space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-text-primary">{ticket.event}</h3>
                    <StatusBadge status={ticket.status}/>
                  </div>
                  <div className="space-y-1.5 text-sm text-text-secondary">
                    <p className="flex items-center gap-2"><User className="size-4"/>{ticket.attendeeName}</p>
                    <p className="flex items-center gap-2"><CalendarDays className="size-4"/>{ticket.date}</p>
                    <p className="flex items-center gap-2"><Clock className="size-4"/>{ticket.time}</p>
                    {ticket.venue && <p className="flex items-center gap-2"><MapPin className="size-4"/>{ticket.venue}</p>}
                  </div>
                  <p className="font-mono text-xs tracking-wider text-text-secondary">{ticket.referenceCode}</p>
                </div>
                <div className="flex w-full shrink-0 flex-col items-center justify-center gap-1.5 border-t border-dashed border-border bg-muted/40 p-5 sm:w-36 sm:border-t-0 sm:border-l">
                  <QrCode className="size-14 text-text-secondary/40"/>
                  <p className="text-center text-[10px] text-text-secondary">QR check-in coming soon</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">You don&apos;t have any active tickets yet.</div>}
    </div>
  );
}
