"use client";

import * as React from "react";
import { toast } from "sonner";

import { DiscussionList } from "@/components/admin/discussions/discussion-list";
import { DiscussionsStats } from "@/components/admin/discussions/discussions-stats";
import { DiscussionsToolbar, type DiscussionFilters } from "@/components/admin/discussions/discussions-toolbar";
import { NewDiscussionDialog } from "@/components/admin/discussions/new-discussion-dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { discussions as initialDiscussions } from "@/data/discussions";
import type { Discussion } from "@/types/discussion";

const initialFilters: DiscussionFilters = { search: "", event: "All", status: "All", unread: "All", sort: "recent" };

export function DiscussionsPage() {
  const [items, setItems] = React.useState(initialDiscussions);
  const [filters, setFilters] = React.useState(initialFilters);
  const events = [...new Set(items.map((item) => item.eventName))];
  const visible = items.filter((item) => {
    const search = filters.search.toLowerCase();
    return (!search || `${item.title} ${item.eventName} ${item.preview} ${item.startedBy.name}`.toLowerCase().includes(search))
      && (filters.event === "All" || item.eventName === filters.event)
      && (filters.status === "All" || (filters.status === "Pinned" ? item.pinned : item.status === filters.status))
      && (filters.unread === "All" || (filters.unread === "Unread" ? item.unreadCount > 0 : item.unreadCount === 0));
  }).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (filters.sort === "oldest") return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    if (filters.sort === "active") return b.repliesCount - a.repliesCount;
    return Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt);
  });

  function update(id: string, change: (item: Discussion) => Discussion) {
    setItems((current) => current.map((item) => item.id === id ? change(item) : item));
  }
  function togglePin(id: string) {
    const discussion = items.find((item) => item.id === id);
    update(id, (item) => ({ ...item, pinned: !item.pinned }));
    toast.success(discussion?.pinned ? "Discussion unpinned" : "Discussion pinned");
  }

  return <div className="mx-auto max-w-[1400px] space-y-5 p-4 sm:p-6"><PageHeader title="Discussions" description="View and manage conversations happening across events." actions={<NewDiscussionDialog onCreate={(discussion) => setItems((current) => [discussion, ...current])} />} /><DiscussionsStats discussions={items} /><div className="overflow-hidden rounded-xl ring-1 ring-foreground/10"><DiscussionsToolbar filters={filters} onChange={(changes) => setFilters((current) => ({ ...current, ...changes }))} events={events} /></div><DiscussionList discussions={visible} onTogglePin={togglePin} onMarkRead={(id) => { update(id, (item) => ({ ...item, unreadCount: 0 })); toast.success("Discussion marked as read"); }} onClose={(id) => { update(id, (item) => ({ ...item, status: "Closed" })); toast.success("Discussion closed"); }} onDelete={(id) => { setItems((current) => current.filter((item) => item.id !== id)); toast.success("Discussion deleted"); }} /></div>;
}
