import { MessageSquare } from "lucide-react";

import { DiscussionListItem } from "@/components/admin/discussions/discussion-list-item";
import type { Discussion } from "@/types/discussion";

export function DiscussionList({ discussions, onTogglePin, onMarkRead, onClose, onDelete }: {
  discussions: Discussion[];
  onTogglePin: (id: string) => void;
  onMarkRead: (id: string) => void;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return <div className="overflow-hidden rounded-xl bg-surface ring-1 ring-foreground/10">{discussions.length ? discussions.map((discussion, index) => <DiscussionListItem key={discussion.id} discussion={discussion} index={index} onTogglePin={() => onTogglePin(discussion.id)} onMarkRead={() => onMarkRead(discussion.id)} onClose={() => onClose(discussion.id)} onDelete={() => onDelete(discussion.id)} />) : <div className="flex flex-col items-center px-4 py-16 text-center"><span className="flex size-12 items-center justify-center rounded-xl bg-muted text-text-secondary"><MessageSquare className="size-5" /></span><p className="mt-4 font-semibold text-text-primary">No discussions found</p><p className="mt-1 text-sm text-text-secondary">Try adjusting the search or filters.</p></div>}</div>;
}
