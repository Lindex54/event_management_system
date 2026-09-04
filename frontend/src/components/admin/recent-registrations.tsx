import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardRegistration } from "@/types/admin";

const statusStyles = {
  Confirmed: "bg-success/10 text-success hover:bg-success/10",
  Pending: "bg-warning/10 text-amber-700 hover:bg-warning/10 dark:text-amber-300",
  Cancelled: "bg-danger/10 text-danger hover:bg-danger/10",
};

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function RecentRegistrations({ registrations }: { registrations: DashboardRegistration[] }) {
  return (
    <Card id="registrations" className="shadow-none">
      <CardHeader>
        <CardTitle>Recent registrations</CardTitle>
        <CardDescription>Latest attendee activity across all events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {registrations.length ? registrations.map((registration) => (
          <div key={registration.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(registration.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{registration.name}</p>
              <p className="truncate text-xs text-text-secondary">{registration.event}</p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-text-secondary">{registration.registeredAtLabel}</p>
            </div>
            <Badge className={statusStyles[registration.status]}>{registration.status}</Badge>
          </div>
        )) : <p className="py-6 text-center text-sm text-text-secondary">No registrations yet.</p>}
      </CardContent>
    </Card>
  );
}
