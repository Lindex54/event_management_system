"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Ticket, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { attendeeApi, currentAttendeeSession } from "@/lib/api/attendee";

interface RegistrationResponse {
  referenceCode: string;
  ticketUrl: string;
  accountSetupRequired: boolean;
  emailQueued: boolean;
}

export function RegisterAction({ eventSlug, eventName, full, closed }: { eventSlug: string; eventName: string; full: boolean; closed: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telephone, setTelephone] = React.useState("");
  const [registering, setRegistering] = React.useState(false);
  const [ticket, setTicket] = React.useState<RegistrationResponse | null>(null);

  React.useEffect(() => {
    void currentAttendeeSession().then(async (session) => {
      if (!session?.attendeeId) return;
      setFullName(session.name);
      setEmail(session.email);
      const profile = await attendeeApi<{ telephone?: string | null }>("/profile");
      setTelephone(profile.telephone ?? "");
    }).catch(() => undefined);
  }, []);

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegistering(true);
    try {
      const response = await fetch(`/api/events/${encodeURIComponent(eventSlug)}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), telephone: telephone.trim() }),
      });
      const result = await response.json() as { success: boolean; message?: string; data?: RegistrationResponse };
      if (!response.ok || !result.success || !result.data) throw new Error(result.message ?? "Unable to register");
      setTicket(result.data);
      toast.success("Registration successful");
      toast.success("Ticket generated and ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to register for this event");
    } finally {
      setRegistering(false);
    }
  }

  if (closed) return <Button disabled className="w-full sm:w-auto">Registration Closed</Button>;
  if (full) return <Button disabled className="w-full sm:w-auto">Event Full</Button>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="w-full sm:w-auto"><UserPlus /> Register for This Event</Button></DialogTrigger>
      <DialogContent>
        {ticket ? (
          <>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><CheckCircle2 className="text-success" /> Registration confirmed</DialogTitle><DialogDescription>Your secure ticket for {eventName} is ready.</DialogDescription></DialogHeader>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-medium text-text-secondary">Registration reference</p>
              <p className="mt-1 font-mono font-semibold tracking-wide text-text-primary">{ticket.referenceCode}</p>
              <p className="mt-3 text-sm text-text-secondary">Your ticket link is available immediately below. {ticket.accountSetupRequired ? "Your password setup email is being sent now." : "Your confirmation email is being sent now."}</p>
            </div>
            <DialogFooter><Button asChild><Link href={ticket.ticketUrl}><Ticket /> View Ticket</Link></Button></DialogFooter>
          </>
        ) : (
          <form onSubmit={register} className="space-y-4">
            <DialogHeader><DialogTitle>Register for {eventName}</DialogTitle><DialogDescription>Your details are used for your attendee account and ticket confirmation.</DialogDescription></DialogHeader>
            <Field id="participant-name" label="Full name"><Input id="participant-name" value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></Field>
            <Field id="participant-email" label="Email"><Input id="participant-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></Field>
            <Field id="participant-telephone" label="Telephone"><Input id="participant-telephone" type="tel" value={telephone} onChange={(event) => setTelephone(event.target.value)} autoComplete="tel" placeholder="+256 700 000 000" required /></Field>
            <p className="text-xs leading-5 text-text-secondary">A unique QR ticket will be emailed to you. Live event access unlocks only after staff check-in.</p>
            <DialogFooter><Button type="submit" disabled={registering}><UserPlus />{registering ? "Registering..." : "Confirm Registration"}</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
