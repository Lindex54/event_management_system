"use client";

import * as React from "react";
import { ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function OrganizerCta() {
  const [email, setEmail] = React.useState("");

  function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    toast.success("You’re subscribed! We’ll keep you updated about upcoming events.");
    setEmail("");
  }

  return (
    <section id="subscribe" className="px-4 pb-18 sm:px-6 sm:pb-22 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 overflow-hidden rounded-xl bg-navy px-6 py-10 text-white sm:px-10 lg:flex-row lg:items-center lg:px-14 lg:py-12">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-blue-300 uppercase">Never miss an event</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Stay in the loop</h2>
          <p className="mt-3 text-slate-300">
            Subscribe to receive updates about upcoming events, experiences and registration openings.
          </p>
        </div>

        <form onSubmit={subscribe} className="w-full max-w-lg" aria-label="Subscribe for event updates">
          <label htmlFor="event-subscription-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                id="event-subscription-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                autoComplete="email"
                required
                className="h-11 border-white/15 bg-white/10 pl-10 text-white placeholder:text-slate-400 focus-visible:border-blue-400"
              />
            </div>
            <Button type="submit" className="h-11 shrink-0 bg-primary px-5 font-semibold hover:bg-primary-dark">
              Subscribe
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Event updates only. Unsubscribe whenever you want.</p>
        </form>
      </div>
    </section>
  );
}
