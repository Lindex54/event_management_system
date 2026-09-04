"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { PublicEventCard } from "@/components/events/public-event-card";
import type { PublicEvent } from "@/lib/api/public-events";

import "swiper/css";
import "swiper/css/pagination";

export function FeaturedEvents({ events }: { events: PublicEvent[] }) {
  return (
    <section id="events" className="py-18 sm:py-22">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Curated for you</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Featured Events</h2>
            <p className="mt-3 max-w-2xl text-text-secondary">Standout experiences selected from trusted organizers.</p>
          </div>
          <Link href="#upcoming" className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark sm:flex">
            View all events <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <Swiper
          modules={[Pagination, A11y]}
          spaceBetween={20}
          slidesPerView={1.08}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="featured-events-swiper mt-8 pb-12!"
        >
          {events.map((event) => (
            <SwiperSlide key={event.id} className="h-auto!">
              <PublicEventCard event={event} featured showOrganizer />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
