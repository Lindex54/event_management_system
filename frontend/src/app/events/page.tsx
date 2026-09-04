import type { Metadata } from "next";
import { CalendarX2 } from "lucide-react";

import { PublicEventCard } from "@/components/events/public-event-card";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { listPublicEvents } from "@/lib/api/public-events";

export const metadata: Metadata = {
  title: "Upcoming Events | Evently",
  description: "Browse upcoming events, conferences, workshops and experiences.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof listPublicEvents>> = [];
  let error = "";
  try { events = await listPublicEvents(); }
  catch { error = "Unable to load events right now. Please try again shortly."; }

  return (
    <>
      <PublicHeader />
      <main id="events" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">What&apos;s next</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Upcoming Events</h1>
          <p className="mt-3 text-text-secondary">Discover experiences happening soon, sorted by what&apos;s coming up first.</p>
        </div>

        {error ? (
          <div className="mt-10 rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div>
        ) : events.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => <PublicEventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-xl bg-surface p-14 text-center ring-1 ring-foreground/10">
            <CalendarX2 className="size-8 text-text-secondary" />
            <p className="text-sm text-text-secondary">No upcoming events right now. Check back soon.</p>
          </div>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
