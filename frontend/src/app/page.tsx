import { EventSearch } from "@/components/home/event-search";
import { FeaturedEvents } from "@/components/home/featured-events";
import { HappeningSoon } from "@/components/home/happening-soon";
import { HeroSection } from "@/components/home/hero-section";
import { OrganizerCta } from "@/components/home/organizer-cta";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function Home() {
  return (
    <>
      <PublicHeader />
      <main>
        <HeroSection />
        <EventSearch />
        <FeaturedEvents />
        <UpcomingEvents />
        <HappeningSoon />
        <OrganizerCta />
      </main>
      <PublicFooter />
    </>
  );
}
