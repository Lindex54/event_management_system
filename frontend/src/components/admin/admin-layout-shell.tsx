"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loginPage = pathname === "/admin/login";
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    if (loginPage) return;
    const controller = new AbortController();
    void fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/admin/session`, {
      credentials: "include",
      signal: controller.signal,
    }).then((response) => {
      if (!response.ok) {
        router.replace("/admin/login");
        return;
      }
      setAuthenticated(true);
    }).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      router.replace("/admin/login");
    });
    return () => controller.abort();
  }, [loginPage, pathname, router]);

  if (loginPage) return children;

  if (!authenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-center">
        <div>
          <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-text-primary">Verifying administrator session...</p>
        </div>
      </div>
    );
  }

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
