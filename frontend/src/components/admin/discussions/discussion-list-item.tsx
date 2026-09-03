"use client";

import { useRouter } from "next/navigation";
import { Clock, MessageSquare, Pin, Users } from "lucide-react";
import { motion } from "motion/react";

import { DiscussionActions } from "@/components/admin/discussions/discussion-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Discussion } from "@/types/discussion";

export function DiscussionListItem({ discussion, index, onTogglePin, onMarkRead, onClose, onDelete }: {
  discussion: Discussion;
  index: number;
  onTogglePin: () => void;
  onMarkRead: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const href = `/admin/discussions/${discussion.id}`;
  const open = () => router.push(href);
  return <motion.article initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(index * 0.035, 0.2) }} whileHover={{ x: 2 }} role="link" tabIndex={0} onClick={open} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } }} className={`group cursor-pointer border-b border-border p-4 outline-none last:border-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-5 ${discussion.unreadCount > 0 ? "bg-primary/[0.035]" : "bg-surface"}`}><div className="flex items-start gap-3 sm:gap-4"><Avatar size="lg"><AvatarFallback className="bg-primary/10 font-semibold text-primary">{discussion.startedBy.initials}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-2">{discussion.pinned && <Tooltip><TooltipTrigger asChild><span className="shrink-0 text-primary"><Pin className="size-3.5 fill-current" /></span></TooltipTrigger><TooltipContent>Pinned discussion</TooltipContent></Tooltip>}<h2 className={`truncate text-sm text-text-primary sm:text-base ${discussion.unreadCount > 0 ? "font-bold" : "font-semibold"}`}>{discussion.title}</h2></div><p className="mt-1 text-xs font-medium text-primary">{discussion.eventName}</p><p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary"><span className="font-semibold text-text-primary">{discussion.startedBy.name}:</span> “{discussion.preview}”</p><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary"><span className="flex items-center gap-1.5"><Users className="size-3.5" /> {discussion.participantsCount} participants</span><span className="flex items-center gap-1.5"><MessageSquare className="size-3.5" /> {discussion.repliesCount} replies</span><span className="flex items-center gap-1.5"><Clock className="size-3.5" /> {discussion.lastActivity}</span></div></div><div className="flex shrink-0 items-start gap-1.5">{discussion.unreadCount > 0 && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{discussion.unreadCount} unread</Badge>}<Badge variant="outline" className={discussion.status === "Active" ? "hidden border-success/20 bg-success/10 text-success sm:inline-flex" : "hidden border-border bg-muted text-text-secondary sm:inline-flex"}>{discussion.status}</Badge><DiscussionActions discussion={discussion} onOpen={open} onTogglePin={onTogglePin} onMarkRead={onMarkRead} onClose={onClose} onDelete={onDelete} /></div></div></motion.article>;
}
