"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DiscussionFilters {
  search: string;
  event: string;
  status: string;
  unread: string;
  sort: string;
}

export function DiscussionsToolbar({ filters, onChange, events }: {
  filters: DiscussionFilters;
  onChange: (changes: Partial<DiscussionFilters>) => void;
  events: string[];
}) {
  return <div className="flex flex-col gap-3 border-b border-border bg-surface p-4 xl:flex-row xl:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-secondary" /><Input value={filters.search} onChange={(event) => onChange({ search: event.target.value })} placeholder="Search discussions..." className="h-10 bg-background pl-9" /></div><div className="flex flex-wrap gap-2"><span className="hidden items-center gap-1.5 px-1 text-xs font-medium text-text-secondary sm:flex"><SlidersHorizontal className="size-4" /> Filters</span><Select value={filters.event} onValueChange={(event) => onChange({ event })}><SelectTrigger className="h-10 w-40 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All events</SelectItem>{events.map((event) => <SelectItem key={event} value={event}>{event}</SelectItem>)}</SelectContent></Select><Select value={filters.status} onValueChange={(status) => onChange({ status })}><SelectTrigger className="h-10 w-40 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All Discussions</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Closed">Closed</SelectItem><SelectItem value="Pinned">Pinned</SelectItem></SelectContent></Select><Select value={filters.unread} onValueChange={(unread) => onChange({ unread })}><SelectTrigger className="h-10 w-32 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="All">All messages</SelectItem><SelectItem value="Unread">Unread</SelectItem><SelectItem value="Read">Read</SelectItem></SelectContent></Select><Select value={filters.sort} onValueChange={(sort) => onChange({ sort })}><SelectTrigger className="h-10 w-36 bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">Most Recent</SelectItem><SelectItem value="oldest">Oldest</SelectItem><SelectItem value="active">Most Active</SelectItem></SelectContent></Select></div></div>;
}
