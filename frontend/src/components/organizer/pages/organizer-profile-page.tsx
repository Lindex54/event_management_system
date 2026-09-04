"use client";
import * as React from "react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Input } from "@/components/ui/input";import { Label } from "@/components/ui/label";import { organizerApi } from "@/lib/api/organizer";

interface OrganizerProfile{id:number;name:string;firstName:string;lastName:string|null;email:string;telephone:string|null;organization:string;position:string|null;}

export function OrganizerProfilePage(){
  const[firstName,setFirstName]=React.useState("");
  const[lastName,setLastName]=React.useState("");
  const[email,setEmail]=React.useState("");
  const[telephone,setTelephone]=React.useState("");
  const[organization,setOrganization]=React.useState("");
  const[position,setPosition]=React.useState("");
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[saving,setSaving]=React.useState(false);

  React.useEffect(()=>{
    void organizerApi<OrganizerProfile>("/profile")
      .then(data=>{ setFirstName(data.firstName); setLastName(data.lastName??""); setEmail(data.email); setTelephone(data.telephone??""); setOrganization(data.organization); setPosition(data.position??""); })
      .catch(e=>{ const message=e instanceof Error?e.message:"Unable to load profile"; setError(message); toast.error(message); })
      .finally(()=>setLoading(false));
  },[]);

  async function save(event:React.FormEvent){
    event.preventDefault();
    if(!firstName.trim()){ toast.error("First name is required"); return; }
    if(!organization.trim()){ toast.error("Organization is required"); return; }
    setSaving(true);
    try{ await organizerApi("/profile",{method:"PUT",body:JSON.stringify({firstName:firstName.trim(),lastName:lastName.trim()||null,telephone:telephone.trim()||null,organization:organization.trim(),position:position.trim()||null})}); toast.success("Profile updated successfully"); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to update profile"); }
    finally{ setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
      <PageHeader title="Profile" description="Update your contact and organization details." />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading profile...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : (
        <Card>
          <CardContent className="p-5">
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="org-first-name">First Name</Label><Input id="org-first-name" value={firstName} onChange={e=>setFirstName(e.target.value)} className="h-11"/></div>
                <div className="space-y-2"><Label htmlFor="org-last-name">Last Name</Label><Input id="org-last-name" value={lastName} onChange={e=>setLastName(e.target.value)} className="h-11"/></div>
              </div>
              <div className="space-y-2"><Label htmlFor="org-email">Email</Label><Input id="org-email" value={email} disabled className="h-11"/></div>
              <div className="space-y-2"><Label htmlFor="org-telephone">Telephone</Label><Input id="org-telephone" value={telephone} onChange={e=>setTelephone(e.target.value)} className="h-11"/></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="org-organization">Organization</Label><Input id="org-organization" value={organization} onChange={e=>setOrganization(e.target.value)} className="h-11"/></div>
                <div className="space-y-2"><Label htmlFor="org-position">Position</Label><Input id="org-position" value={position} onChange={e=>setPosition(e.target.value)} className="h-11"/></div>
              </div>
              <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Changes"}</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
