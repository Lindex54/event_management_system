import { BACKEND_ORIGIN } from "@/lib/api/server-config";

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
  isFeatured: boolean | number;
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

export interface PublicSpeaker {
  name: string;
  title: string;
  organization: string | null;
  bio: string | null;
  photoUrl: string | null;
  type: "Speaker" | "Guest";
}

export interface PublicEventDetail extends PublicEvent {
  schedule: { title: string; description: string | null; startTime: string; endTime: string | null; room: string | null; speaker: string }[];
  coOrganizers: { name: string }[];
  speakers: PublicSpeaker[];
}

export interface PublicTicket {
  registrationId: number;
  referenceCode: string;
  ticketToken: string;
  registrationStatus: "Confirmed" | "Pending" | "Cancelled";
  attendeeName: string;
  eventId: number;
  event: string;
  slug: string;
  date: string;
  eventDate: string;
  time: string | null;
  endTime: string | null;
  eventStatus: string;
  venue: string | null;
  venueAddress: string | null;
  checkedInAt: string | null;
  ticketUrl: string;
  qrCodeDataUrl: string;
}

export interface LiveEventAccess extends Omit<PublicTicket, "ticketUrl" | "qrCodeDataUrl"> {
  description: string | null;
  agendaType: "None" | "File" | "Url";
  agendaUrl: string | null;
  agendaFileName: string | null;
  schedule: { title: string; description: string | null; startTime: string; endTime: string | null; room: string | null; speaker: string }[];
}

export async function listPublicEvents(): Promise<PublicEvent[]> {
  const response = await fetch(`${BACKEND_ORIGIN}/api/events`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message ?? "Unable to load events");
  return result.data;
}

export async function getPublicEvent(slug: string): Promise<PublicEventDetail | null> {
  const response = await fetch(`${BACKEND_ORIGIN}/api/events/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message ?? "Unable to load this event");
  return result.data;
}

export async function getPublicTicket(token: string): Promise<PublicTicket | null> {
  const response = await fetch(`${BACKEND_ORIGIN}/api/events/tickets/${encodeURIComponent(token)}`, { cache: "no-store" });
  if (response.status === 404) return null;
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message ?? "Unable to load ticket");
  return result.data;
}

export async function getLiveEventAccess(slug: string, token: string): Promise<{ data: LiveEventAccess | null; message: string | null }> {
  const response = await fetch(`${BACKEND_ORIGIN}/api/events/${encodeURIComponent(slug)}/live-access?ticket=${encodeURIComponent(token)}`, { cache: "no-store" });
  const result = await response.json().catch(() => ({ success: false, message: "Unable to verify event access" }));
  if (!response.ok || !result.success) return { data: null, message: result.message ?? "Event access denied" };
  return { data: result.data, message: null };
}
