"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const fallbackTimezones = [
  "Africa/Nairobi", "Africa/Kampala", "Africa/Lagos", "Africa/Cairo", "Africa/Johannesburg",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "America/New_York", "America/Chicago",
  "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Sao_Paulo", "Pacific/Auckland",
];

function allTimezones() {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return fallbackTimezones;
  }
}

function offsetFor(timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en", { timeZone, timeZoneName: "longOffset" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  } catch {
    return "GMT";
  }
}

export function formatTimezone(timeZone: string) {
  const name = timeZone.replaceAll("_", " ");
  return timeZone === "Africa/Nairobi"
    ? `${name} (${offsetFor(timeZone)}) — East Africa Time`
    : `${name} (${offsetFor(timeZone)})`;
}

export function TimezoneSelect({ value, onValueChange, className }: { value: string; onValueChange: (value: string) => void; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const zones = React.useMemo(() => allTimezones(), []);
  const filtered = zones.filter((zone) => formatTimezone(zone).toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("h-10 w-full justify-between bg-background font-normal", className)}>
          <span className="truncate">{formatTimezone(value)}</span><ChevronsUpDown className="shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(24rem,calc(100vw-2rem))] gap-2 p-2">
        <div className="relative"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search time zones..." className="h-9 pl-9" /></div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.map((zone) => <button type="button" key={zone} onClick={() => { onValueChange(zone); setOpen(false); setSearch(""); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted"><Check className={cn("size-4 shrink-0 text-primary", zone === value ? "opacity-100" : "opacity-0")} /><span className="truncate">{formatTimezone(zone)}</span></button>)}
          {!filtered.length && <p className="p-4 text-center text-sm text-text-secondary">No timezone found.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
