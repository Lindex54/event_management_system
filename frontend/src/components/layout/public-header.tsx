import Link from "next/link";
import { CalendarDays, Menu } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigation = [
  { label: "Home", href: "#home" },
  { label: "Events", href: "#events" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function Brand() {
  return (
    <Link href="#home" className="flex items-center gap-2.5" aria-label="Evently home">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <CalendarDays className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold tracking-tight text-text-primary">Evently</span>
    </Link>
  );
}

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ModeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button className="bg-primary hover:bg-primary-dark" asChild>
            <Link href="/signup">Create Account</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[min(86vw,22rem)] p-0">
              <SheetHeader className="border-b border-border px-5 py-5 text-left">
                <SheetTitle asChild>
                  <Brand />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col px-3 py-4" aria-label="Mobile navigation">
                {navigation.map((item) => (
                  <SheetClose key={item.label} asChild>
                    <Link
                      href={item.href}
                      className="rounded-lg px-3 py-3 text-base font-medium text-text-primary transition-colors hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto grid gap-2 border-t border-border p-4">
                <SheetClose asChild>
                  <Button variant="outline" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button className="bg-primary hover:bg-primary-dark" asChild>
                    <Link href="/signup">Create Account</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
