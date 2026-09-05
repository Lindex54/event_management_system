"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CameraIcon, CheckCircle2, QrCode, ScanLine } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { QrScannerDialog } from "@/components/staff/qr-scanner-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { staffApi } from "@/lib/api/staff";

interface StaffEvent { id: number; name: string; dateLabel: string; }
interface CheckedInRegistration { id: number; referenceCode: string; attendee: string; email: string; status: "Confirmed" | "Pending" | "Cancelled"; }
interface ScanResponse { result: string; registration?: CheckedInRegistration; }

export function StaffCheckInPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = React.useState<StaffEvent[]>([]);
  const [eventId, setEventId] = React.useState(searchParams.get("eventId") ?? "");
  const [ticket, setTicket] = React.useState("");
  const [scanning, setScanning] = React.useState(false);
  const [result, setResult] = React.useState<ScanResponse | null>(null);
  const [scannerOpen, setScannerOpen] = React.useState(false);

  React.useEffect(() => {
    void staffApi<StaffEvent[]>("/events").then((list) => {
      setEvents(list);
      if (!eventId && list.length === 1) setEventId(String(list[0]!.id));
    }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load assigned events"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function processScan(rawTicket: string, scanMethod: "Camera" | "Manual") {
    if (!eventId) { toast.error("Select an event first"); return; }
    if (!rawTicket.trim()) { toast.error("Scan a QR code or paste the secure ticket link"); return; }
    setScanning(true);
    setResult(null);
    try {
      const response = await staffApi<ScanResponse>("/check-in/scan", {
        method: "POST",
        body: JSON.stringify({ eventId: Number(eventId), ticketToken: rawTicket.trim(), scanMethod }),
      });
      setResult(response);
      setTicket("");
      if (response.result === "ALREADY_CHECKED_IN") toast.info("Attendee was already checked in");
      else toast.success("Ticket verified and attendee checked in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify this ticket");
    } finally {
      setScanning(false);
    }
  }

  async function scan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await processScan(ticket, "Manual");
  }

  async function handleCameraDetected(data: string) {
    const token = data.match(/[a-f0-9]{64}/i)?.[0] ?? data;
    await processScan(token, "Camera");
  }

  const registration = result?.registration;
  return (
    <div className="mx-auto max-w-[900px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Ticket Check-in" description="Scan the attendee QR code or paste their secure ticket link. Staff cannot check in attendees by name or registration ID." />
      <Card>
        <CardContent className="p-5">
          <form onSubmit={scan} className="space-y-4">
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Select an assigned event" /></SelectTrigger>
              <SelectContent>{events.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name} · {item.dateLabel}</SelectItem>)}</SelectContent>
            </Select>
            <div className="relative">
              <QrCode className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" />
              <Input autoFocus value={ticket} onChange={(event) => setTicket(event.target.value)} placeholder="Scan QR code or paste ticket link" className="h-12 pl-9" />
            </div>
            <Button type="submit" disabled={scanning} className="h-11 w-full"><ScanLine />{scanning ? "Verifying ticket..." : "Verify and Check In"}</Button>
          </form>
          <Button type="button" variant="outline" className="mt-3 h-11 w-full" disabled={!eventId} onClick={() => setScannerOpen(true)}><CameraIcon />Scan with Camera</Button>
        </CardContent>
      </Card>
      {registration && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold text-text-primary">{registration.attendee}</p><p className="text-sm text-text-secondary">{registration.email}</p></div>
              <CheckCircle2 className="size-7 text-success" />
            </div>
            <div className="flex flex-wrap items-center gap-2"><Badge variant="outline">{registration.referenceCode}</Badge><StatusBadge status={registration.status} /><StatusBadge status="Checked In" /></div>
          </CardContent>
        </Card>
      )}
      {scannerOpen && <QrScannerDialog open onOpenChange={setScannerOpen} onDetected={handleCameraDetected} />}
    </div>
  );
}
