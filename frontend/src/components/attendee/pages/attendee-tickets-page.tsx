"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, MapPin, QrCode, Ticket, User } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { attendeeApi } from "@/lib/api/attendee";

interface TicketRecord { registrationId: number; referenceCode: string; ticketToken: string; event: string; slug: string; date: string; time: string | null; endTime: string | null; venue: string | null; venueAddress: string | null; status: "Confirmed" | "Pending" | "Cancelled"; attendeeName: string; checkedInAt: string | null; canEnterEvent: boolean | number; ticketUrl: string; liveUrl: string; qrCodeDataUrl: string; }

export function AttendeeTicketsPage() {
  const [tickets, setTickets] = React.useState<TicketRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void attendeeApi<TicketRecord[]>("/tickets").then(setTickets).catch((cause) => {
      const message = cause instanceof Error ? cause.message : "Unable to load tickets";
      setError(message); toast.error(message);
    }).finally(() => setLoading(false));
  }, []);

  return <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6"><PageHeader title="Tickets" description="Your secure QR tickets for upcoming and past events." />{loading ? <State text="Loading tickets..." /> : error ? <State text={error} danger /> : tickets.length ? <div className="grid gap-4 xl:grid-cols-2">{tickets.map((ticket) => {
    const canEnter = Boolean(ticket.canEnterEvent);
    return <Card key={ticket.registrationId} className="overflow-hidden py-0"><CardContent className="grid gap-0 p-0 sm:grid-cols-[1fr_180px]"><div className="space-y-3 p-5"><div className="flex items-start justify-between gap-2"><h3 className="font-bold text-text-primary">{ticket.event}</h3><StatusBadge status={ticket.status} /></div><div className="space-y-1.5 text-sm text-text-secondary"><p className="flex items-center gap-2"><User className="size-4" />{ticket.attendeeName}</p><p className="flex items-center gap-2"><CalendarDays className="size-4" />{ticket.date}</p><p className="flex items-center gap-2"><Clock className="size-4" />{[ticket.time, ticket.endTime].filter(Boolean).join(" - ") || "TBA"}</p>{ticket.venue && <p className="flex items-center gap-2"><MapPin className="size-4" />{ticket.venue}</p>}</div><p className="font-mono text-xs tracking-wider text-text-secondary">{ticket.referenceCode}</p><div className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${canEnter ? "bg-success/10 text-success" : "bg-warning/10 text-amber-700 dark:text-amber-300"}`}>{canEnter ? <CheckCircle2 className="size-4" /> : <QrCode className="size-4" />}{canEnter ? "Checked in — event access unlocked" : "Present QR at check-in to unlock event access"}</div><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link href={ticket.ticketUrl}><Ticket /> Public Ticket</Link></Button>{canEnter ? <Button asChild size="sm"><Link href={ticket.liveUrl}>Enter Event</Link></Button> : <Button size="sm" disabled>Enter after Check-in</Button>}</div></div><div className="flex flex-col items-center justify-center border-t border-dashed border-border bg-white p-4 sm:border-t-0 sm:border-l"><Image src={ticket.qrCodeDataUrl} alt={`QR ticket ${ticket.referenceCode}`} width={150} height={150} unoptimized /><p className="mt-1 text-center text-[10px] text-slate-600">Secure ticket QR</p></div></CardContent></Card>;
  })}</div> : <State text="You don't have any active tickets yet." />}</div>;
}

function State({ text, danger = false }: { text: string; danger?: boolean }) { return <div className={`rounded-xl bg-surface p-10 text-center text-sm ring-1 ring-foreground/10 ${danger ? "text-danger" : "text-text-secondary"}`}>{text}</div>; }
