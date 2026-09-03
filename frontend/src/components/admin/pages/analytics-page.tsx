"use client";

import * as React from "react";
import { BarChart3, CalendarDays, ClipboardList, Percent, UserCog } from "lucide-react";

import { ChartCard } from "@/components/admin/shared/chart-card";
import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { managementEvents } from "@/data/admin-management";

export function AnalyticsPage() {
  const [start, setStart] = React.useState<Date>(); const [end, setEnd] = React.useState<Date>(); const [event, setEvent] = React.useState("All");
  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
    <PageHeader title="Analytics" description="Track platform growth, event performance and attendee engagement." actions={<><Select value={event} onValueChange={setEvent}><SelectTrigger className="h-9 w-44 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All events</SelectItem>{managementEvents.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select><DatePickerFilter value={start} onChange={setStart} label="Start date" /><DatePickerFilter value={end} onChange={setEnd} label="End date" /></>} />
    <StatCards items={[{ label: "Total Events", value: "148", detail: "+12 this month", icon: CalendarDays }, { label: "Registrations", value: "8,642", detail: "+18.2%", icon: ClipboardList }, { label: "Attendance Rate", value: "82.4%", detail: "+3.1%", icon: Percent }, { label: "Active Organizers", value: "74", detail: "86 total", icon: UserCog }]} />
    <div className="grid gap-5 xl:grid-cols-2"><ChartCard title="Registration growth" description="Monthly registrations" type="area" categories={["Apr", "May", "Jun", "Jul", "Aug", "Sep"]} series={[{ name: "Registrations", data: [820, 1040, 960, 1280, 1420, 1710] }]} /><ChartCard title="Events created over time" description="New events per month" type="bar" categories={["Apr", "May", "Jun", "Jul", "Aug", "Sep"]} series={[{ name: "Events", data: [14, 18, 16, 22, 25, 31] }]} /><ChartCard title="Event status" description="Distribution of all events" type="donut" categories={["Upcoming", "Active", "Completed", "Cancelled"]} series={[24, 8, 109, 7]} /><ChartCard title="Attendance trend" description="Attendance rate over six months" type="line" categories={["Apr", "May", "Jun", "Jul", "Aug", "Sep"]} series={[{ name: "Attendance %", data: [74, 76, 79, 78, 81, 82] }]} /><ChartCard title="Top performing events" description="Registrations by leading event" type="bar" horizontal categories={["Tech Expo", "Career Expo", "AI Summit", "Research Conf.", "Creative Forum"]} series={[{ name: "Registrations", data: [812, 639, 428, 276, 184] }]} /><ChartCard title="Registrations by event" description="Confirmed and pending registrations" type="bar" categories={["Tech Expo", "Career Expo", "AI Summit", "Research", "Creative"]} series={[{ name: "Confirmed", data: [720, 570, 390, 240, 165] }, { name: "Pending", data: [92, 69, 38, 36, 19] }]} /></div>
    <p className="text-xs text-text-secondary"><BarChart3 className="mr-1 inline size-3.5" /> Showing mock analytics for {event === "All" ? "all events" : event}. Date selections are frontend-only.</p>
  </div>;
}
