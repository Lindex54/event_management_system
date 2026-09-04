"use client";

import * as React from "react";
import { motion } from "motion/react";
import { toast } from "sonner";

import { AdminStats } from "@/components/admin/admin-stats";
import { DashboardWelcome } from "@/components/admin/dashboard-welcome";
import { EventStatusChart } from "@/components/admin/event-status-chart";
import { RecentActivity } from "@/components/admin/recent-activity";
import { RecentRegistrations } from "@/components/admin/recent-registrations";
import { RegistrationOverviewChart } from "@/components/admin/registration-overview-chart";
import { SystemAlerts } from "@/components/admin/system-alerts";
import { UpcomingEventsTable } from "@/components/admin/upcoming-events-table";
import { adminApi } from "@/lib/admin-api";
import type { DashboardData } from "@/types/admin";

export function AdminDashboard() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const result = await adminApi<DashboardData>("/dashboard");
      if (result.data) setData(result.data);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unable to load dashboard data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-14 text-center text-sm text-text-secondary ring-1 ring-foreground/10">Loading dashboard...</div></div>;
  }
  if (error || !data) {
    return <div className="mx-auto max-w-[1600px] p-4 sm:p-6"><div className="rounded-xl bg-surface p-14 text-center text-sm text-danger ring-1 ring-foreground/10">{error ?? "Unable to load dashboard data"}</div></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6"
    >
      <DashboardWelcome onEventSaved={load} />
      <AdminStats stats={data.stats} />
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <RegistrationOverviewChart trend={data.registrationTrend} />
        <EventStatusChart distribution={data.eventStatusDistribution} total={data.stats.totalEvents} />
      </section>
      <UpcomingEventsTable events={data.upcomingEvents} />
      <section className="grid gap-5 xl:grid-cols-3">
        <RecentRegistrations registrations={data.recentRegistrations} />
        <SystemAlerts alerts={data.systemAlerts} />
        <RecentActivity activity={data.recentActivity} />
      </section>
    </motion.div>
  );
}
