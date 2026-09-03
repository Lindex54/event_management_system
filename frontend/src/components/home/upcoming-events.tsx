import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { EventCard } from "@/components/home/event-card";
import { Button } from "@/components/ui/button";
import { upcomingEvents } from "@/data/events";

export function UpcomingEvents() {
  return (
    <section id="upcoming" className="bg-surface py-18 sm:py-22">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">What&apos;s next</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Upcoming Events</h2>
            <p className="mt-3 max-w-2xl text-text-secondary">Plan ahead with events coming up across the city.</p>
          </div>
          <Button variant="outline" className="w-fit bg-surface" asChild>
            <Link href="#">
              Browse all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
