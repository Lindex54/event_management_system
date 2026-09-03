import type {
  Activity,
  AdminEvent,
  DashboardStat,
  Registration,
  SystemAlert,
} from "@/types/admin";

export const dashboardStats: DashboardStat[] = [
  { label: "Total Events", value: "148", change: "+12 this month", trend: "up", icon: "events" },
  { label: "Upcoming Events", value: "24", change: "Next 30 days", trend: "neutral", icon: "upcoming" },
  { label: "Total Registrations", value: "8,642", change: "+18.2%", trend: "up", icon: "registrations" },
  { label: "Total Attendees", value: "7,918", change: "+11.4%", trend: "up", icon: "attendees" },
  { label: "Total Organizers", value: "86", change: "+5 this month", trend: "up", icon: "organizers" },
  { label: "Events Today", value: "3", change: "2 venues", trend: "neutral", icon: "today" },
];

export const adminEvents: AdminEvent[] = [
  {
    id: "ai-innovation-summit",
    name: "AI Innovation Summit 2026",
    organizer: "Kampala Tech Network",
    date: "2026-09-12",
    dateLabel: "Sep 12, 2026",
    venue: "Serena Conference Centre",
    registrations: 428,
    capacity: 500,
    status: "Upcoming",
    registrationUrl: "https://events.example.com/events/ai-innovation-summit/register",
    registrationDeadline: "September 10, 2026",
  },
  {
    id: "east-africa-tech-expo",
    name: "East Africa Tech Expo",
    organizer: "Future Africa Group",
    date: "2026-09-03",
    dateLabel: "Sep 3, 2026",
    venue: "UMA Show Grounds",
    registrations: 812,
    capacity: 1000,
    status: "Active",
    registrationUrl: "https://events.example.com/events/east-africa-tech-expo/register",
    registrationDeadline: "September 3, 2026",
  },
  {
    id: "research-conference",
    name: "Annual Research Conference",
    organizer: "Makerere University",
    date: "2026-09-19",
    dateLabel: "Sep 19, 2026",
    venue: "CIT Block B Auditorium",
    registrations: 276,
    capacity: 350,
    status: "Upcoming",
    registrationUrl: "https://events.example.com/events/research-conference/register",
    registrationDeadline: "September 17, 2026",
  },
  {
    id: "career-expo",
    name: "Graduate Career Expo",
    organizer: "Talent Bridge Uganda",
    date: "2026-09-25",
    dateLabel: "Sep 25, 2026",
    venue: "Lugogo Indoor Stadium",
    registrations: 639,
    capacity: 750,
    status: "Upcoming",
    registrationUrl: "https://events.example.com/events/career-expo/register",
    registrationDeadline: "September 23, 2026",
  },
  {
    id: "creative-economy-forum",
    name: "Creative Economy Forum",
    organizer: "Create Uganda",
    date: "2026-08-28",
    dateLabel: "Aug 28, 2026",
    venue: "National Theatre",
    registrations: 184,
    capacity: 220,
    status: "Completed",
    registrationUrl: "https://events.example.com/events/creative-economy-forum/register",
    registrationDeadline: "August 26, 2026",
  },
];

export const registrationTrend = {
  categories: ["Aug 28", "Aug 29", "Aug 30", "Aug 31", "Sep 1", "Sep 2", "Sep 3"],
  values: [168, 214, 192, 286, 248, 354, 421],
};

export const eventStatusData = [
  { label: "Upcoming", value: 24 },
  { label: "Active", value: 8 },
  { label: "Completed", value: 109 },
  { label: "Cancelled", value: 7 },
];

export const recentRegistrations: Registration[] = [
  { id: "r1", attendee: { id: "a1", name: "Grace Nakato", email: "grace@example.com", initials: "GN" }, event: "AI Innovation Summit 2026", registeredAt: "Today, 10:42 AM", status: "Confirmed" },
  { id: "r2", attendee: { id: "a2", name: "Daniel Okello", email: "daniel@example.com", initials: "DO" }, event: "East Africa Tech Expo", registeredAt: "Today, 9:18 AM", status: "Pending" },
  { id: "r3", attendee: { id: "a3", name: "Martha Achieng", email: "martha@example.com", initials: "MA" }, event: "Graduate Career Expo", registeredAt: "Yesterday, 4:51 PM", status: "Confirmed" },
  { id: "r4", attendee: { id: "a4", name: "Isaac Mugisha", email: "isaac@example.com", initials: "IM" }, event: "Annual Research Conference", registeredAt: "Yesterday, 2:06 PM", status: "Cancelled" },
];

export const systemAlerts: SystemAlert[] = [
  { id: "s1", title: "3 events are happening today", detail: "Review schedules and venue readiness.", tone: "info", icon: "bell" },
  { id: "s2", title: "Registration closes tomorrow", detail: "AI Innovation Summit 2026", tone: "warning", icon: "clock" },
  { id: "s3", title: "2 organizer accounts await review", detail: "Verification is required before publishing.", tone: "warning", icon: "alert" },
  { id: "s4", title: "Graduate Career Expo is near capacity", detail: "85% of available places are filled.", tone: "success", icon: "alert" },
];

export const recentActivity: Activity[] = [
  { id: "a1", description: "created “Innovation Summit 2026”", actor: "Sarah Namuli", time: "8 minutes ago" },
  { id: "a2", description: "24 new registrations were received for Tech Expo", actor: "System", time: "32 minutes ago" },
  { id: "a3", description: "activated an organizer account", actor: "Administrator", time: "1 hour ago" },
  { id: "a4", description: "updated Annual Research Conference", actor: "Peter Kato", time: "3 hours ago" },
  { id: "a5", description: "copied the invitation link for Career Expo", actor: "Administrator", time: "Yesterday" },
];
