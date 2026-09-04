export type EventStatus = "Draft" | "Upcoming" | "Active" | "Completed" | "Cancelled";
export type RegistrationStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Organizer {
  id: string;
  name: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export interface AdminEvent {
  id: string;
  name: string;
  organizer: string;
  date: string;
  dateLabel: string;
  venue: string;
  registrations: number;
  capacity: number;
  status: EventStatus;
  registrationUrl: string;
  registrationDeadline: string;
}

export interface Registration {
  id: string;
  attendee: Attendee;
  event: string;
  registeredAt: string;
  status: RegistrationStatus;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "neutral";
  icon: "events" | "upcoming" | "registrations" | "attendees" | "organizers" | "today";
}

export interface Activity {
  id: string;
  description: string;
  actor: string;
  time: string;
}

export interface SystemAlert {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "warning" | "danger" | "success";
  icon: "bell" | "clock" | "alert";
}

export interface ManagementEvent extends AdminEvent { time: string; }
export interface AdminRegistrationRecord {
  id: string; participant: string; event: string; email: string; date: string;
  status: RegistrationStatus; checkIn: "Checked In" | "Not Checked In";
}
export interface AdminAttendeeRecord {
  id: string; name: string; email: string; telephone: string; eventsRegistered: number;
  lastRegistration: string; status: "Active" | "Disabled"; returning: boolean;
}
export interface AdminOrganizerRecord {
  id: string; name: string; organization: string; contact: string; eventsCreated: number;
  activeEvents: number; status: "Active" | "Pending" | "Suspended"; joined: string;
}
export interface VenueRecord {
  id: string; name: string; location: string; capacity: number; events: number;
  status: "Available" | "Active" | "Disabled"; contact: string; description: string;
}
export interface UserRecord {
  id: string; name: string; email: string; telephone: string; role: string;
  status: "Active" | "Inactive"; joined: string; lastActive: string;
}
export interface RoleRecord { id: string; name: string; description: string; users: number; permissions: string[]; }
export interface SpeakerRecord {
  id: string; name: string; email: string; title: string; organization: string;
  event: string; status: "Confirmed" | "Pending"; initials: string;
}
export interface NotificationRecord {
  id: string; title: string; description: string; type: string; time: string; read: boolean;
}
export interface EmailRecord { id: string; subject: string; audience: string; sentAt: string; recipients: number; }
export interface EmailTemplate { id: string; name: string; subject: string; description: string; }
export interface ActivityLogRecord {
  id: string; user: string; action: string; module: string; description: string;
  dateTime: string; ipAddress: string; actionType: "Create" | "Update" | "Delete" | "Access";
}

export interface DashboardStats {
  totalEvents: number; eventsThisMonth: number; upcomingEvents: number;
  totalRegistrations: number; registrationsChange: string;
  totalAttendees: number; attendeesChange: string;
  totalOrganizers: number; organizersThisMonth: number;
  eventsToday: number; venuesToday: number;
}
export interface DashboardUpcomingEvent {
  id: number; name: string; slug: string; date: string; dateLabel: string; status: EventStatus;
  organizer: string; venue: string | null; capacity: number; registrations: number;
}
export interface DashboardRegistration {
  id: number; name: string; email: string; event: string; status: RegistrationStatus; registeredAtLabel: string;
}
export interface DashboardActivityItem { id: string; actor: string; description: string; time: string; }
export interface DashboardAlert { id: string; title: string; detail: string; tone: "info" | "warning" | "danger" | "success"; icon: "bell" | "clock" | "alert"; }
export interface DashboardData {
  stats: DashboardStats;
  registrationTrend: { categories: string[]; values: number[] };
  eventStatusDistribution: { label: string; value: number }[];
  upcomingEvents: DashboardUpcomingEvent[];
  recentRegistrations: DashboardRegistration[];
  recentActivity: DashboardActivityItem[];
  systemAlerts: DashboardAlert[];
}
