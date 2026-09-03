"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  History,
  LayoutDashboard,
  Mail,
  MapPin,
  Mic,
  MessagesSquare,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Event Management",
    items: [
      { label: "Events", href: "/admin/events", icon: CalendarDays },
      { label: "Registrations", href: "/admin/registrations", icon: ClipboardList },
      { label: "Attendees", href: "/admin/attendees", icon: Users },
      { label: "Organizers", href: "/admin/organizers", icon: UserCog },
      { label: "Venues", href: "/admin/venues", icon: MapPin },
    ],
  },
  {
    label: "User Management",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles & Permissions", href: "/admin/roles", icon: ShieldCheck },
      { label: "Speakers", href: "/admin/speakers", icon: Mic },
    ],
  },
  {
    label: "Reporting",
    items: [
      { label: "Reports", href: "/admin/reports", icon: ClipboardList },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Discussions", href: "/admin/discussions", icon: MessagesSquare },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Email", href: "/admin/email", icon: Mail },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Activity Logs", href: "/admin/activity-logs", icon: History },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5" aria-label="Evently admin dashboard">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <CalendarDays className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-base font-bold tracking-tight">Evently</span>
        <span className="block text-[10px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
          Administration
        </span>
      </span>
    </Link>
  );
}

export function AdminSidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full flex-col bg-navy text-white", className)}>
      <div className="flex h-17 items-center border-b border-white/10 px-5">
        <AdminBrand />
      </div>
      <nav
        className="flex-1 space-y-5 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Administrator navigation"
      >
        {navigation.map((group) => (
          <div key={group.label || "dashboard"}>
            {group.label && (
              <p className="mb-1.5 px-3 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white",
                      active && "bg-primary text-white shadow-sm hover:bg-primary-dark hover:text-white",
                    )}
                  >
                    <Icon className="size-[17px]" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-slate-400">
        Evently Admin <span className="text-slate-600">•</span> v1.0
      </div>
    </aside>
  );
}
