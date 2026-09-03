import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh bg-surface lg:grid-cols-[minmax(0,0.95fr)_minmax(32rem,1.05fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-navy lg:block">
        <Image
          src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=90"
          alt="A speaker presenting to attendees at a professional event"
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 0vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy/72" />
        <div className="relative flex h-full min-h-svh flex-col justify-between p-10 text-white xl:p-14">
          <Link href="/" className="inline-flex w-fit items-center gap-2.5" aria-label="Evently homepage">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight">Evently</span>
          </Link>

          <div className="max-w-xl pb-8">
            <p className="text-sm font-semibold tracking-[0.14em] text-blue-300 uppercase">Event Management System</p>
            <h2 className="mt-4 text-4xl leading-tight font-bold tracking-tight xl:text-5xl">
              Bringing people and events together.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200 xl:text-lg">
              Discover events, manage registrations and stay connected to the experiences that matter.
            </p>
          </div>

          <p className="text-xs text-slate-300">Discover. Connect. Experience.</p>
        </div>
      </section>

      <section className="flex min-h-svh flex-col bg-surface">
        <header className="flex h-18 items-center justify-between border-b border-border/70 px-4 sm:px-8 lg:border-b-0 lg:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-primary">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          <div className="lg:hidden">
            <Link href="/" className="flex items-center gap-2 font-bold text-text-primary" aria-label="Evently homepage">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
              </span>
              Evently
            </Link>
          </div>
          <ModeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-12 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </main>
  );
}
