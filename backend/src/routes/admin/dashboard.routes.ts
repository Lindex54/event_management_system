import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";

import { pool } from "../../config/database";
import { requireAdmin } from "../../middleware/require-admin";
import { sendDatabaseError } from "../../utils/request";

const router = Router();
router.use(requireAdmin);

function percentChange(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "New this month" : "No change";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function relativeLabel(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86400000);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

router.get("/", async (_request, response) => {
  try {
    const [[statsRows], [trendRows], [statusRows], [upcomingRows], [registrationRows], [recentEvents], [recentRegs], [recentOrganizers], [closingSoonRows], [nearCapacityRows]] = await Promise.all([
      pool.query<RowDataPacket[]>(`SELECT
        (SELECT COUNT(*) FROM events WHERE deleted_at IS NULL) totalEvents,
        (SELECT COUNT(*) FROM events WHERE deleted_at IS NULL AND created_at>=DATE_FORMAT(CURDATE(),'%Y-%m-01')) eventsThisMonth,
        (SELECT COUNT(*) FROM events WHERE deleted_at IS NULL AND status IN ('Upcoming','Active') AND event_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 30 DAY)) upcomingEvents,
        (SELECT COUNT(*) FROM registrations WHERE deleted_at IS NULL) totalRegistrations,
        (SELECT COUNT(*) FROM registrations WHERE deleted_at IS NULL AND registered_at>=DATE_FORMAT(CURDATE(),'%Y-%m-01')) registrationsThisMonth,
        (SELECT COUNT(*) FROM registrations WHERE deleted_at IS NULL AND registered_at>=DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'),INTERVAL 1 MONTH) AND registered_at<DATE_FORMAT(CURDATE(),'%Y-%m-01')) registrationsLastMonth,
        (SELECT COUNT(*) FROM attendees WHERE deleted_at IS NULL) totalAttendees,
        (SELECT COUNT(*) FROM attendees WHERE deleted_at IS NULL AND created_at>=DATE_FORMAT(CURDATE(),'%Y-%m-01')) attendeesThisMonth,
        (SELECT COUNT(*) FROM attendees WHERE deleted_at IS NULL AND created_at>=DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'),INTERVAL 1 MONTH) AND created_at<DATE_FORMAT(CURDATE(),'%Y-%m-01')) attendeesLastMonth,
        (SELECT COUNT(*) FROM organizers WHERE deleted_at IS NULL) totalOrganizers,
        (SELECT COUNT(*) FROM organizers WHERE deleted_at IS NULL AND created_at>=DATE_FORMAT(CURDATE(),'%Y-%m-01')) organizersThisMonth,
        (SELECT COUNT(*) FROM organizers WHERE deleted_at IS NULL AND status='Pending') organizersPending,
        (SELECT COUNT(*) FROM events WHERE deleted_at IS NULL AND event_date=CURDATE()) eventsToday,
        (SELECT COUNT(DISTINCT venue_id) FROM events WHERE deleted_at IS NULL AND event_date=CURDATE() AND venue_id IS NOT NULL) venuesToday`),

      pool.query<RowDataPacket[]>(`SELECT DATE_FORMAT(registered_at,'%Y-%m-%d') day,COUNT(*) value FROM registrations WHERE deleted_at IS NULL AND registered_at>=DATE_SUB(CURDATE(),INTERVAL 6 DAY) GROUP BY DATE(registered_at)`),

      pool.query<RowDataPacket[]>(`SELECT status,COUNT(*) value FROM events WHERE deleted_at IS NULL AND status IN ('Upcoming','Active','Completed','Cancelled') GROUP BY status`),

      pool.query<RowDataPacket[]>(`SELECT e.id,e.name,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') date,DATE_FORMAT(e.event_date,'%b %e, %Y') dateLabel,e.status,o.organization organizer,v.name venue,e.capacity,
        COUNT(DISTINCT CASE WHEN r.status='Confirmed' THEN r.id END) registrations
        FROM events e JOIN organizers o ON o.id=e.organizer_id LEFT JOIN venues v ON v.id=e.venue_id
        LEFT JOIN registrations r ON r.event_id=e.id AND r.deleted_at IS NULL
        WHERE e.deleted_at IS NULL AND e.status IN ('Upcoming','Active') AND e.event_date>=CURDATE()
        GROUP BY e.id,o.id,v.id ORDER BY e.event_date ASC,e.start_time ASC LIMIT 8`),

      pool.query<RowDataPacket[]>(`SELECT r.id,CONCAT_WS(' ',p.first_name,p.last_name) name,p.email,e.name event,r.status,r.registered_at
        FROM registrations r JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id JOIN events e ON e.id=r.event_id
        WHERE r.deleted_at IS NULL ORDER BY r.registered_at DESC LIMIT 6`),

      pool.query<RowDataPacket[]>(`SELECT e.name subject,o.organization actor,e.created_at ts FROM events e JOIN organizers o ON o.id=e.organizer_id WHERE e.deleted_at IS NULL ORDER BY e.created_at DESC LIMIT 6`),

      pool.query<RowDataPacket[]>(`SELECT CONCAT_WS(' ',p.first_name,p.last_name) actor,e.name subject,r.registered_at ts
        FROM registrations r JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id JOIN events e ON e.id=r.event_id
        WHERE r.deleted_at IS NULL ORDER BY r.registered_at DESC LIMIT 6`),

      pool.query<RowDataPacket[]>(`SELECT organization actor,created_at ts FROM organizers WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 6`),

      pool.query<RowDataPacket[]>(`SELECT name FROM events WHERE deleted_at IS NULL AND status IN ('Upcoming','Active') AND registration_closes_at IS NOT NULL AND registration_closes_at>NOW() AND registration_closes_at<=DATE_ADD(NOW(),INTERVAL 48 HOUR) ORDER BY registration_closes_at ASC LIMIT 3`),

      pool.query<RowDataPacket[]>(`SELECT name,capacity,registrations FROM (
          SELECT e.name,e.capacity,COUNT(DISTINCT CASE WHEN r.status='Confirmed' THEN r.id END) registrations
          FROM events e LEFT JOIN registrations r ON r.event_id=e.id AND r.deleted_at IS NULL
          WHERE e.deleted_at IS NULL AND e.status IN ('Upcoming','Active') GROUP BY e.id
        ) t WHERE capacity>0 AND registrations/capacity>=0.85 ORDER BY registrations/capacity DESC LIMIT 3`),
    ]);

    const stats = statsRows[0]!;

    const trendMap = new Map(trendRows.map((row) => [row.day, Number(row.value)]));
    const registrationTrend = { categories: [] as string[], values: [] as number[] };
    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - index);
      const key = date.toISOString().slice(0, 10);
      registrationTrend.categories.push(date.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      registrationTrend.values.push(trendMap.get(key) ?? 0);
    }

    const statusMap = new Map(statusRows.map((row) => [row.status, Number(row.value)]));
    const eventStatusDistribution = ["Upcoming", "Active", "Completed", "Cancelled"].map((label) => ({ label, value: statusMap.get(label) ?? 0 }));

    const recentActivity = [
      ...recentEvents.map((row) => ({ actor: row.actor as string, description: `created "${row.subject}"`, ts: new Date(row.ts) })),
      ...recentRegs.map((row) => ({ actor: row.actor as string, description: `registered for ${row.subject}`, ts: new Date(row.ts) })),
      ...recentOrganizers.map((row) => ({ actor: row.actor as string, description: "joined as an organizer", ts: new Date(row.ts) })),
    ].sort((a, b) => b.ts.getTime() - a.ts.getTime()).slice(0, 6).map((item, index) => ({
      id: `activity-${index}`,
      actor: item.actor,
      description: item.description,
      time: relativeLabel(item.ts),
    }));

    const systemAlerts: { id: string; title: string; detail: string; tone: "info" | "warning" | "success"; icon: "bell" | "clock" | "alert" }[] = [];
    if (Number(stats.eventsToday) > 0) {
      systemAlerts.push({ id: "today", title: `${stats.eventsToday} event${Number(stats.eventsToday) === 1 ? " is" : "s are"} happening today`, detail: `Across ${stats.venuesToday} venue${Number(stats.venuesToday) === 1 ? "" : "s"}. Review schedules and venue readiness.`, tone: "info", icon: "bell" });
    }
    if (closingSoonRows.length) {
      systemAlerts.push({ id: "closing-soon", title: closingSoonRows.length === 1 ? "Registration closes within 48 hours" : `${closingSoonRows.length} events close registration within 48 hours`, detail: closingSoonRows.map((row) => row.name).join(", "), tone: "warning", icon: "clock" });
    }
    if (Number(stats.organizersPending) > 0) {
      systemAlerts.push({ id: "pending-organizers", title: `${stats.organizersPending} organizer account${Number(stats.organizersPending) === 1 ? "" : "s"} await review`, detail: "Verification is required before they can publish events.", tone: "warning", icon: "alert" });
    }
    for (const row of nearCapacityRows) {
      const pct = Math.round((Number(row.registrations) / Number(row.capacity)) * 100);
      systemAlerts.push({ id: `capacity-${row.name}`, title: `${row.name} is near capacity`, detail: `${pct}% of available places are filled.`, tone: "success", icon: "alert" });
    }

    response.json({
      success: true,
      data: {
        stats: {
          totalEvents: Number(stats.totalEvents ?? 0),
          eventsThisMonth: Number(stats.eventsThisMonth ?? 0),
          upcomingEvents: Number(stats.upcomingEvents ?? 0),
          totalRegistrations: Number(stats.totalRegistrations ?? 0),
          registrationsChange: percentChange(Number(stats.registrationsThisMonth ?? 0), Number(stats.registrationsLastMonth ?? 0)),
          totalAttendees: Number(stats.totalAttendees ?? 0),
          attendeesChange: percentChange(Number(stats.attendeesThisMonth ?? 0), Number(stats.attendeesLastMonth ?? 0)),
          totalOrganizers: Number(stats.totalOrganizers ?? 0),
          organizersThisMonth: Number(stats.organizersThisMonth ?? 0),
          eventsToday: Number(stats.eventsToday ?? 0),
          venuesToday: Number(stats.venuesToday ?? 0),
        },
        registrationTrend,
        eventStatusDistribution,
        upcomingEvents: upcomingRows,
        recentRegistrations: registrationRows.map((row) => ({ ...row, registeredAtLabel: relativeLabel(new Date(row.registered_at)) })),
        recentActivity,
        systemAlerts,
      },
    });
  } catch (error) { sendDatabaseError(response, error, "Load dashboard"); }
});

export default router;
