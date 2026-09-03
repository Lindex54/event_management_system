import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/types/event";

interface EventCardProps {
  event: EventItem;
  showOrganizer?: boolean;
}

const statusStyles = {
  Open: "border-success/20 bg-success/10 text-success",
  "Selling fast": "border-warning/25 bg-warning/10 text-amber-700 dark:text-amber-300",
  "Registration closed": "border-danger/20 bg-danger/10 text-danger",
};

export function EventCard({ event, showOrganizer = false }: EventCardProps) {
  return (
    <Card className="h-full gap-0 overflow-hidden rounded-xl py-0 shadow-none transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/8">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={event.image}
          alt={event.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
        />
        {event.featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-navy hover:bg-accent">Featured</Badge>
        )}
        {event.status && (
          <Badge
            variant="outline"
            className={cn("absolute top-3 right-3 backdrop-blur-sm", statusStyles[event.status])}
          >
            {event.status}
          </Badge>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg leading-6 font-semibold text-text-primary">{event.title}</h3>
        <div className="mt-4 space-y-2.5 text-sm text-text-secondary">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {event.date}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {event.time}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </p>
        </div>
        {showOrganizer && (
          <p className="mt-4 border-t border-border pt-4 text-xs text-text-secondary">
            Organized by <span className="font-semibold text-text-primary">{event.organizer}</span>
          </p>
        )}
        <Link
          href="#"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          View Event
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
