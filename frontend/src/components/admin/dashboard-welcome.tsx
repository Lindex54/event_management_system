"use client";

import { CalendarPlus, UserPlus, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { InvitePeopleDialog } from "@/components/admin/invite-people-dialog";
import { CreateEventDialog } from "@/components/admin/create-event-dialog";
import { Button } from "@/components/ui/button";

export function DashboardWelcome() {
  return (
    <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
      <div>
        <p className="text-sm font-medium text-primary">Thursday, September 3</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Welcome back, Administrator
        </h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Here&apos;s what&apos;s happening across your events and platform today.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="bg-surface" onClick={() => toast.success("Add organizer form is ready for the next phase") }>
          <UsersRound /> Add Organizer
        </Button>
        <Button variant="outline" className="bg-surface" onClick={() => toast.success("Add user form is ready for the next phase") }>
          <UserPlus /> Add User
        </Button>
        <InvitePeopleDialog
          trigger={<Button variant="outline" className="bg-surface"><UserPlus /> Invite People</Button>}
        />
        <CreateEventDialog trigger={<Button><CalendarPlus /> Create Event</Button>} />
      </div>
    </section>
  );
}
