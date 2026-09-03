"use client";

import { motion } from "motion/react";

import { AdminStats } from "@/components/admin/admin-stats";
import { DashboardWelcome } from "@/components/admin/dashboard-welcome";
import { EventStatusChart } from "@/components/admin/event-status-chart";
import { RecentActivity } from "@/components/admin/recent-activity";
import { RecentRegistrations } from "@/components/admin/recent-registrations";
import { RegistrationOverviewChart } from "@/components/admin/registration-overview-chart";
import { SystemAlerts } from "@/components/admin/system-alerts";
import { UpcomingEventsTable } from "@/components/admin/upcoming-events-table";

export function AdminDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-6"
    >
      <DashboardWelcome />
      <AdminStats />
      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <RegistrationOverviewChart />
        <EventStatusChart />
      </section>
      <UpcomingEventsTable />
      <section className="grid gap-5 xl:grid-cols-3">
        <RecentRegistrations />
        <SystemAlerts />
        <RecentActivity />
      </section>
    </motion.div>
  );
}
