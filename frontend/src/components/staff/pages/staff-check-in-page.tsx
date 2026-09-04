"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, QrCode, Search, UserCheck, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { staffApi } from "@/lib/api/staff";

interface StaffEvent { id: number; name: string; dateLabel: string; }
interface SearchResult { id: number; referenceCode: string; attendee: string; email: string; eventId: number; status: "Confirmed" | "Pending" | "Cancelled"; checkInStatus: "Checked In" | "Not Checked In"; checkedInAt: string | null; }

export function StaffCheckInPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = React.useState<StaffEvent[]>([]);
  const [eventId, setEventId] = React.useState(searchParams.get("eventId") ?? "");
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [searched, setSearched] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [checkingInId, setCheckingInId] = React.useState<number | null>(null);
  const [selected, setSelected] = React.useState<SearchResult | null>(null);

  React.useEffect(() => {
    void staffApi<StaffEvent[]>("/events").then((list) => {
      setEvents(list);
      if (!eventId && list.length === 1) setEventId(String(list[0]!.id));
    }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load assigned events"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(event?: React.FormEvent) {
    event?.preventDefault();
    if (!eventId) { toast.error("Select an event first"); return; }
    if (!query.trim()) { toast.error("Scan a ticket or enter a name, email, or registration ID"); return; }
    setSearching(true);
    try {
      const token = query.match(/[a-f0-9]{64}/i)?.[0];
      if (token) {
        const verification = await staffApi<{ result: string; registration?: SearchResult }>("/check-in/verify-ticket", { method: "POST", body: JSON.stringify({ eventId: Number(eventId), ticketToken: token }) });
        const matches = verification.registration ? [verification.registration] : [];
        setResults(matches); setSearched(true);
        if (verification.result === "VALID") toast.success("Valid ticket");
        else if (verification.result === "ALREADY_CHECKED_IN") toast.info("Already checked in");
        else if (verification.result === "CANCELLED") toast.error("Cancelled registration");
        else toast.error("Registration is not confirmed");
        return;
      }
      const data = await staffApi<SearchResult[]>(`/check-in/search?eventId=${eventId}&q=${encodeURIComponent(query.trim())}`);
      setResults(data); setSearched(true);
      if (!data.length) toast.info("No matching registration found");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Invalid ticket"); }
    finally { setSearching(false); }
  }

  async function checkIn(registration: SearchResult) {
    setCheckingInId(registration.id);
    try {
      const result = await staffApi<{ result: string }>(`/registrations/${registration.id}/check-in`, { method: "POST" });
      if (result.result === "ALREADY_CHECKED_IN") toast.info(resultMessage(result.result)); else toast.success(resultMessage(result.result));
      setResults((current) => current.map((item) => item.id === registration.id ? { ...item, checkInStatus: "Checked In", checkedInAt: new Date().toISOString() } : item));
      setSelected(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to check in attendee"); }
    finally { setCheckingInId(null); }
  }

  return <div className="mx-auto max-w-[1200px] space-y-5 p-4 sm:p-6"><PageHeader title="Check-in" description="Scan or enter a secure ticket, or search a registered attendee." /><Card><CardContent className="p-5"><form onSubmit={search} className="flex flex-col gap-3 sm:flex-row"><Select value={eventId} onValueChange={setEventId}><SelectTrigger className="h-11 sm:w-72"><SelectValue placeholder="Select an assigned event" /></SelectTrigger><SelectContent>{events.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name} · {item.dateLabel}</SelectItem>)}</SelectContent></Select><div className="relative flex-1"><QrCode className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Scan ticket or search name, email, reference" className="h-11 pl-9" /></div><Button type="submit" disabled={searching} className="h-11"><Search />{searching ? "Verifying..." : "Verify"}</Button></form></CardContent></Card>{searched && (results.length ? <div className="grid gap-3 sm:grid-cols-2">{results.map((result) => <Card key={result.id}><CardContent className="space-y-3 p-5"><div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-text-primary">{result.attendee}</p><p className="text-xs text-text-secondary">{result.email}</p></div><StatusBadge status={result.checkInStatus} /></div><div className="flex flex-wrap items-center gap-2 text-xs"><Badge variant="outline">{result.referenceCode}</Badge><StatusBadge status={result.status} /></div><div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1" onClick={() => setSelected(result)}><UserRoundSearch />Details</Button><Button size="sm" className="flex-1" disabled={result.checkInStatus === "Checked In" || result.status !== "Confirmed" || checkingInId === result.id} onClick={() => void checkIn(result)}><UserCheck />{result.checkInStatus === "Checked In" ? "Checked In" : "Check In"}</Button></div></CardContent></Card>)}</div> : <Card><CardContent className="p-10 text-center text-sm text-text-secondary">No matching registration found for this event.</CardContent></Card>)}<Dialog open={Boolean(selected)} onOpenChange={(value) => { if (!value) setSelected(null); }}><DialogContent>{selected && <><DialogHeader><DialogTitle>{selected.attendee}</DialogTitle><DialogDescription>{selected.email}</DialogDescription></DialogHeader><div className="space-y-2 text-sm"><Row label="Registration ID" value={selected.referenceCode} /><div className="flex justify-between"><span className="text-text-secondary">Registration Status</span><StatusBadge status={selected.status} /></div><div className="flex justify-between"><span className="text-text-secondary">Check-in Status</span><StatusBadge status={selected.checkInStatus} /></div>{selected.checkedInAt && <Row label="Checked In At" value={new Date(selected.checkedInAt).toLocaleString()} />}</div><DialogFooter><Button disabled={selected.checkInStatus === "Checked In" || selected.status !== "Confirmed" || checkingInId === selected.id} onClick={() => void checkIn(selected)}><CheckCircle2 />{selected.checkInStatus === "Checked In" ? "Already Checked In" : "Confirm Check-in"}</Button></DialogFooter></>}</DialogContent></Dialog></div>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><span className="text-text-secondary">{label}</span><span className="text-right font-medium text-text-primary">{value}</span></div>; }
function resultMessage(result: string) { return result === "CHECKED_IN" ? "Check-in successful" : result === "ALREADY_CHECKED_IN" ? "Attendee was already checked in" : result === "CANCELLED" ? "Registration was cancelled" : result === "NOT_CONFIRMED" ? "Registration is not confirmed" : "Registration not found"; }
