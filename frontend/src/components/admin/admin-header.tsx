"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminHeader() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/events": "Events",
    "/admin/registrations": "Registrations",
    "/admin/attendees": "Attendees",
    "/admin/organizers": "Organizers",
    "/admin/venues": "Venues",
    "/admin/users": "Users",
    "/admin/roles": "Roles & Permissions",
    "/admin/reports": "Reports",
    "/admin/analytics": "Analytics",
    "/admin/notifications": "Notifications",
    "/admin/discussions": "Discussions",
    "/admin/email": "Email",
    "/admin/activity-logs": "Activity Logs",
    "/admin/settings": "Settings",
  };
  const currentTitle = pageTitles[pathname]
    ?? (pathname.startsWith("/admin/events/")
      ? "Event Details"
      : pathname.startsWith("/admin/discussions/")
        ? "Discussion Room"
        : "Administration");

  return (
    <header className="sticky top-0 z-30 flex h-17 items-center border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open admin menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[17rem] p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Administrator navigation</SheetTitle>
            <SheetDescription className="sr-only">Navigate the Evently administration area.</SheetDescription>
            <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-text-primary">{currentTitle}</p>
          <p className="hidden text-xs text-text-secondary sm:block">Admin / {currentTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden w-56 xl:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" />
          <Input className="h-9 bg-background pl-9" placeholder="Search dashboard..." />
        </div>
        <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-danger" />
        </Button>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-1.5 sm:px-2">
              <Avatar>
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">AD</AvatarFallback>
              </Avatar>
              <span className="hidden text-left md:block">
                <span className="block text-sm leading-4 font-semibold">Administrator</span>
                <span className="block text-[11px] text-text-secondary">System Admin</span>
              </span>
              <ChevronDown className="hidden size-3.5 text-text-secondary md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><UserRound /> Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings /> Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem><LogOut /> Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
