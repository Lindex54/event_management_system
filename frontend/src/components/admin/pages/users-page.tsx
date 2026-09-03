"use client";

import * as React from "react";
import { CheckCircle2, Eye, KeyRound, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2, UserCheck, Users, UserX } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { FormDialog } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { userRecords as initialRecords } from "@/data/admin-management";
import type { UserRecord } from "@/types/admin";

const userFields = [
  { name: "firstName", label: "First Name", required: true }, { name: "lastName", label: "Last Name", required: true },
  { name: "email", label: "Email", type: "email" as const, required: true }, { name: "telephone", label: "Telephone", type: "tel" as const },
  { name: "role", label: "Role", type: "select" as const, options: ["System Administrator", "Event Organizer", "Event Staff", "Attendee"], required: true },
  { name: "status", label: "Status", type: "select" as const, options: ["Active", "Inactive"], required: true },
];

export function UsersPage() {
  const [records, setRecords] = React.useState(initialRecords);
  const [role, setRole] = React.useState("All"); const [status, setStatus] = React.useState("All"); const [removeId, setRemoveId] = React.useState<string>();
  const update = React.useCallback((id: string, nextStatus: UserRecord["status"]) => { setRecords((items) => items.map((item) => item.id === id ? { ...item, status: nextStatus } : item)); toast.success(`User ${nextStatus.toLowerCase()}`); }, []);
  const columns = React.useMemo<ManagementColumn<UserRecord>[]>(() => [
    { id: "user", label: "User", accessor: (row) => `${row.name} ${row.email}`, cell: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs">{row.email}</p></div> },
    { id: "email", label: "Email", accessor: (row) => row.email }, { id: "role", label: "Role", accessor: (row) => row.role }, { id: "status", label: "Status", accessor: (row) => row.status, cell: (row) => <StatusBadge status={row.status} /> },
    { id: "joined", label: "Joined", accessor: (row) => row.joined }, { id: "last", label: "Last Active", accessor: (row) => row.lastActive },
    { id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right", cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onSelect={() => toast.info(`${row.name} · ${row.telephone}`)}><Eye /> View</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info("User editor opened")}><Pencil /> Edit</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.success("Role change saved locally")}><KeyRound /> Change role</DropdownMenuItem><DropdownMenuSeparator />
      <DropdownMenuItem onSelect={() => update(row.id, "Active")}><UserCheck /> Activate</DropdownMenuItem><DropdownMenuItem onSelect={() => update(row.id, "Inactive")}><UserX /> Deactivate</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info("Password reset email will be connected to the backend later")}><RefreshCw /> Reset password</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setRemoveId(row.id)}><Trash2 /> Delete</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu> },
  ], [update]);
  const filtered = records.filter((item) => (role === "All" || item.role === role) && (status === "All" || item.status === status));
  return <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6"><PageHeader title="Users" description="Manage platform accounts, access roles and account status." actions={<FormDialog trigger={<Button><Plus /> Add User</Button>} title="Add user" description="Create a platform user account." fields={userFields} submitLabel="Add user" successMessage="User added" />} />
    <StatCards items={[{ label: "Total Users", value: records.length, icon: Users }, { label: "Active", value: records.filter((x) => x.status === "Active").length, icon: CheckCircle2 }, { label: "Inactive", value: records.filter((x) => x.status === "Inactive").length, icon: UserX }, { label: "New This Month", value: 2, icon: Plus }]} />
    <DataTable data={filtered} columns={columns} getRowId={(row) => row.id} searchPlaceholder="Search name or email..." toolbar={<><Select value={role} onValueChange={setRole}><SelectTrigger className="h-9 w-44 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All roles</SelectItem>{["System Administrator", "Event Organizer", "Event Staff", "Attendee"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-34 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Active", "Inactive"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All statuses" : item}</SelectItem>)}</SelectContent></Select></>} />
    <ConfirmDialog open={Boolean(removeId)} onOpenChange={(open) => { if (!open) setRemoveId(undefined); }} title="Delete user?" description="The user will be removed from this local frontend view." actionLabel="Delete" onConfirm={() => { setRecords((items) => items.filter((item) => item.id !== removeId)); setRemoveId(undefined); toast.success("User deleted"); }} />
  </div>;
}
