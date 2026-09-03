import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OrganizerCta() {
  return (
    <section id="organize" className="px-4 pb-18 sm:px-6 sm:pb-22 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 overflow-hidden rounded-xl bg-navy px-6 py-10 text-white sm:px-10 md:flex-row md:items-center lg:px-14 lg:py-12">
        <div>
          <p className="text-sm font-semibold tracking-[0.12em] text-blue-300 uppercase">For organizers</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Planning an event?</h2>
          <p className="mt-3 text-slate-300">Create, promote and manage your event from one place.</p>
        </div>
        <Button className="h-11 shrink-0 bg-primary px-5 font-semibold hover:bg-primary-dark" asChild>
          <Link href="#create-event">
            Create an Event
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
