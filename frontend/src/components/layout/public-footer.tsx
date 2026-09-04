import Link from "next/link";
import { CalendarDays } from "lucide-react";

const exploreLinks = [
  { label: "Browse Events", href: "/events" },
  { label: "Featured Events", href: "/#featured" },
  { label: "Happening Soon", href: "/#happening-soon" },
  { label: "Subscribe for Updates", href: "/#subscribe" },
];
const supportLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Help Center", href: "/contact" },
  { label: "Privacy", href: "/contact" },
];

export function PublicFooter() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <CalendarDays className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">Evently</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Helping people discover memorable experiences and giving organizers the tools to bring them to life.
          </p>
          <div className="mt-6 flex gap-2">
            {["LinkedIn", "Instagram", "Facebook"].map((label) => (
              <Link
                key={label}
                href="#"
                className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <ul className="mt-4 space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Support</h2>
          <ul className="mt-4 space-y-3">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-slate-400 sm:px-6 lg:px-8">
          © 2026 Evently. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
