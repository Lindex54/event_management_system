import { adminEvents } from "@/data/admin-dashboard";
import type {
  ActivityLogRecord,
  AdminAttendeeRecord,
  AdminOrganizerRecord,
  AdminRegistrationRecord,
  EmailRecord,
  EmailTemplate,
  ManagementEvent,
  NotificationRecord,
  RoleRecord,
  SpeakerRecord,
  UserRecord,
  VenueRecord,
} from "@/types/admin";

export const managementEvents: ManagementEvent[] = [
  ...adminEvents.map((event, index) => ({ ...event, time: ["9:00 AM", "8:30 AM", "10:00 AM", "9:30 AM", "2:00 PM"][index] })),
  { id: "startup-week", name: "Kampala Startup Week", organizer: "Innovation Village", date: "2026-10-08", dateLabel: "Oct 8, 2026", time: "8:00 AM", venue: "Innovation Village", registrations: 92, capacity: 300, status: "Draft", registrationUrl: "https://events.example.com/events/startup-week/register", registrationDeadline: "October 6, 2026" },
  { id: "food-festival", name: "City Food Festival", organizer: "Kampala Eats", date: "2026-08-16", dateLabel: "Aug 16, 2026", time: "11:00 AM", venue: "Kololo Grounds", registrations: 520, capacity: 700, status: "Cancelled", registrationUrl: "https://events.example.com/events/food-festival/register", registrationDeadline: "August 14, 2026" },
];

export const registrationRecords: AdminRegistrationRecord[] = [
  ["REG-1048", "Grace Nakato", "AI Innovation Summit 2026", "grace@example.com", "Sep 3, 2026", "Confirmed", "Checked In"],
  ["REG-1047", "Daniel Okello", "East Africa Tech Expo", "daniel@example.com", "Sep 3, 2026", "Pending", "Not Checked In"],
  ["REG-1046", "Martha Achieng", "Graduate Career Expo", "martha@example.com", "Sep 2, 2026", "Confirmed", "Not Checked In"],
  ["REG-1045", "Isaac Mugisha", "Annual Research Conference", "isaac@example.com", "Sep 2, 2026", "Cancelled", "Not Checked In"],
  ["REG-1044", "Rita Atim", "AI Innovation Summit 2026", "rita@example.com", "Sep 1, 2026", "Confirmed", "Not Checked In"],
  ["REG-1043", "Brian Ssemanda", "East Africa Tech Expo", "brian@example.com", "Sep 1, 2026", "Confirmed", "Checked In"],
  ["REG-1042", "Joan Apio", "Graduate Career Expo", "joan@example.com", "Aug 31, 2026", "Pending", "Not Checked In"],
  ["REG-1041", "Andrew Kato", "Creative Economy Forum", "andrew@example.com", "Aug 30, 2026", "Confirmed", "Checked In"],
].map(([id, participant, event, email, date, status, checkIn]) => ({ id, participant, event, email, date, status, checkIn })) as AdminRegistrationRecord[];

export const attendeeRecords: AdminAttendeeRecord[] = [
  { id: "AT-201", name: "Grace Nakato", email: "grace@example.com", telephone: "+256 701 245 880", eventsRegistered: 4, lastRegistration: "Sep 3, 2026", status: "Active", returning: true },
  { id: "AT-202", name: "Daniel Okello", email: "daniel@example.com", telephone: "+256 772 918 443", eventsRegistered: 1, lastRegistration: "Sep 3, 2026", status: "Active", returning: false },
  { id: "AT-203", name: "Martha Achieng", email: "martha@example.com", telephone: "+256 755 120 611", eventsRegistered: 3, lastRegistration: "Sep 2, 2026", status: "Active", returning: true },
  { id: "AT-204", name: "Isaac Mugisha", email: "isaac@example.com", telephone: "+256 785 349 920", eventsRegistered: 2, lastRegistration: "Sep 2, 2026", status: "Disabled", returning: true },
  { id: "AT-205", name: "Rita Atim", email: "rita@example.com", telephone: "+256 704 781 039", eventsRegistered: 1, lastRegistration: "Sep 1, 2026", status: "Active", returning: false },
  { id: "AT-206", name: "Brian Ssemanda", email: "brian@example.com", telephone: "+256 779 643 288", eventsRegistered: 5, lastRegistration: "Sep 1, 2026", status: "Active", returning: true },
];

export const organizerRecords: AdminOrganizerRecord[] = [
  { id: "ORG-01", name: "Sarah Namuli", organization: "Kampala Tech Network", contact: "sarah@ktn.ug", eventsCreated: 18, activeEvents: 3, status: "Active", joined: "Jan 14, 2025" },
  { id: "ORG-02", name: "Peter Kato", organization: "Future Africa Group", contact: "peter@future.africa", eventsCreated: 11, activeEvents: 2, status: "Active", joined: "Mar 2, 2025" },
  { id: "ORG-03", name: "Agnes Nakitto", organization: "Create Uganda", contact: "agnes@create.ug", eventsCreated: 7, activeEvents: 1, status: "Pending", joined: "Aug 29, 2026" },
  { id: "ORG-04", name: "David Ouma", organization: "Talent Bridge Uganda", contact: "david@talentbridge.ug", eventsCreated: 14, activeEvents: 2, status: "Active", joined: "Jun 18, 2025" },
  { id: "ORG-05", name: "Lucy Ageno", organization: "Community Works", contact: "lucy@community.ug", eventsCreated: 3, activeEvents: 0, status: "Suspended", joined: "Nov 8, 2025" },
];

export const venueRecords: VenueRecord[] = [
  { id: "VEN-01", name: "Serena Conference Centre", location: "Kintu Road, Kampala", capacity: 500, events: 24, status: "Available", contact: "+256 312 309 000", description: "Modern conference facilities in central Kampala." },
  { id: "VEN-02", name: "UMA Show Grounds", location: "Lugogo Bypass, Kampala", capacity: 3000, events: 18, status: "Active", contact: "+256 414 221 034", description: "Large exhibition and outdoor event grounds." },
  { id: "VEN-03", name: "National Theatre", location: "De Winton Street, Kampala", capacity: 377, events: 31, status: "Available", contact: "+256 414 254 567", description: "Performing arts theatre and cultural venue." },
  { id: "VEN-04", name: "Lugogo Indoor Stadium", location: "Lugogo, Kampala", capacity: 4000, events: 15, status: "Active", contact: "+256 702 111 222", description: "Indoor arena for large public events." },
  { id: "VEN-05", name: "CIT Block B Auditorium", location: "Makerere University", capacity: 350, events: 12, status: "Disabled", contact: "+256 414 530 020", description: "Academic conference auditorium." },
];

export const userRecords: UserRecord[] = [
  { id: "USR-01", name: "Administrator", email: "admin@evently.ug", telephone: "+256 700 000 001", role: "System Administrator", status: "Active", joined: "Jan 4, 2025", lastActive: "Just now" },
  { id: "USR-02", name: "Sarah Namuli", email: "sarah@ktn.ug", telephone: "+256 701 200 411", role: "Event Organizer", status: "Active", joined: "Jan 14, 2025", lastActive: "12 min ago" },
  { id: "USR-03", name: "Mark Opio", email: "mark@evently.ug", telephone: "+256 774 921 411", role: "Event Staff", status: "Active", joined: "Apr 9, 2025", lastActive: "1 hour ago" },
  { id: "USR-04", name: "Grace Nakato", email: "grace@example.com", telephone: "+256 701 245 880", role: "Attendee", status: "Active", joined: "May 20, 2025", lastActive: "Yesterday" },
  { id: "USR-05", name: "Lucy Ageno", email: "lucy@community.ug", telephone: "+256 752 400 128", role: "Event Organizer", status: "Inactive", joined: "Nov 8, 2025", lastActive: "Aug 12, 2026" },
  { id: "USR-06", name: "Daniel Okello", email: "daniel@example.com", telephone: "+256 772 918 443", role: "Attendee", status: "Active", joined: "Aug 30, 2026", lastActive: "Today" },
];

export const roleRecords: RoleRecord[] = [
  { id: "admin", name: "System Administrator", description: "Full platform administration and configuration access.", users: 3, permissions: ["View Events", "Create Events", "Edit Events", "Delete Events", "View Registrations", "Manage Registrations", "View Users", "Create Users", "Edit Users", "Manage Roles", "View Reports", "View Analytics", "View Logs", "Manage Settings"] },
  { id: "organizer", name: "Event Organizer", description: "Creates and manages events, attendees and communication.", users: 86, permissions: ["View Events", "Create Events", "Edit Events", "View Registrations", "Manage Registrations", "View Attendees", "Manage Attendees", "View Reports"] },
  { id: "staff", name: "Event Staff", description: "Supports registrations, attendee check-in and event operations.", users: 42, permissions: ["View Events", "View Registrations", "Manage Registrations", "View Attendees"] },
  { id: "attendee", name: "Attendee", description: "Registers for public events and manages personal registrations.", users: 7918, permissions: ["View Events"] },
];

export const speakerRecords: SpeakerRecord[] = [
  { id: "SPK-101", name: "Dr. Amina Nsubuga", email: "amina@example.com", title: "AI Research Lead", organization: "Makerere AI Lab", event: "AI Innovation Summit 2026", status: "Confirmed", initials: "AN" },
  { id: "SPK-102", name: "James Okello", email: "james@example.com", title: "Founder & CEO", organization: "Nile Ventures", event: "East Africa Tech Expo", status: "Confirmed", initials: "JO" },
  { id: "SPK-103", name: "Prof. Sarah Atwine", email: "sarah.atwine@example.com", title: "Research Director", organization: "Uganda Science Council", event: "Annual Research Conference", status: "Pending", initials: "SA" },
  { id: "SPK-104", name: "Michael Kato", email: "michael@example.com", title: "Creative Director", organization: "Studio Kampala", event: "Creative Economy Forum", status: "Confirmed", initials: "MK" },
  { id: "SPK-105", name: "Lydia Namara", email: "lydia@example.com", title: "Talent Strategy Lead", organization: "Career Bridge", event: "Graduate Career Expo", status: "Pending", initials: "LN" },
];

export const notificationRecords: NotificationRecord[] = [
  { id: "N-01", title: "24 new registrations", description: "East Africa Tech Expo received new registrations.", type: "New registration", time: "8 minutes ago", read: false },
  { id: "N-02", title: "Organizer account needs approval", description: "Agnes Nakitto submitted verification details.", type: "Organizer approval", time: "36 minutes ago", read: false },
  { id: "N-03", title: "Registration closes tomorrow", description: "AI Innovation Summit registration is ending soon.", type: "Registration closing", time: "2 hours ago", read: false },
  { id: "N-04", title: "Event reached 85% capacity", description: "Graduate Career Expo is nearly full.", type: "Capacity reached", time: "Yesterday", read: true },
  { id: "N-05", title: "City Food Festival cancelled", description: "The organizer cancelled the event and attendees were notified.", type: "Event cancelled", time: "2 days ago", read: true },
];

export const sentEmails: EmailRecord[] = [
  { id: "EM-01", subject: "Your Tech Expo registration is confirmed", audience: "East Africa Tech Expo attendees", sentAt: "Sep 3, 9:30 AM", recipients: 812 },
  { id: "EM-02", subject: "Reminder: AI Innovation Summit", audience: "Registered attendees", sentAt: "Sep 2, 4:00 PM", recipients: 428 },
  { id: "EM-03", subject: "Important event schedule update", audience: "Annual Research Conference", sentAt: "Sep 1, 11:15 AM", recipients: 276 },
];

export const emailTemplates: EmailTemplate[] = [
  { id: "TPL-01", name: "Registration Confirmation", subject: "Your registration is confirmed", description: "Sent after an attendee completes registration." },
  { id: "TPL-02", name: "Event Reminder", subject: "Your event starts soon", description: "Reminder with event date, time and venue." },
  { id: "TPL-03", name: "Event Update", subject: "Important event update", description: "Communicate schedule or venue changes." },
  { id: "TPL-04", name: "Event Cancellation", subject: "Event cancellation notice", description: "Notify registered attendees about a cancellation." },
  { id: "TPL-05", name: "Thank You", subject: "Thank you for attending", description: "Post-event appreciation and follow-up." },
];

export const activityLogRecords: ActivityLogRecord[] = [
  { id: "LOG-1008", user: "Sarah Namuli", action: "Created event", module: "Events", description: "Created Innovation Summit 2026", dateTime: "Sep 3, 2026 10:42 AM", ipAddress: "192.168.1.24", actionType: "Create" },
  { id: "LOG-1007", user: "Administrator", action: "Activated organizer", module: "Organizers", description: "Activated the Future Africa organizer account", dateTime: "Sep 3, 2026 9:18 AM", ipAddress: "192.168.1.10", actionType: "Update" },
  { id: "LOG-1006", user: "Peter Kato", action: "Edited event", module: "Events", description: "Updated the Annual Research Conference venue", dateTime: "Sep 2, 2026 4:51 PM", ipAddress: "10.0.0.42", actionType: "Update" },
  { id: "LOG-1005", user: "Administrator", action: "Copied invitation link", module: "Registrations", description: "Copied invitation link for Graduate Career Expo", dateTime: "Sep 2, 2026 2:06 PM", ipAddress: "192.168.1.10", actionType: "Access" },
  { id: "LOG-1004", user: "Administrator", action: "Updated settings", module: "System", description: "Updated default registration closing behavior", dateTime: "Sep 1, 2026 3:30 PM", ipAddress: "192.168.1.10", actionType: "Update" },
  { id: "LOG-1003", user: "Lucy Ageno", action: "Cancelled registration", module: "Registrations", description: "Cancelled registration REG-1029", dateTime: "Aug 31, 2026 1:22 PM", ipAddress: "10.0.1.18", actionType: "Delete" },
];

export const permissionGroups = {
  Events: ["View Events", "Create Events", "Edit Events", "Delete Events"],
  Registrations: ["View Registrations", "Manage Registrations"],
  Attendees: ["View Attendees", "Manage Attendees"],
  Users: ["View Users", "Create Users", "Edit Users", "Manage Roles"],
  Reporting: ["View Reports", "View Analytics"],
  System: ["View Logs", "Manage Settings"],
};
