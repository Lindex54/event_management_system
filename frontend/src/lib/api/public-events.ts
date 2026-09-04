import { API_BASE_URL } from "@/lib/api/config";

export interface PublicEvent {
  id: number;
  name: string;
  slug: string;
  theme: string | null;
  description: string | null;
  date: string;
  dateLabel: string;
  time: string | null;
  endTime: string | null;
  timezone: string;
  capacity: number;
  status: string;
  imageUrl: string | null;
  imageAlt: string | null;
  registrationClosesAt: string | null;
  agendaType: "None" | "File" | "Url";
  agendaUrl: string | null;
  agendaFileName: string | null;
  agendaFileType: string | null;
  venue: string | null;
  venueAddress: string | null;
  organizer: string;
  registrations: number;
}

export interface PublicEventDetail extends PublicEvent {
  schedule: { title: string; description: string | null; startTime: string; endTime: string | null; room: string | null; speaker: string }[];
}

export async function listPublicEvents(): Promise<PublicEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/events`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message ?? "Unable to load events");
  return result.data;
}

export async function getPublicEvent(slug: string): Promise<PublicEventDetail | null> {
  const response = await fetch(`${API_BASE_URL}/api/events/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message ?? "Unable to load this event");
  return result.data;
}
