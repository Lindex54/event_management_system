import type { Metadata } from "next";
import { CalendarCheck, Handshake, Sparkles, Users } from "lucide-react";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About | Evently",
  description: "Learn about Evently, the event management platform connecting organizers and attendees.",
};

const values = [
  { icon: Sparkles, title: "Memorable Experiences", description: "We help organizers craft events people actually want to attend, from conferences to community meetups." },
  { icon: Users, title: "Built for Everyone", description: "Attendees, event staff, organizers, and administrators each get tools shaped around what they need to do." },
  { icon: Handshake, title: "Trust & Transparency", description: "Registrations, check-ins, and attendance data stay accurate and available to the people who need them." },
  { icon: CalendarCheck, title: "End-to-End Management", description: "From the first invitation to the final check-in, Evently covers the full lifecycle of an event." },
];

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">About Evently</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Bringing people and events together</h1>
            <p className="mt-4 text-text-secondary">
              Evently is an event management platform that helps organizers plan and run events, gives event staff
              a fast way to manage check-ins, and gives attendees a simple place to discover events and manage
              their registrations.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {values.map((item) => (
                <Card key={item.title} className="shadow-none">
                  <CardContent className="flex gap-4 p-6">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><item.icon className="size-5" /></span>
                    <div>
                      <h2 className="font-semibold text-text-primary">{item.title}</h2>
                      <p className="mt-1.5 text-sm leading-6 text-text-secondary">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
