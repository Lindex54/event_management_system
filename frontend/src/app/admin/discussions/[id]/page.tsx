import { DiscussionRoom } from "@/components/admin/discussions/discussion-room";
import { discussions } from "@/data/discussions";
import type { Discussion } from "@/types/discussion";

export default async function DiscussionRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = discussions.find((item) => item.id === id);
  const fallbackTitle = id.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const discussion: Discussion = found ?? {
    id, title: fallbackTitle, eventId: "local-event", eventName: "Event discussion",
    startedBy: { name: "Administrator", initials: "AD" }, preview: "A newly created event discussion.",
    participantsCount: 1, repliesCount: 0, unreadCount: 0, status: "Active", pinned: false,
    lastActivity: "Just now", lastActivityAt: new Date().toISOString(), createdAt: new Date().toISOString(),
  };
  return <DiscussionRoom discussion={discussion} />;
}
