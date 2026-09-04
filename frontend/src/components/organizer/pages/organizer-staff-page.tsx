"use client";

import * as React from "react";
import { Mail, UserCog, Users } from "lucide-react";
import { toast } from "sonner";

import { DataTable, type ManagementColumn } from "@/components/admin/shared/data-table";
import { FormDialog, type FormField } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCards } from "@/components/admin/shared/stat-cards";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { organizerApi } from "@/lib/api/organizer";

interface StaffMember { id: number; name: string; email: string; telephone: string | null; status: "Active" | "Inactive"; joined: string; lastActive: string | null; setupPending: number | boolean; assignedEvents: number; }

const inviteFields: FormField[] = [
  { name: "firstName", label: "First Name", required: true },
  { name: "lastName", label: "Last Name" },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "telephone", label: "Telephone", type: "tel" },
];

export function OrganizerStaffPage() {
  const [records, setRecords] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try { setRecords(await organizerApi<StaffMember[]>("/staff-options")); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Unable to load co-organizers"); }
    finally { setLoading(false); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function invite(values: Record<string, string>) {
    const result = await organizerApi<{ email: string }>("/staff-options", { method: "POST", body: JSON.stringify(values) });
    await load();
    return `Invitation sent to ${result.email}`;
  }

  const columns: ManagementColumn<StaffMember>[] = [
    { id: "staff", label: "Event Staff", accessor: (row) => `${row.name} ${row.email}`, cell: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs">{row.email}</p></div> },
    { id: "telephone", label: "Telephone", accessor: (row) => row.telephone ?? "—" },
    { id: "assigned", label: "Assigned Events", accessor: (row) => row.assignedEvents },
    {
      id: "status", label: "Status", accessor: (row) => row.status,
      cell: (row) => <div className="flex flex-wrap items-center gap-1.5"><StatusBadge status={row.status} />{Boolean(row.setupPending) && <Badge variant="outline" className="border-warning/25 bg-warning/10 text-amber-700 dark:text-amber-300">Invite Pending</Badge>}</div>,
    },
    { id: "joined", label: "Joined", accessor: (row) => row.joined },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        title="Co-organizers"
        description="Event Staff accounts you can assign to your events as co-organizers. Invite new ones here, then assign them from an event's Edit dialog."
        actions={<FormDialog trigger={<Button><UserCog />Invite Staff</Button>} title="Invite an Event Staff member" description="They'll receive an email to set their own password before they can sign in." fields={inviteFields} submitLabel="Send invitation" successMessage="Staff member invited" onSave={invite} />}
      />
      <StatCards items={[
        { label: "Total Staff", value: records.length, icon: Users },
        { label: "Invite Pending", value: records.filter((x) => Boolean(x.setupPending)).length, icon: Mail },
      ]} />
      {loading ? (
        <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading co-organizers...</div>
      ) : (
        <DataTable data={records} columns={columns} getRowId={(row) => String(row.id)} searchPlaceholder="Search name or email..." />
      )}
    </div>
  );
}
