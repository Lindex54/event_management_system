export type DiscussionStatus = "Active" | "Closed";

export interface DiscussionStarter {
  name: string;
  initials: string;
}

export interface Discussion {
  id: string;
  title: string;
  eventId: string;
  eventName: string;
  startedBy: DiscussionStarter;
  preview: string;
  participantsCount: number;
  repliesCount: number;
  unreadCount: number;
  status: DiscussionStatus;
  pinned: boolean;
  lastActivity: string;
  lastActivityAt: string;
  createdAt: string;
}

export interface DiscussionMessage {
  id: string;
  discussionId: string;
  author: string;
  initials: string;
  body: string;
  sentAt: string;
  own?: boolean;
}
