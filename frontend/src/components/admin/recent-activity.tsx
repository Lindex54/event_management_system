import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardActivityItem } from "@/types/admin";

export function RecentActivity({ activity }: { activity: DashboardActivityItem[] }) {
  return (
    <Card id="activity" className="shadow-none">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Changes made across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {activity.length ? (
          <div className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
            {activity.map((item) => (
              <div key={item.id} className="relative flex gap-3 pl-0">
                <span className="relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-surface bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 text-text-primary">
                    <span className="font-semibold">{item.actor}</span> {item.description}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="py-6 text-center text-sm text-text-secondary">No recent activity yet.</p>}
      </CardContent>
    </Card>
  );
}
