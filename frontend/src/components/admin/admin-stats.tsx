import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  UserCog,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { dashboardStats } from "@/data/admin-dashboard";

const icons = {
  events: CalendarDays,
  upcoming: CalendarClock,
  registrations: ClipboardList,
  attendees: Users,
  organizers: UserCog,
  today: CalendarCheck,
};

const cardStyles = {
  events: {
    card: "bg-blue-50/90 ring-blue-200/80 dark:bg-blue-950/35 dark:ring-blue-800/60",
    icon: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  },
  upcoming: {
    card: "bg-amber-50/90 ring-amber-200/80 dark:bg-amber-950/30 dark:ring-amber-800/60",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  },
  registrations: {
    card: "bg-emerald-50/90 ring-emerald-200/80 dark:bg-emerald-950/30 dark:ring-emerald-800/60",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  },
  attendees: {
    card: "bg-violet-50/90 ring-violet-200/80 dark:bg-violet-950/30 dark:ring-violet-800/60",
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
  },
  organizers: {
    card: "bg-cyan-50/90 ring-cyan-200/80 dark:bg-cyan-950/30 dark:ring-cyan-800/60",
    icon: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300",
  },
  today: {
    card: "bg-rose-50/90 ring-rose-200/80 dark:bg-rose-950/30 dark:ring-rose-800/60",
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
  },
};

export function AdminStats() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Dashboard statistics">
      {dashboardStats.map((stat) => {
        const Icon = icons[stat.icon];
        const styles = cardStyles[stat.icon];
        return (
          <Card
            key={stat.label}
            className={`gap-0 py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${styles.card}`}
          >
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-text-secondary">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-text-primary">{stat.value}</p>
                <p className={stat.trend === "up" ? "mt-1 text-xs font-medium text-success" : "mt-1 text-xs text-text-secondary"}>
                  {stat.change}
                </p>
              </div>
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
