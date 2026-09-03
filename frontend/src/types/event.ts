export type EventStatus = "Open" | "Selling fast" | "Registration closed";

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  image: string;
  imageAlt: string;
  status?: EventStatus;
  featured?: boolean;
}

export interface TimelineEvent {
  id: string;
  day: string;
  date: string;
  title: string;
  time: string;
  location: string;
}
