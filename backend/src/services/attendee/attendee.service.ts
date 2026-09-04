import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { pool } from "../../config/database";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

const registeredEventSelect = `SELECT e.id eventId,e.name,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') date,DATE_FORMAT(e.event_date,'%b %e, %Y') dateLabel,
  TIME_FORMAT(e.start_time,'%H:%i') time,e.image_url imageUrl,e.image_alt imageAlt,v.name venue,e.status eventStatus,
  r.id registrationId,r.reference_code referenceCode,r.ticket_token ticketToken,r.status registrationStatus,
  CASE WHEN ac.id IS NULL THEN 'Not Checked In' ELSE 'Checked In' END checkInStatus,ac.checked_in_at checkedInAt,
  CASE WHEN ac.id IS NOT NULL AND r.status='Confirmed' AND e.status IN ('Upcoming','Active') THEN TRUE ELSE FALSE END canEnterEvent
  FROM registrations r JOIN events e ON e.id=r.event_id AND e.deleted_at IS NULL
  LEFT JOIN venues v ON v.id=e.venue_id
  LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
  WHERE r.attendee_id=? AND r.deleted_at IS NULL`;

export async function dashboard(attendeeId: number) {
  const [[stats], [nextEvent], [upcoming], [recent]] = await Promise.all([
    pool.query<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT CASE WHEN e.event_date>=CURDATE() AND r.status='Confirmed' THEN r.id END) upcomingRegistered,
        COUNT(DISTINCT r.id) totalRegistrations,
        COUNT(DISTINCT CASE WHEN ac.id IS NOT NULL THEN r.id END) eventsAttended,
        COUNT(DISTINCT CASE WHEN r.status='Pending' THEN r.id END) pendingRegistrations
       FROM registrations r JOIN events e ON e.id=r.event_id
       LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
       WHERE r.attendee_id=? AND r.deleted_at IS NULL`,
      [attendeeId],
    ),
    pool.query<RowDataPacket[]>(`${registeredEventSelect} AND e.event_date>=CURDATE() AND r.status='Confirmed' ORDER BY e.event_date,e.start_time LIMIT 1`, [attendeeId]),
    pool.query<RowDataPacket[]>(`${registeredEventSelect} AND e.event_date>=CURDATE() AND r.status<>'Cancelled' ORDER BY e.event_date,e.start_time LIMIT 5`, [attendeeId]),
    pool.query<RowDataPacket[]>(`${registeredEventSelect} ORDER BY r.registered_at DESC LIMIT 5`, [attendeeId]),
  ]);
  const row = stats[0] ?? { upcomingRegistered: 0, totalRegistrations: 0, eventsAttended: 0, pendingRegistrations: 0 };
  return {
    upcomingRegistered: Number(row.upcomingRegistered),
    totalRegistrations: Number(row.totalRegistrations),
    eventsAttended: Number(row.eventsAttended),
    pendingRegistrations: Number(row.pendingRegistrations),
    nextEvent: nextEvent[0] ?? null,
    upcoming,
    recent,
  };
}

export async function listEvents(attendeeId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`${registeredEventSelect} ORDER BY e.event_date DESC`, [attendeeId]);
  return rows;
}

export async function availableEvents(attendeeId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT e.id,e.name,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') date,DATE_FORMAT(e.event_date,'%b %e, %Y') dateLabel,
      TIME_FORMAT(e.start_time,'%H:%i') time,e.image_url imageUrl,e.image_alt imageAlt,v.name venue,e.capacity,
      COUNT(DISTINCT CASE WHEN r2.status='Confirmed' THEN r2.id END) registeredCount,
      r.id registrationId,r.status registrationStatus
     FROM events e LEFT JOIN venues v ON v.id=e.venue_id
     LEFT JOIN registrations r2 ON r2.event_id=e.id AND r2.deleted_at IS NULL
     LEFT JOIN registrations r ON r.event_id=e.id AND r.attendee_id=? AND r.deleted_at IS NULL
     WHERE e.deleted_at IS NULL AND e.status IN ('Upcoming','Active') AND e.event_date>=CURDATE()
     GROUP BY e.id,v.id,r.id ORDER BY e.event_date`,
    [attendeeId],
  );
  return rows;
}

export async function listRegistrations(attendeeId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.id,r.reference_code referenceCode,r.event_id eventId,e.name event,DATE_FORMAT(r.registered_at,'%b %e, %Y') registeredAt,
      r.status,CASE WHEN ac.id IS NULL THEN 'Not Checked In' ELSE 'Checked In' END checkInStatus
     FROM registrations r JOIN events e ON e.id=r.event_id
     LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
     WHERE r.attendee_id=? AND r.deleted_at IS NULL ORDER BY r.registered_at DESC`,
    [attendeeId],
  );
  return rows;
}

export async function cancelRegistration(attendeeId: number, registrationId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE registrations SET status='Cancelled',cancelled_at=CURRENT_TIMESTAMP WHERE id=? AND attendee_id=? AND status<>'Cancelled' AND deleted_at IS NULL",
    [registrationId, attendeeId],
  );
  return result.affectedRows > 0;
}

export type RegisterResult = "REGISTERED" | "EVENT_NOT_FOUND" | "REGISTRATION_CLOSED" | "ALREADY_REGISTERED" | "EVENT_FULL";

export async function registerForEvent(attendeeId: number, eventId: number): Promise<RegisterResult> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [events] = await connection.query<RowDataPacket[]>(
      "SELECT id,capacity,status,registration_closes_at FROM events WHERE id=? AND deleted_at IS NULL FOR UPDATE",
      [eventId],
    );
    const event = events[0];
    if (!event) { await connection.rollback(); return "EVENT_NOT_FOUND"; }
    if (!["Upcoming", "Active"].includes(event.status as string)) { await connection.rollback(); return "REGISTRATION_CLOSED"; }
    if (event.registration_closes_at && new Date(event.registration_closes_at as string) < new Date()) { await connection.rollback(); return "REGISTRATION_CLOSED"; }

    const [existingRows] = await connection.query<RowDataPacket[]>(
      "SELECT id,status FROM registrations WHERE event_id=? AND attendee_id=? AND deleted_at IS NULL",
      [eventId, attendeeId],
    );
    const existing = existingRows[0];
    if (existing && existing.status !== "Cancelled") { await connection.rollback(); return "ALREADY_REGISTERED"; }

    const [[capacityRow]] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) count FROM registrations WHERE event_id=? AND status='Confirmed' AND deleted_at IS NULL",
      [eventId],
    );
    if (Number(capacityRow?.count ?? 0) >= Number(event.capacity)) { await connection.rollback(); return "EVENT_FULL"; }

    const referenceCode = `REG-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const ticketToken = randomBytes(32).toString("hex");
    if (existing) {
      await connection.execute(
        "UPDATE registrations SET status='Confirmed',reference_code=?,ticket_token=?,registered_at=CURRENT_TIMESTAMP,cancelled_at=NULL WHERE id=?",
        [referenceCode, ticketToken, existing.id],
      );
    } else {
      await connection.execute(
        "INSERT INTO registrations(reference_code,ticket_token,event_id,attendee_id,status)VALUES(?,?,?,?, 'Confirmed')",
        [referenceCode, ticketToken, eventId, attendeeId],
      );
    }
    await connection.commit();
    return "REGISTERED";
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function tickets(attendeeId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.id registrationId,r.reference_code referenceCode,r.ticket_token ticketToken,e.name event,e.slug,DATE_FORMAT(e.event_date,'%b %e, %Y') date,
      TIME_FORMAT(e.start_time,'%H:%i') time,TIME_FORMAT(e.end_time,'%H:%i') endTime,v.name venue,v.address venueAddress,r.status,
      CONCAT_WS(' ',p.first_name,p.last_name) attendeeName,ac.checked_in_at checkedInAt,
      CASE WHEN ac.id IS NOT NULL AND r.status='Confirmed' AND e.status IN ('Upcoming','Active') THEN TRUE ELSE FALSE END canEnterEvent
     FROM registrations r JOIN events e ON e.id=r.event_id LEFT JOIN venues v ON v.id=e.venue_id
     JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id
     LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
     WHERE r.attendee_id=? AND r.status<>'Cancelled' AND r.deleted_at IS NULL ORDER BY e.event_date DESC`,
    [attendeeId],
  );
  const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return Promise.all(rows.map(async (row) => {
    const ticketUrl = `${frontendUrl}/tickets/${row.ticketToken}`;
    return { ...row, ticketUrl, liveUrl: `${frontendUrl}/events/${row.slug}/live?ticket=${row.ticketToken}`, qrCodeDataUrl: await QRCode.toDataURL(ticketUrl, { width: 320, margin: 2, errorCorrectionLevel: "H" }) };
  }));
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

export async function updateProfile(userId: number, input: { firstName: string; lastName?: string | null; email: string; telephone?: string | null }) {
  await pool.execute(
    "UPDATE people p JOIN users u ON u.person_id=p.id SET p.first_name=?,p.last_name=?,p.email=?,p.telephone=? WHERE u.id=?",
    [input.firstName, input.lastName ?? null, input.email, input.telephone ?? null, userId],
  );
}
