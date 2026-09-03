import { CalendarDays, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EventSearch() {
  return (
    <section aria-label="Search events" className="relative z-10 -mt-3 px-4 sm:px-6 lg:-mt-7 lg:px-8">
      <form className="mx-auto grid max-w-6xl gap-4 rounded-xl border border-border bg-surface p-4 shadow-lg shadow-navy/5 sm:p-5 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end">
        <div className="space-y-2">
          <Label htmlFor="event-search" className="font-semibold text-text-primary">Search events</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
            <Input id="event-search" type="search" placeholder="Event name or organizer" className="h-11 pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-date" className="font-semibold text-text-primary">Date</Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
            <Input id="event-date" type="date" className="h-11 pl-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-location" className="font-semibold text-text-primary">Location</Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
            <Input id="event-location" placeholder="City or venue" className="h-11 pl-9" />
          </div>
        </div>
        <Button type="submit" className="h-11 bg-primary px-6 font-semibold hover:bg-primary-dark">
          Search
        </Button>
      </form>
    </section>
  );
}
