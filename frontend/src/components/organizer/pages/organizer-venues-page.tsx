"use client";
import * as React from "react";import { Mail,MapPin,Users } from "lucide-react";import { toast } from "sonner";import { PageHeader } from "@/components/admin/shared/page-header";import { StatusBadge } from "@/components/admin/shared/status-badge";import { Button } from "@/components/ui/button";import { Card,CardContent } from "@/components/ui/card";import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";import { organizerApi } from "@/lib/api/organizer";

interface Venue{id:number;name:string;location:string;capacity:number;description:string|null;contact:string|null;status:string;}

export function OrganizerVenuesPage(){
  const[venues,setVenues]=React.useState<Venue[]>([]);
  const[selected,setSelected]=React.useState<Venue>();
  const[loading,setLoading]=React.useState(true);
  const[error,setError]=React.useState<string|null>(null);

  React.useEffect(()=>{
    void organizerApi<Venue[]>("/venues")
      .then(setVenues)
      .catch(e=>{ const message=e instanceof Error?e.message:"Unable to load venues"; setError(message); toast.error(message); })
      .finally(()=>setLoading(false));
  },[]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6">
      <PageHeader title="Venues" description="Available venues you can host your events at." />
      {loading ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading venues...</div> : error ? <div className="rounded-xl bg-surface p-10 text-center text-sm text-danger ring-1 ring-foreground/10">{error}</div> : venues.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {venues.map(venue=>(
            <Card key={venue.id}>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-text-primary">{venue.name}</h3>
                  <StatusBadge status={venue.status}/>
                </div>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 size-3.5 shrink-0"/>{venue.location}</p>
                  <p className="flex items-center gap-1.5"><Users className="size-3.5"/>Capacity: {venue.capacity}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={()=>setSelected(venue)}>View details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : <div className="rounded-xl bg-surface p-10 text-center text-sm text-text-secondary ring-1 ring-foreground/10">No venues are available right now.</div>}

      <Dialog open={Boolean(selected)} onOpenChange={o=>{if(!o)setSelected(undefined);}}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.name}</DialogTitle><DialogDescription>{selected.location}</DialogDescription></DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-text-secondary"><Users className="size-4"/>Capacity: {selected.capacity} guests</p>
                {selected.contact && <p className="flex items-center gap-2 text-text-secondary"><Mail className="size-4"/>{selected.contact}</p>}
                {selected.description && <p className="text-text-secondary">{selected.description}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
