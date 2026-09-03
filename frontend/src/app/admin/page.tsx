import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Administrator Dashboard | Evently",
  description: "Monitor events, registrations, organizers and platform activity.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
