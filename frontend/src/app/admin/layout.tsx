import type { ReactNode } from "react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border lg:flex" />
      <div className="min-w-0 lg:pl-64">
        <AdminHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}
