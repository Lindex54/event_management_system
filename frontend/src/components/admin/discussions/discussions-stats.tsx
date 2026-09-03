import { MessageSquare, MessagesSquare, Users, MailOpen } from "lucide-react";

import { StatCards } from "@/components/admin/shared/stat-cards";
import type { Discussion } from "@/types/discussion";

export function DiscussionsStats({ discussions }: { discussions: Discussion[] }) {
  return <StatCards items={[
    { label: "Total Discussions", value: discussions.length, icon: MessagesSquare },
    { label: "Active Discussions", value: discussions.filter((item) => item.status === "Active").length, icon: MessageSquare },
    { label: "Unread Conversations", value: discussions.filter((item) => item.unreadCount > 0).length, detail: `${discussions.reduce((sum, item) => sum + item.unreadCount, 0)} unread messages`, icon: MailOpen },
    { label: "Participants", value: discussions.reduce((sum, item) => sum + item.participantsCount, 0), icon: Users },
  ]} />;
}
