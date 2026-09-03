"use client";

import * as React from "react";
import { BarChart3, CalendarDays, Download, FileBarChart, FileText, Users } from "lucide-react";
import { toast } from "sonner";

import { ChartCard } from "@/components/admin/shared/chart-card";
import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { managementEvents } from "@/data/admin-management";

const reportTypes = [
  { name: "Event Report", detail: "Event lifecycle and status", icon: CalendarDays }, { name: "Registration Report", detail: "Registration volume and status", icon: FileText },
  { name: "Attendance Report", detail: "Check-in and attendance rates", icon: Users }, { name: "Organizer Report", detail: "Organizer performance", icon: BarChart3 },
  { name: "Venue Report", detail: "Venue usage and capacity", icon: FileBarChart },
];

export function ReportsPage() {
  const [report, setReport] = React.useState("Registration Report"); const [event, setEvent] = React.useState("All"); const [status, setStatus] = React.useState("All"); const [start, setStart] = React.useState<Date>(); const [end, setEnd] = React.useState<Date>();
  const exportLater = (type: string) => toast.info(`${type} export will be connected to the backend later`);
  return <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6"><PageHeader title="Reports" description="Generate focused operational reports from event data." actions={<><Button variant="outline" className="bg-surface" onClick={() => exportLater("PDF")}><Download /> Export PDF</Button><Button onClick={() => exportLater("CSV")}><Download /> Export CSV</Button></>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{reportTypes.map((item) => { const Icon = item.icon; return <button key={item.name} onClick={() => setReport(item.name)} className={`rounded-xl bg-surface p-4 text-left ring-1 transition ${report === item.name ? "ring-2 ring-primary" : "ring-foreground/10 hover:ring-primary/40"}`}><Icon className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold text-text-primary">{item.name}</p><p className="mt-1 text-xs text-text-secondary">{item.detail}</p></button>; })}</div>
    <Card className="shadow-none"><CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-5"><div className="space-y-2"><Label>Report type</Label><Select value={report} onValueChange={setReport}><SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger><SelectContent>{reportTypes.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Event</Label><Select value={event} onValueChange={setEvent}><SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All events</SelectItem>{managementEvents.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger><SelectContent>{["All", "Upcoming", "Active", "Completed", "Cancelled"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Start date</Label><DatePickerFilter value={start} onChange={setStart} label="Start date" /></div><div className="space-y-2"><Label>End date</Label><DatePickerFilter value={end} onChange={setEnd} label="End date" /></div></CardContent></Card>
    <ChartCard title={`${report} preview`} description={`${event === "All" ? "All events" : event} · ${status} status`} type="bar" categories={["Apr", "May", "Jun", "Jul", "Aug", "Sep"]} series={[{ name: "Registrations", data: [820, 1040, 960, 1280, 1420, 1710] }, { name: "Attendance", data: [650, 860, 790, 1010, 1190, 1380] }]} height={330} />
  </div>;
}
