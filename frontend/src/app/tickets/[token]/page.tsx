import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin, QrCode, Ticket, UserRound } from "lucide-react";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicTicket } from "@/lib/api/public-events";

export const dynamic = "force-dynamic";

export default async function PublicTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ticket = await getPublicTicket(token).catch(() => null);
  if (!ticket) notFound();
  const checkedIn = Boolean(ticket.checkedInAt);

  return <><PublicHeader /><main className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><Card className="overflow-hidden"><CardHeader className="border-b border-border bg-muted/30"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-semibold text-primary"><Ticket className="size-4" /> Evently Ticket</p><CardTitle className="mt-2 text-2xl">{ticket.event}</CardTitle></div><Badge variant={ticket.registrationStatus === "Confirmed" ? "default" : "outline"}>{ticket.registrationStatus}</Badge></div></CardHeader><CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_240px]"><div className="space-y-4"><Detail icon={UserRound} label="Attendee" value={ticket.attendeeName} /><Detail icon={CalendarDays} label="Date" value={ticket.date} /><Detail icon={Clock} label="Time" value={[ticket.time, ticket.endTime].filter(Boolean).join(" - ") || "TBA"} /><Detail icon={MapPin} label="Venue" value={[ticket.venue, ticket.venueAddress].filter(Boolean).join(", ") || "TBA"} /><div className="rounded-lg border border-border p-3"><p className="text-xs text-text-secondary">Ticket reference</p><p className="mt-1 font-mono font-semibold tracking-wide">{ticket.referenceCode}</p></div><div className={`flex items-start gap-2 rounded-lg p-3 text-sm ${checkedIn ? "bg-success/10 text-success" : "bg-warning/10 text-amber-700 dark:text-amber-300"}`}>{checkedIn ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <QrCode className="mt-0.5 size-4 shrink-0" />}<span>{checkedIn ? `Checked in${ticket.checkedInAt ? ` at ${new Date(ticket.checkedInAt).toLocaleString()}` : ""}. Live event access is unlocked.` : "Present this QR code to event staff. Live access unlocks after check-in."}</span></div>{checkedIn ? <Button asChild><Link href={`/events/${ticket.slug}/live?ticket=${ticket.ticketToken}`}>Enter Event</Link></Button> : <Button disabled>Enter Event after Check-in</Button>}</div><div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white p-4 text-center"><Image src={ticket.qrCodeDataUrl} alt="Secure ticket QR code" width={220} height={220} unoptimized /><p className="mt-2 text-xs text-slate-600">Scan for ticket verification</p></div></CardContent></Card></main><PublicFooter /></>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="flex gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-xs text-text-secondary">{label}</p><p className="text-sm font-medium text-text-primary">{value}</p></div></div>;
}
