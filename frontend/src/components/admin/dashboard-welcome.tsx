"use client";

import Link from "next/link";
import { CalendarPlus, UserPlus, UsersRound } from "lucide-react";

import { InvitePeopleDialog } from "@/components/admin/invite-people-dialog";
import { CreateEventDialog } from "@/components/admin/create-event-dialog";
import { Button } from "@/components/ui/button";

const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export function DashboardWelcome({ onEventSaved }: { onEventSaved?: () => void | Promise<void> }) {
  return (
    <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
      <div>
        <p className="text-sm font-medium text-primary">{today}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Welcome back, Administrator
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Here&apos;s what&apos;s happening across your events and platform today.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="bg-surface" asChild>
          <Link href="/admin/organizers"><UsersRound /> Add Organizer</Link>
        </Button>
        <Button variant="outline" className="bg-surface" asChild>
          <Link href="/admin/users"><UserPlus /> Add User</Link>
        </Button>
        <InvitePeopleDialog
          trigger={<Button variant="outline" className="bg-surface"><UserPlus /> Invite People</Button>}
        />
        <CreateEventDialog trigger={<Button><CalendarPlus /> Create Event</Button>} onSaved={onEventSaved} />
      </div>
    </section>
  );
}
