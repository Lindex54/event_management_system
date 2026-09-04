import { pool } from "../../config/database";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

const eventSelect = `SELECT e.id,e.name,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') date,DATE_FORMAT(e.event_date,'%b %e, %Y') dateLabel,
  TIME_FORMAT(e.start_time,'%H:%i') time,TIME_FORMAT(e.end_time,'%H:%i') endTime,e.status,v.name venue,
  COUNT(DISTINCT CASE WHEN r.status='Confirmed' THEN r.id END) registrations,COUNT(DISTINCT ac.id) checkedIn
  FROM event_staff es JOIN events e ON e.id=es.event_id AND e.deleted_at IS NULL
  LEFT JOIN venues v ON v.id=e.venue_id
  LEFT JOIN registrations r ON r.event_id=e.id AND r.deleted_at IS NULL
  LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
  WHERE es.user_id=?`;

export async function isAssigned(userId: number, eventId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 FROM event_staff WHERE event_id=? AND user_id=?", [eventId, userId]);
  return rows.length > 0;
}

export async function dashboard(userId: number) {
  const [[stats], [todaySchedule]] = await Promise.all([
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT e.id) assignedEvents,
        COUNT(DISTINCT CASE WHEN e.event_date=CURDATE() THEN e.id END) eventsToday,
        COUNT(DISTINCT CASE WHEN e.event_date=CURDATE() AND r.status='Confirmed' THEN r.id END) expectedToday,
        COUNT(DISTINCT CASE WHEN e.event_date=CURDATE() THEN ac.id END) checkedInToday
       FROM event_staff es JOIN events e ON e.id=es.event_id AND e.deleted_at IS NULL
       LEFT JOIN registrations r ON r.event_id=e.id AND r.deleted_at IS NULL
       LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
       WHERE es.user_id=?`,
      [userId],
    ),
    pool.query<RowDataPacket[]>(
      `SELECT s.id,s.event_id eventId,e.name event,s.title,TIME_FORMAT(s.start_time,'%H:%i') startTime,TIME_FORMAT(s.end_time,'%H:%i') endTime,s.room
       FROM event_staff es JOIN events e ON e.id=es.event_id
       JOIN event_schedule_items s ON s.event_id=e.id AND s.deleted_at IS NULL AND s.item_date=CURDATE()
       WHERE es.user_id=? ORDER BY s.start_time`,
      [userId],
    ),
  ]);
  const row = stats[0] ?? { assignedEvents: 0, eventsToday: 0, expectedToday: 0, checkedInToday: 0 };
  return {
    assignedEvents: Number(row.assignedEvents),
    eventsToday: Number(row.eventsToday),
    expectedToday: Number(row.expectedToday),
    checkedInToday: Number(row.checkedInToday),
    remainingCheckIns: Math.max(0, Number(row.expectedToday) - Number(row.checkedInToday)),
    todaySchedule,
  };
}

export async function listEvents(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`${eventSelect} GROUP BY e.id,v.id ORDER BY e.event_date DESC`, [userId]);
  return rows;
}

export async function getEvent(userId: number, eventId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`${eventSelect} AND e.id=? GROUP BY e.id,v.id`, [userId, eventId]);
  return rows[0] ?? null;
}

export async function listAttendees(userId: number, eventId?: number) {
  const values: unknown[] = [userId];
  let extra = "";
  if (eventId) { extra = " AND e.id=?"; values.push(eventId); }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.id,r.reference_code referenceCode,CONCAT_WS(' ',p.first_name,p.last_name) attendee,p.email,
      r.event_id eventId,e.name event,r.status,
      CASE WHEN ac.id IS NULL THEN 'Not Checked In' ELSE 'Checked In' END checkInStatus,ac.checked_in_at checkedInAt
     FROM event_staff es JOIN events e ON e.id=es.event_id AND e.deleted_at IS NULL
     JOIN registrations r ON r.event_id=e.id AND r.deleted_at IS NULL
     JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id
     LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
     WHERE es.user_id=?${extra} ORDER BY r.registered_at DESC`,
    values,
  );
  return rows;
}

export async function searchAttendees(userId: number, eventId: number, query: string) {
  if (!(await isAssigned(userId, eventId))) return null;
  const like = `%${query}%`;
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.id,r.reference_code referenceCode,CONCAT_WS(' ',p.first_name,p.last_name) attendee,p.email,
      r.event_id eventId,r.status,
      CASE WHEN ac.id IS NULL THEN 'Not Checked In' ELSE 'Checked In' END checkInStatus,ac.checked_in_at checkedInAt
     FROM registrations r JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id
     LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
     WHERE r.event_id=? AND r.deleted_at IS NULL
       AND (p.email LIKE ? OR CONCAT_WS(' ',p.first_name,p.last_name) LIKE ? OR r.reference_code LIKE ?)
     ORDER BY p.first_name LIMIT 25`,
    [eventId, like, like, like],
  );
  return rows;
}

export type CheckInResult = "CHECKED_IN" | "ALREADY_CHECKED_IN" | "NOT_FOUND" | "CANCELLED" | "NOT_CONFIRMED";

export async function checkInRegistration(userId: number, registrationId: number): Promise<CheckInResult> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT r.id,r.status,ac.id AS checkInId FROM registrations r
       JOIN event_staff es ON es.event_id=r.event_id AND es.user_id=?
       LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
       WHERE r.id=? AND r.deleted_at IS NULL FOR UPDATE`,
      [userId, registrationId],
    );
    const registration = rows[0];
    if (!registration) { await connection.rollback(); return "NOT_FOUND"; }
    if (registration.status === "Cancelled") { await connection.rollback(); return "CANCELLED"; }
    if (registration.status !== "Confirmed") { await connection.rollback(); return "NOT_CONFIRMED"; }
    if (registration.checkInId) { await connection.rollback(); return "ALREADY_CHECKED_IN"; }
    await connection.execute("INSERT INTO attendance_check_ins(registration_id,checked_in_by_user_id)VALUES(?,?)", [registrationId, userId]);
    await connection.commit();
    return "CHECKED_IN";
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listSchedule(userId: number, eventId?: number) {
  const values: unknown[] = [userId];
  let extra = "";
  if (eventId) { extra = " AND e.id=?"; values.push(eventId); }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id,s.event_id eventId,e.name event,CONCAT_WS(' ',p.first_name,p.last_name) speaker,s.title,s.description,
      DATE_FORMAT(s.item_date,'%Y-%m-%d') date,TIME_FORMAT(s.start_time,'%H:%i') startTime,TIME_FORMAT(s.end_time,'%H:%i') endTime,s.room
     FROM event_staff es JOIN events e ON e.id=es.event_id
     JOIN event_schedule_items s ON s.event_id=e.id AND s.deleted_at IS NULL
     LEFT JOIN speakers sp ON sp.id=s.speaker_id LEFT JOIN people p ON p.id=sp.person_id
     WHERE es.user_id=?${extra} ORDER BY s.item_date,s.start_time,s.sort_order`,
    values,
  );
  return rows;
}

export async function notifications(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT n.id,n.notification_type type,n.title,n.message,n.is_read isRead,n.created_at createdAt,e.name event
     FROM notifications n LEFT JOIN events e ON e.id=n.related_event_id
     WHERE n.recipient_user_id=? ORDER BY n.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function markNotification(userId: number, id: number) {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE notifications SET is_read=TRUE,read_at=CURRENT_TIMESTAMP WHERE id=? AND recipient_user_id=?",
    [id, userId],
  );
  return result.affectedRows > 0;
}

export async function markAllNotifications(userId: number) {
  await pool.execute("UPDATE notifications SET is_read=TRUE,read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE recipient_user_id=? AND is_read=FALSE", [userId]);
}

export async function getProfile(userId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT u.id,CONCAT_WS(' ',p.first_name,p.last_name) name,p.first_name firstName,p.last_name lastName,p.email,p.telephone FROM users u JOIN people p ON p.id=u.person_id WHERE u.id=?",
    [userId],
  );
  return rows[0] ?? null;
}

export async function updateProfile(userId: number, input: { firstName: string; lastName?: string | null; telephone?: string | null }) {
  await pool.execute(
    "UPDATE people p JOIN users u ON u.person_id=p.id SET p.first_name=?,p.last_name=?,p.telephone=? WHERE u.id=?",
    [input.firstName, input.lastName ?? null, input.telephone ?? null, userId],
  );
}
