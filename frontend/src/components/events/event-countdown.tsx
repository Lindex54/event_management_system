"use client";

import * as React from "react";

interface CountdownParts {
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  started: boolean;
}

function offsetAt(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute), Number(values.second)) - instant.getTime();
}

function eventInstant(date: string, time: string | null, timeZone: string): number {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = (time ?? "00:00").split(":").map(Number);
  const localAsUtc = Date.UTC(year!, month! - 1, day!, hour!, minute!);
  let instant = localAsUtc - offsetAt(new Date(localAsUtc), timeZone);
  instant = localAsUtc - offsetAt(new Date(instant), timeZone);
  return instant;
}

function remaining(target: number): CountdownParts {
  let totalMinutes = Math.max(0, Math.floor((target - Date.now()) / 60_000));
  const started = target <= Date.now();
  const minutesPerDay = 24 * 60;
  const months = Math.floor(totalMinutes / (30 * minutesPerDay));
  totalMinutes -= months * 30 * minutesPerDay;
  const weeks = Math.floor(totalMinutes / (7 * minutesPerDay));
  totalMinutes -= weeks * 7 * minutesPerDay;
  const days = Math.floor(totalMinutes / minutesPerDay);
  totalMinutes -= days * minutesPerDay;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - hours * 60;
  return { months, weeks, days, hours, minutes, started };
}

export function EventCountdown({ date, time, timeZone }: { date: string; time: string | null; timeZone: string }) {
  const [countdown, setCountdown] = React.useState<CountdownParts | null>(null);

  React.useEffect(() => {
    let target: number;
    try { target = eventInstant(date, time, timeZone); }
    catch { target = new Date(`${date}T${time ?? "00:00"}`).getTime(); }
    const update = () => setCountdown(remaining(target));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [date, time, timeZone]);

  if (!countdown) return <p className="text-sm text-text-secondary">Calculating time remaining…</p>;
  if (countdown.started) return <p className="font-semibold text-primary">This event has started.</p>;

  const units = [
    ["Months", countdown.months],
    ["Weeks", countdown.weeks],
    ["Days", countdown.days],
    ["Hours", countdown.hours],
    ["Minutes", countdown.minutes],
  ] as const;

  return (
    <div aria-label="Time remaining until the event">
      <p className="mb-3 text-xs font-semibold tracking-[0.1em] text-text-secondary uppercase">Event starts in</p>
      <div className="grid grid-cols-5 gap-1.5">
        {units.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-muted/60 px-1 py-2 text-center">
            <p className="text-base font-bold text-text-primary tabular-nums">{value}</p>
            <p className="mt-0.5 text-[10px] text-text-secondary">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
