"use client";
import * as React from "react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Input } from "@/components/ui/input";import { Label } from "@/components/ui/label";import { staffApi } from "@/lib/api/staff";

interface StaffProfile{id:number;name:string;firstName:string;lastName:string|null;email:string;telephone:string|null;}

export function StaffProfilePage(){
  const[profile,setProfile]=React.useState<StaffProfile|null>(null);
  const[firstName,setFirstName]=React.useState("");
  const[lastName,setLastName]=React.useState("");
  const[telephone,setTelephone]=React.useState("");
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);
  const[saving,setSaving]=React.useState(false);

  React.useEffect(()=>{
    void staffApi<StaffProfile>("/profile")
      .then(data=>{ setProfile(data); setFirstName(data.firstName); setLastName(data.lastName??""); setTelephone(data.telephone??""); })
      .catch(e=>{ const message=e instanceof Error?e.message:"Unable to load profile"; setError(message); toast.error(message); })
      .finally(()=>setLoading(false));
  },[]);

  async function save(event:React.FormEvent){
    event.preventDefault();
    if(!firstName.trim()){ toast.error("First name is required"); return; }
    setSaving(true);
    try{ await staffApi("/profile",{method:"PUT",body:JSON.stringify({firstName:firstName.trim(),lastName:lastName.trim()||null,telephone:telephone.trim()||null})}); toast.success("Profile updated"); }
    catch(e){ toast.error(e instanceof Error?e.message:"Unable to update profile"); }
    finally{ setSaving(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
      <PageHeader title="Profile" description="Update your contact details." />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading profile...</div> : error && !profile ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : (
        <Card>
          <CardContent className="p-5">
            <form onSubmit={save} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="staff-first-name">First Name</Label><Input id="staff-first-name" value={firstName} onChange={e=>setFirstName(e.target.value)} className="h-11"/></div>
                <div className="space-y-2"><Label htmlFor="staff-last-name">Last Name</Label><Input id="staff-last-name" value={lastName} onChange={e=>setLastName(e.target.value)} className="h-11"/></div>
              </div>
              <div className="space-y-2"><Label htmlFor="staff-email">Email</Label><Input id="staff-email" value={profile?.email??""} disabled className="h-11"/></div>
              <div className="space-y-2"><Label htmlFor="staff-telephone">Telephone</Label><Input id="staff-telephone" value={telephone} onChange={e=>setTelephone(e.target.value)} className="h-11"/></div>
              <Button type="submit" disabled={saving}>{saving?"Saving...":"Save Changes"}</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
