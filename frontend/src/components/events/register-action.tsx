"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { attendeeApi, currentAttendeeSession } from "@/lib/api/attendee";

export function RegisterAction({ eventId, full, closed }: { eventId: number; full: boolean; closed: boolean }) {
  const [session, setSession] = React.useState<"loading" | "none" | "attendee" | "other">("loading");
  const [registered, setRegistered] = React.useState(false);
  const [registering, setRegistering] = React.useState(false);

  React.useEffect(() => {
    void currentAttendeeSession().then((user) => {
      if (!user) { setSession("none"); return; }
      setSession(user.roles.includes("attendee") && user.attendeeId ? "attendee" : "other");
    }).catch(() => setSession("none"));
  }, []);

  async function register() {
    setRegistering(true);
    try {
      const result = await attendeeApi<{ result: string }>(`/events/${eventId}/register`, { method: "POST" });
      if (result.result === "ALREADY_REGISTERED") { toast.info("You are already registered for this event"); setRegistered(true); }
      else { toast.success("You are registered for this event"); setRegistered(true); }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to register for this event");
    } finally {
      setRegistering(false);
    }
  }

  if (session === "loading") return <Button disabled className="w-full sm:w-auto">Loading...</Button>;

  if (session === "none") {
    return <Button asChild className="w-full sm:w-auto"><Link href="/login"><LogIn /> Sign In to Register</Link></Button>;
  }

  if (session === "other") {
    return <p className="text-sm text-text-secondary">Only attendee accounts can register for events.</p>;
  }

  if (registered) {
    return <Button disabled className="w-full sm:w-auto"><CheckCircle2 /> Registered</Button>;
  }

  if (closed) return <Button disabled className="w-full sm:w-auto">Registration Closed</Button>;
  if (full) return <Button disabled className="w-full sm:w-auto">Event Full</Button>;

  return (
    <Button onClick={() => void register()} disabled={registering} className="w-full sm:w-auto">
      <UserPlus /> {registering ? "Registering..." : "Register for This Event"}
    </Button>
  );
}
