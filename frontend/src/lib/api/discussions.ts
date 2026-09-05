import type { DiscussionParticipant, DiscussionTypingUser, EventDiscussionDetail, EventDiscussionMessage, EventDiscussionSummary } from "@/types/event-discussion";

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/discussions${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (response.status === 204) return undefined as T;
  const result = await response.json().catch(() => ({ success: false, message: "Invalid server response" })) as ApiResponse<T>;
  if (response.status === 401 && typeof window !== "undefined") window.location.href = window.location.pathname.startsWith("/admin") ? "/admin/login" : "/login";
  if (!response.ok || !result.success) throw new Error(result.message ?? "The discussion request could not be completed");
  return result.data;
}

export const discussionApi = {
  list: () => request<EventDiscussionSummary[]>("/"),
  get: (eventId: number) => request<EventDiscussionDetail>(`/${eventId}`),
  messages: (eventId: number, afterId = 0) => request<{ discussion: EventDiscussionDetail; messages: EventDiscussionMessage[] }>(`/${eventId}/messages?afterId=${afterId}`),
  send: (eventId: number, message: string) => request<{ id: number }>(`/${eventId}/messages`, { method: "POST", body: JSON.stringify({ message }) }),
  deleteMessage: (eventId: number, messageId: number) => request<void>(`/${eventId}/messages/${messageId}`, { method: "DELETE" }),
  open: (eventId: number) => request<void>(`/${eventId}/open`, { method: "POST" }),
  close: (eventId: number) => request<void>(`/${eventId}/close`, { method: "POST" }),
  typing: (eventId: number) => request<void>(`/${eventId}/typing`, { method: "POST" }),
  typingUsers: (eventId: number) => request<DiscussionTypingUser[]>(`/${eventId}/typing`),
  participants: (eventId: number) => request<DiscussionParticipant[]>(`/${eventId}/participants`),
  removeParticipant: (eventId: number, userId: number) => request<void>(`/${eventId}/participants/${userId}`, { method: "DELETE" }),
};
