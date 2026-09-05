export type EventDiscussionStatus = "Open" | "Closed";

export interface EventDiscussionSummary {
  eventId: number;
  eventName: string;
  slug: string;
  eventDate: string;
  startTime: string | null;
  venueName: string | null;
  discussionId: number | null;
  status: EventDiscussionStatus;
  openedAt: string | null;
  closedAt: string | null;
  createdAt: string | null;
  canManage: boolean | number;
  messageCount: number;
  participantCount: number;
  latestMessage: string | null;
  lastActivityAt: string | null;
}

export interface EventDiscussionDetail {
  eventId: number;
  eventName: string;
  slug: string;
  eventDate: string;
  startTime: string | null;
  venueName: string | null;
  discussionId: number | null;
  status: EventDiscussionStatus;
  isAdministrator: boolean;
  canModerate: boolean;
  controlsActive: boolean;
  canOpen: boolean;
  canClose: boolean;
  currentUserId: number;
}

export interface EventDiscussionMessage {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
  senderName: string;
  senderRole: "Organizer" | "Staff" | "Participant" | "Administrator" | "Member";
}

export interface DiscussionTypingUser { userId: number; name: string; }
export interface DiscussionParticipant { userId: number; name: string; email: string; referenceCode: string; }
