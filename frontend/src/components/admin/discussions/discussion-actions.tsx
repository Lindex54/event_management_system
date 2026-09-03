"use client";

import * as React from "react";
import { Check, Lock, MessageSquare, MoreHorizontal, Pin, PinOff, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Discussion } from "@/types/discussion";

export function DiscussionActions({ discussion, onOpen, onTogglePin, onMarkRead, onClose, onDelete }: {
  discussion: Discussion;
  onOpen: () => void;
  onTogglePin: () => void;
  onMarkRead: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  return <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${discussion.title}`}><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onSelect={onOpen}><MessageSquare /> Open discussion</DropdownMenuItem><DropdownMenuItem onSelect={onTogglePin}>{discussion.pinned ? <PinOff /> : <Pin />}{discussion.pinned ? "Unpin" : "Pin"}</DropdownMenuItem><DropdownMenuItem onSelect={onMarkRead} disabled={discussion.unreadCount === 0}><Check /> Mark as read</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem onSelect={onClose} disabled={discussion.status === "Closed"}><Lock /> Close discussion</DropdownMenuItem><DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}><Trash2 /> Delete discussion</DropdownMenuItem></DropdownMenuContent></DropdownMenu><ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Delete this discussion?" description="This removes the discussion from the local frontend list. This action cannot be undone in the current session." actionLabel="Delete" onConfirm={() => { onDelete(); setConfirmDelete(false); }} /></div>;
}
