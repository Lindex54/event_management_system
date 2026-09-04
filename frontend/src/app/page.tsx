import { EventSearch } from "@/components/home/event-search";
import { FeaturedEvents } from "@/components/home/featured-events";
import { HappeningSoon } from "@/components/home/happening-soon";
import { HeroSection } from "@/components/home/hero-section";
import { OrganizerCta } from "@/components/home/organizer-cta";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { listPublicEvents } from "@/lib/api/public-events";

export const dynamic = "force-dynamic";

export default async function Home() {
  let events: Awaited<ReturnType<typeof listPublicEvents>> = [];
  try { events = await listPublicEvents(); } catch { /* Sections show their empty state. */ }
  const featured = events.filter((event) => Boolean(event.isFeatured)).slice(0, 6);
  return (
    <>
      <PublicHeader />
      <main>
        <HeroSection />
        <EventSearch />
        <FeaturedEvents events={featured.length ? featured : events.slice(0, 3)} />
        <UpcomingEvents events={events.slice(0, 6)} />
        <HappeningSoon events={events.slice(0, 3)} />
        <OrganizerCta />
      </main>
      <PublicFooter />
    </>
  );
}
