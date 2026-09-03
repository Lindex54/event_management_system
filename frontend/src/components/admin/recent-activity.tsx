import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { recentActivity } from "@/data/admin-dashboard";

export function RecentActivity() {
  return (
    <Card id="activity" className="shadow-none">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Changes made across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="relative flex gap-3 pl-0">
              <span className="relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-surface bg-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-5 text-text-primary">
                  <span className="font-semibold">{activity.actor}</span> {activity.description}
                </p>
                <p className="mt-1 text-xs text-text-secondary">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
