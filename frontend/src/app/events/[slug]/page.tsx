import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarClock, CalendarDays, Clock, ImageOff, MapPin, Mic2, Users } from "lucide-react";

import { AgendaSection } from "@/components/events/agenda-section";
import { RegisterAction } from "@/components/events/register-action";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicEvent } from "@/lib/api/public-events";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(slug).catch(() => null);
  if (!event) return { title: "Event Not Found | Evently" };
  return { title: `${event.name} | Evently`, description: event.description ?? undefined };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEvent(slug).catch(() => null);
  if (!event) notFound();

  const full = event.registrations >= event.capacity;
  const closed = Boolean(event.registrationClosesAt && new Date(event.registrationClosesAt) < new Date()) || !["Upcoming", "Active"].includes(event.status);

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl bg-muted">
          {event.imageUrl ? (
            <Image src={event.imageUrl} alt={event.imageAlt ?? event.name} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-secondary/40"><ImageOff className="size-10" /></div>
          )}
          <div className="absolute top-4 right-4"><Badge variant="outline" className="bg-surface/90 backdrop-blur-sm">{event.status}</Badge></div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <div>
              {event.theme && <p className="text-sm font-semibold tracking-[0.1em] text-primary uppercase">{event.theme}</p>}
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{event.name}</h1>
              <p className="mt-2 text-sm text-text-secondary">Organized by <span className="font-semibold text-text-primary">{event.organizer}</span></p>
              {event.coOrganizers.length > 0 && (
                <p className="mt-1 text-sm text-text-secondary">Co-organized by <span className="font-medium text-text-primary">{event.coOrganizers.map((c) => c.name).join(", ")}</span></p>
              )}
            </div>

            {event.description && (
              <Card className="shadow-none"><CardContent className="p-6"><h2 className="mb-3 text-lg font-semibold text-text-primary">About this event</h2><p className="text-sm leading-6 whitespace-pre-line text-text-secondary">{event.description}</p></CardContent></Card>
            )}

            <AgendaSection event={event} />

            {event.speakers.length > 0 && (
              <Card className="shadow-none">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-lg font-semibold text-text-primary">Speakers &amp; Guests</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Avatar className="size-11 shrink-0">
                          <AvatarImage src={speaker.photoUrl ?? undefined} alt={speaker.name} />
                          <AvatarFallback className="bg-primary/10 font-semibold text-primary">{speaker.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary">{speaker.name}</p>
                          <p className="text-xs text-text-secondary">{speaker.title}{speaker.organization ? ` · ${speaker.organization}` : ""}</p>
                          {speaker.bio && <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-text-secondary">{speaker.bio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {event.schedule.length > 0 && (
              <Card className="shadow-none">
                <CardContent className="space-y-3 p-6">
                  <h2 className="text-lg font-semibold text-text-primary">Schedule</h2>
                  {event.schedule.map((item, index) => (
                    <div key={index} className="flex flex-col gap-1 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-medium text-text-primary">{item.title}</p>
                        {item.description && <p className="mt-0.5 text-xs text-text-secondary">{item.description}</p>}
                        {item.speaker && <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary"><Mic2 className="size-3" />{item.speaker}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs text-text-secondary sm:mt-0.5"><Clock className="size-3" />{item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}{item.room ? ` · ${item.room}` : ""}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="shadow-none">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3 text-sm text-text-secondary">
                  <p className="flex items-center gap-2.5"><CalendarDays className="size-4 shrink-0 text-primary" />{event.dateLabel}</p>
                  {event.time && <p className="flex items-center gap-2.5"><Clock className="size-4 shrink-0 text-primary" />{event.time}{event.endTime ? ` – ${event.endTime}` : ""}</p>}
                  {event.venue && <p className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" /><span>{event.venue}{event.venueAddress ? <span className="block text-xs">{event.venueAddress}</span> : null}</span></p>}
                  <p className="flex items-center gap-2.5"><Users className="size-4 shrink-0 text-primary" />{event.registrations} / {event.capacity} registered</p>
                  {event.registrationClosesAt && <p className="flex items-center gap-2.5"><CalendarClock className="size-4 shrink-0 text-primary" />Registration closes {new Date(event.registrationClosesAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="text-text-secondary">Registration</span>
                  <Badge variant={closed || full ? "outline" : "default"}>{closed ? "Closed" : full ? "Full" : "Open"}</Badge>
                </div>
                <RegisterAction eventSlug={event.slug} eventName={event.name} full={full} closed={closed} />
              </CardContent>
            </Card>
            <Link href="/events" className="block text-center text-sm font-semibold text-primary hover:underline">← Back to all events</Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
