import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { recentRegistrations } from "@/data/admin-dashboard";

const statusStyles = {
  Confirmed: "bg-success/10 text-success hover:bg-success/10",
  Pending: "bg-warning/10 text-amber-700 hover:bg-warning/10 dark:text-amber-300",
  Cancelled: "bg-danger/10 text-danger hover:bg-danger/10",
};

export function RecentRegistrations() {
  return (
    <Card id="registrations" className="shadow-none">
      <CardHeader>
        <CardTitle>Recent registrations</CardTitle>
        <CardDescription>Latest attendee activity across all events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {recentRegistrations.map((registration) => (
          <div key={registration.id} className="flex items-center gap-3 border-b border-border py-3 last:border-0">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {registration.attendee.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text-primary">{registration.attendee.name}</p>
              <p className="truncate text-xs text-text-secondary">{registration.event}</p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-xs text-text-secondary">{registration.registeredAt}</p>
            </div>
            <Badge className={statusStyles[registration.status]}>{registration.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
