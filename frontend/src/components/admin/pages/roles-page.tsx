"use client";

import * as React from "react";
import { KeyRound, Pencil, Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { FormDialog } from "@/components/admin/shared/form-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { permissionGroups, roleRecords } from "@/data/admin-management";
import type { RoleRecord } from "@/types/admin";

export function RolesPage() {
  const [selected, setSelected] = React.useState<RoleRecord>();
  const [permissions, setPermissions] = React.useState<string[]>([]);
  function edit(role: RoleRecord) { setSelected(role); setPermissions(role.permissions); }
  function toggle(permission: string) { setPermissions((current) => current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]); }
  return <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
    <PageHeader title="Roles & Permissions" description="Configure access levels for every type of platform user." actions={<FormDialog trigger={<Button><Plus /> Create Role</Button>} title="Create role" description="Define a new frontend role." fields={[{ name: "name", label: "Role name", required: true }, { name: "description", label: "Description", type: "textarea", required: true }]} successMessage="Role created" />} />
    <div className="grid gap-4 md:grid-cols-2">
      {roleRecords.map((role) => <Card key={role.id} className="shadow-none"><CardHeader className="border-b border-border"><div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span><Switch defaultChecked aria-label={`${role.name} active`} /></div><CardTitle className="mt-3">{role.name}</CardTitle><CardDescription>{role.description}</CardDescription></CardHeader><CardContent><div className="flex items-center gap-5 text-sm text-text-secondary"><span className="flex items-center gap-1.5"><Users className="size-4" /> {role.users.toLocaleString()} users</span><span className="flex items-center gap-1.5"><KeyRound className="size-4" /> {role.permissions.length} permissions</span></div><Button variant="outline" className="mt-4 w-full" onClick={() => edit(role)}><Pencil /> Edit permissions</Button></CardContent></Card>)}
    </div>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined); }}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Edit {selected?.name}</DialogTitle><DialogDescription>Select the actions this role can perform. Enforcement will be connected to the backend later.</DialogDescription></DialogHeader><div className="grid gap-5 sm:grid-cols-2">{Object.entries(permissionGroups).map(([group, items]) => <div key={group} className="rounded-lg border border-border p-4"><p className="mb-3 text-xs font-bold tracking-wider text-text-secondary uppercase">{group}</p><div className="space-y-3">{items.map((permission) => <label key={permission} className="flex cursor-pointer items-center gap-2.5 text-sm"><Checkbox checked={permissions.includes(permission)} onCheckedChange={() => toggle(permission)} />{permission}</label>)}</div></div>)}</div><DialogFooter><Button variant="outline" onClick={() => setSelected(undefined)}>Cancel</Button><Button onClick={() => { toast.success("Permissions updated"); setSelected(undefined); }}>Save permissions</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}
