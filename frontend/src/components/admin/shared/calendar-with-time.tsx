"use client";

import * as React from "react";
import { Clock2Icon, Globe2 } from "lucide-react";

import { TimezoneSelect } from "@/components/admin/shared/timezone-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimeFormat = "12" | "24";

function TwelveHourInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [rawHour = "", rawMinute = ""] = value.split(":");
  const hour24 = rawHour ? Number(rawHour) : undefined;
  const hour12 = hour24 === undefined ? "" : String(hour24 % 12 || 12);
  const period = hour24 !== undefined && hour24 >= 12 ? "PM" : "AM";

  function update(nextHour = hour12 || "12", nextMinute = rawMinute || "00", nextPeriod = period) {
    let convertedHour = Number(nextHour) % 12;
    if (nextPeriod === "PM") convertedHour += 12;
    onChange(`${String(convertedHour).padStart(2, "0")}:${nextMinute}`);
  }

  return <div id={id} className="grid grid-cols-[1fr_1fr_1.2fr] gap-2"><Select value={hour12} onValueChange={(next) => update(next)}><SelectTrigger className="h-10 w-full bg-background"><SelectValue placeholder="Hour" /></SelectTrigger><SelectContent>{Array.from({ length: 12 }, (_, index) => String(index + 1)).map((hour) => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}</SelectContent></Select><Select value={rawMinute} onValueChange={(next) => update(undefined, next)}><SelectTrigger className="h-10 w-full bg-background"><SelectValue placeholder="Min" /></SelectTrigger><SelectContent>{Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")).map((minute) => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}</SelectContent></Select><Select value={value ? period : ""} onValueChange={(next) => update(undefined, undefined, next)}><SelectTrigger className="h-10 w-full bg-background"><SelectValue placeholder="AM/PM" /></SelectTrigger><SelectContent><SelectItem value="AM">AM</SelectItem><SelectItem value="PM">PM</SelectItem></SelectContent></Select></div>;
}

export function CalendarWithTime({ date, onDateChange, startTime, onStartTimeChange, endTime, onEndTimeChange, timezone, onTimezoneChange }: {
  date?: Date;
  onDateChange: (date?: Date) => void;
  startTime: string;
  onStartTimeChange: (value: string) => void;
  endTime: string;
  onEndTimeChange: (value: string) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
}) {
  const [timeFormat, setTimeFormat] = React.useState<TimeFormat>("12");
  return <Card size="sm" className="w-full shadow-none"><CardContent><Calendar mode="single" selected={date} onSelect={onDateChange} className="mx-auto p-0" /></CardContent><CardFooter className="border-t bg-card"><div className="w-full space-y-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-text-primary">Clock Format</p><p className="text-[11px] text-text-secondary">Choose how event times are entered.</p></div><div className="flex rounded-lg bg-muted p-1"><Button type="button" size="sm" variant={timeFormat === "12" ? "default" : "ghost"} className="h-7" onClick={() => setTimeFormat("12")} aria-pressed={timeFormat === "12"}>12-hour</Button><Button type="button" size="sm" variant={timeFormat === "24" ? "default" : "ghost"} className="h-7" onClick={() => setTimeFormat("24")} aria-pressed={timeFormat === "24"}>24-hour</Button></div></div><FieldGroup className="w-full sm:grid-cols-2"><Field><div className="flex items-center justify-between"><FieldLabel htmlFor="time-from">Start Time (Optional)</FieldLabel>{startTime && <button type="button" onClick={() => onStartTimeChange("")} className="text-[11px] text-primary hover:underline">Clear</button>}</div>{timeFormat === "12" ? <TwelveHourInput id="time-from" value={startTime} onChange={onStartTimeChange} /> : <InputGroup><InputGroupInput id="time-from" type="time" step="60" value={startTime} onChange={(event) => onStartTimeChange(event.target.value)} className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none" /><InputGroupAddon><Clock2Icon /></InputGroupAddon></InputGroup>}</Field><Field><div className="flex items-center justify-between"><FieldLabel htmlFor="time-to">End Time (Optional)</FieldLabel>{endTime && <button type="button" onClick={() => onEndTimeChange("")} className="text-[11px] text-primary hover:underline">Clear</button>}</div>{timeFormat === "12" ? <TwelveHourInput id="time-to" value={endTime} onChange={onEndTimeChange} /> : <InputGroup><InputGroupInput id="time-to" type="time" step="60" value={endTime} onChange={(event) => onEndTimeChange(event.target.value)} className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none" /><InputGroupAddon><Clock2Icon /></InputGroupAddon></InputGroup>}</Field><Field className="sm:col-span-2"><FieldLabel><span className="flex items-center gap-1.5"><Globe2 className="size-3.5" /> Time Zone</span></FieldLabel><TimezoneSelect value={timezone} onValueChange={onTimezoneChange} /></Field></FieldGroup></div></CardFooter></Card>;
}
