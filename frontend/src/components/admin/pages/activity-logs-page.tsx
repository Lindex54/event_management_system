"use client";

import * as React from "react";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";

import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { DatePickerFilter } from "@/components/admin/shared/date-picker-filter";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityLogRecords } from "@/data/admin-management";
import type { ActivityLogRecord } from "@/types/admin";

const actionStyles = { Create: "bg-success/10 text-success", Update: "bg-primary/10 text-primary", Delete: "bg-danger/10 text-danger", Access: "bg-muted text-text-secondary" };

export function ActivityLogsPage() {
  const [user, setUser] = React.useState("All"); const [module, setModule] = React.useState("All"); const [action, setAction] = React.useState("All"); const [date, setDate] = React.useState<Date>();
  const filtered = activityLogRecords.filter((item) => (user === "All" || item.user === user) && (module === "All" || item.module === module) && (action === "All" || item.actionType === action) && (!date || item.dateTime.startsWith(format(date, "MMM d, yyyy"))));
  const columns = React.useMemo<ManagementColumn<ActivityLogRecord>[]>(() => [
    { id: "user", label: "User", accessor: (row) => row.user, cell: (row) => <span className="font-semibold text-text-primary">{row.user}</span> }, { id: "action", label: "Action", accessor: (row) => row.action },
    { id: "module", label: "Module", accessor: (row) => row.module }, { id: "description", label: "Description", accessor: (row) => row.description, cell: (row) => <p className="max-w-72 whitespace-normal">{row.description}</p> },
    { id: "date", label: "Date & Time", accessor: (row) => row.dateTime }, { id: "ip", label: "IP Address", accessor: (row) => row.ipAddress, cell: (row) => <code className="text-xs">{row.ipAddress}</code> },
    { id: "type", label: "Action Type", accessor: (row) => row.actionType, cell: (row) => <Badge className={actionStyles[row.actionType]}>{row.actionType}</Badge> },
  ], []);
  const users = [...new Set(activityLogRecords.map((x) => x.user))]; const modules = [...new Set(activityLogRecords.map((x) => x.module))];
  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6"><PageHeader title="Activity Logs" description="Audit administrative actions and important platform changes." actions={<span className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary"><ClipboardList className="size-4 text-primary" /> Audit records are read-only</span>} /><DataTable data={filtered} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Search activity descriptions..." toolbar={<><Select value={user} onValueChange={setUser}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All users</SelectItem>{users.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={module} onValueChange={setModule}><SelectTrigger className="h-9 w-34 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All modules</SelectItem>{modules.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={action} onValueChange={setAction}><SelectTrigger className="h-9 w-34 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Create", "Update", "Delete", "Access"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All actions" : item}</SelectItem>)}</SelectContent></Select><DatePickerFilter value={date} onChange={setDate} label="Activity date" /></>} /></div>;
}
