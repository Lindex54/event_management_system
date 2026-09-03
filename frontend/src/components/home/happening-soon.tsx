import { Clock, MapPin } from "lucide-react";

import { happeningSoonEvents } from "@/data/events";

export function HappeningSoon() {
  return (
    <section className="py-18 sm:py-22">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Next few days</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Happening Soon</h2>
            <p className="mt-4 max-w-md leading-7 text-text-secondary">
              Make room in your week for something interesting nearby.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {happeningSoonEvents.map((event, index) => (
              <article
                key={event.id}
                className="grid grid-cols-[4.75rem_1fr] gap-4 p-4 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center sm:p-5"
              >
                <div className="border-r border-border pr-4 text-center">
                  <p className="text-xs font-semibold tracking-wider text-primary">{event.day}</p>
                  <p className="mt-1 text-sm font-bold text-text-primary">{event.date}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{event.title}</h3>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-text-secondary sm:flex-row sm:gap-4">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" aria-hidden="true" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5" aria-hidden="true" /> {event.location}
                    </span>
                  </div>
                </div>
                <span className="mt-3 hidden size-2 rounded-full bg-success sm:block" aria-label="Registration open" />
                {index < happeningSoonEvents.length - 1 && (
                  <div className="col-span-full mx-0 h-px bg-border" />
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
