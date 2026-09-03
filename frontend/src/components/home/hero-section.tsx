"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(37,99,235,0.10),transparent_34%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
            <span className="size-1.5 rounded-full bg-accent" />
            Find your next experience
          </div>
          <h1 className="max-w-2xl text-4xl leading-[1.12] font-bold tracking-[-0.035em] text-text-primary sm:text-5xl lg:text-6xl">
            Discover Events Worth Showing Up For
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
            Explore upcoming events, conferences, workshops and experiences happening around you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button className="h-11 bg-primary px-5 font-semibold hover:bg-primary-dark" asChild>
              <Link href="#events">
                Explore Events
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="outline" className="h-11 border-border bg-surface px-5 font-semibold" asChild>
              <Link href="#subscribe">Subscribe for Updates</Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 border-t border-border pt-6 text-sm text-text-secondary">
            <div>
              <strong className="block text-lg font-bold text-text-primary">120+</strong>
              Upcoming events
            </div>
            <div className="h-9 w-px bg-border" />
            <div>
              <strong className="block text-lg font-bold text-text-primary">40+</strong>
              Trusted organizers
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-navy shadow-2xl shadow-navy/15">
            <Image
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=90"
              alt="A packed audience at a professional conference"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/5 to-transparent" />
            <div className="absolute right-5 bottom-5 left-5 text-white">
              <p className="text-xs font-semibold tracking-[0.14em] text-blue-200 uppercase">Featured this month</p>
              <p className="mt-2 text-xl font-semibold sm:text-2xl">Future of Tech Summit 2026</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" /> October 16
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" /> Kampala
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-2 -bottom-5 hidden w-44 rounded-lg border border-border bg-surface p-3 shadow-lg sm:block lg:-right-5">
            <p className="text-xs font-medium text-text-secondary">Registration status</p>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <span className="size-2 rounded-full bg-success" /> Open now
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
