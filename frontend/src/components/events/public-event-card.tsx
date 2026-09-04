import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, ImageOff, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicEvent } from "@/lib/api/public-events";

export function PublicEventCard({ event }: { event: PublicEvent }) {
  const full = event.registrations >= event.capacity;
  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <Card className="h-full gap-0 overflow-hidden rounded-xl py-0 shadow-none transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/8">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.imageAlt ?? event.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-secondary/40"><ImageOff className="size-8" /></div>
          )}
          {full && <Badge variant="outline" className="absolute top-3 right-3 border-danger/20 bg-danger/10 text-danger backdrop-blur-sm">Sold Out</Badge>}
        </div>
        <CardContent className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 text-lg leading-6 font-semibold text-text-primary">{event.name}</h3>
          <div className="mt-4 space-y-2.5 text-sm text-text-secondary">
            <p className="flex items-center gap-2"><CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />{event.dateLabel}</p>
            {event.time && <p className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-primary" aria-hidden="true" />{event.time}{event.endTime ? ` – ${event.endTime}` : ""}</p>}
            {event.venue && <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{event.venue}</span></p>}
          </div>
          {event.description && <p className="mt-4 line-clamp-2 border-t border-border pt-4 text-xs text-text-secondary">{event.description}</p>}
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-primary-dark">
            View Event
            <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
