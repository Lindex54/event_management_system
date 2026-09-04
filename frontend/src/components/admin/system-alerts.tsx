import { AlertCircle, Bell, CalendarClock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardAlert } from "@/types/admin";

const icons = { alert: AlertCircle, bell: Bell, clock: CalendarClock };
const tones = {
  info: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-amber-700 dark:text-amber-300",
  danger: "bg-danger/10 text-danger",
  success: "bg-success/10 text-success",
};

export function SystemAlerts({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>System alerts</CardTitle>
        <CardDescription>Items that may need your attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {alerts.length ? alerts.map((alert) => {
          const Icon = icons[alert.icon];
          return (
            <div key={alert.id} className="flex gap-3 border-b border-border py-3 last:border-0">
              <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", tones[alert.tone])}>
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{alert.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-text-secondary">{alert.detail}</p>
              </div>
            </div>
          );
        }) : <p className="py-6 text-center text-sm text-text-secondary">Nothing needs your attention right now.</p>}
      </CardContent>
    </Card>
  );
}
