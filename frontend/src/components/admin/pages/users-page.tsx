/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import { CheckCircle2, Mail, MoreHorizontal, Plus, Trash2, UserCheck, Users, UserX } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { FormDialog, type FormField } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/admin-api";

interface PlatformUser { id: number; username: string | null; name: string; email: string; telephone: string | null; role: string; status: "Active" | "Inactive"; joined: string; lastActive: string | null; setupPending: number | boolean; }

const createFields: FormField[] = [
  { name: "firstName", label: "First Name", required: true },
  { name: "lastName", label: "Last Name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "telephone", label: "Telephone", type: "tel" },
  { name: "role", label: "Role", type: "select", options: ["System Administrator", "Event Staff"], required: true },
  { name: "username", label: "Username (required for System Administrator)", placeholder: "e.g. jsmith" },
];

export function UsersPage() {
  const [records, setRecords] = React.useState<PlatformUser[]>([]);
  const [role, setRole] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [removeId, setRemoveId] = React.useState<number>();
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try { const r = await adminApi<PlatformUser[]>("/users"); setRecords(r.data ?? []); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Unable to load users"); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function create(values: Record<string, string>) {
    const result = await adminApi("/users", { method: "POST", body: JSON.stringify(values) });
    await load();
    return result.message;
  }
  async function setStatusFor(id: number, nextStatus: "Active" | "Inactive") {
    try { await adminApi(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) }); toast.success(`User ${nextStatus === "Active" ? "activated" : "deactivated"}`); await load(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Unable to update user"); }
  }

  const columns: ManagementColumn<PlatformUser>[] = [
    { id: "user", label: "User", accessor: (row) => `${row.name} ${row.email}`, cell: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs">{row.email}</p></div> },
    { id: "role", label: "Role", accessor: (row) => row.role },
    {
      id: "status", label: "Status", accessor: (row) => row.status,
      cell: (row) => <div className="flex flex-wrap items-center gap-1.5"><StatusBadge status={row.status} />{Boolean(row.setupPending) && <Badge variant="outline" className="border-warning/25 bg-warning/10 text-amber-700 dark:text-amber-300">Invite Pending</Badge>}</div>,
    },
    { id: "joined", label: "Joined", accessor: (row) => row.joined },
    { id: "last", label: "Last Active", accessor: (row) => row.lastActive ?? "Never" },
    {
      id: "actions", label: "", accessor: (row) => row.id, sortable: false, className: "text-right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Boolean(row.setupPending) && <DropdownMenuItem onSelect={() => toast.info(`Invitation email was sent to ${row.email}`)}><Mail /> Invite pending</DropdownMenuItem>}
            <DropdownMenuItem onSelect={() => void setStatusFor(row.id, "Active")}><UserCheck /> Activate</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void setStatusFor(row.id, "Inactive")}><UserX /> Deactivate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => setRemoveId(row.id)}><Trash2 /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filtered = records.filter((item) => (role === "All" || item.role === role) && (status === "All" || item.status === status));
  const roleOptions = [...new Set(records.map((item) => item.role))];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Users"
        description="Add System Administrator and Event Staff accounts. Organizers are managed on the Organizers page."
        actions={<FormDialog trigger={<Button><Plus /> Add User</Button>} title="Add user" description="An invitation email will be sent so the user can set their own password." fields={createFields} initialValues={{ role: "Event Staff" }} submitLabel="Send invitation" successMessage="User created" onSave={create} />}
      />
      <StatCards items={[
        { label: "Total Users", value: records.length, icon: Users },
        { label: "Active", value: records.filter((x) => x.status === "Active").length, icon: CheckCircle2 },
        { label: "Inactive", value: records.filter((x) => x.status === "Inactive").length, icon: UserX },
        { label: "Invite Pending", value: records.filter((x) => Boolean(x.setupPending)).length, icon: Mail },
      ]} />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading users...</div> : (
        <DataTable
          data={filtered} columns={columns} getRowId={(row) => String(row.id)} searchPlaceholder="Search name or email..."
          toolbar={
            <>
              <Select value={role} onValueChange={setRole}><SelectTrigger className="h-9 w-48 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All roles</SelectItem>{roleOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
              <Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-34 bg-surface"><SelectValue /></SelectTrigger><SelectContent>{["All", "Active", "Inactive"].map((item) => <SelectItem key={item} value={item}>{item === "All" ? "All statuses" : item}</SelectItem>)}</SelectContent></Select>
            </>
          }
        />
      )}
      <ConfirmDialog open={Boolean(removeId)} onOpenChange={(open) => { if (!open) setRemoveId(undefined); }} title="Delete user?" description="The account will be deactivated and removed from active records." actionLabel="Delete" onConfirm={() => void (async () => { try { await adminApi(`/users/${removeId}`, { method: "DELETE" }); setRemoveId(undefined); toast.success("User deleted"); await load(); } catch (e) { toast.error(e instanceof Error ? e.message : "Unable to delete user"); } })()} />
    </div>
  );
}
