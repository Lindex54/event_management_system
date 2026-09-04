import { createHash, randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import QRCode from "qrcode";

import { pool } from "../config/database";
import { sendEmail } from "./mail.service";
import { hashPassword } from "../utils/password";

const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");

interface EventRow extends RowDataPacket {
  id: number;
  name: string;
  slug: string;
  date: string;
  dateLabel: string;
  time: string | null;
  endTime: string | null;
  capacity: number;
  status: string;
  registrationClosesAt: Date | null;
  registrationPast: number;
  venue: string | null;
  venueAddress: string | null;
}

export type PublicRegistrationResult =
  | { result: "REGISTERED"; registrationId: number; referenceCode: string; ticketToken: string; ticketUrl: string; accountSetupRequired: boolean; setupToken: string | null; event: EventRow }
  | { result: "EVENT_NOT_FOUND" | "REGISTRATION_CLOSED" | "EVENT_FULL" | "ALREADY_REGISTERED" | "ACCOUNT_UNAVAILABLE" };

function splitName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts.shift()!, lastName: parts.length ? parts.join(" ") : null };
}

function ticketUrl(token: string): string {
  return `${frontendUrl}/tickets/${token}`;
}

export async function registerParticipant(input: { slug: string; fullName: string; email: string; telephone: string }): Promise<PublicRegistrationResult> {
  const connection = await pool.getConnection();
  let newUserId: number | null = null;
  try {
    await connection.beginTransaction();
    const [eventRows] = await connection.query<EventRow[]>(
      `SELECT e.id,e.name,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') date,DATE_FORMAT(e.event_date,'%b %e, %Y') dateLabel,
        TIME_FORMAT(e.start_time,'%H:%i') time,TIME_FORMAT(e.end_time,'%H:%i') endTime,e.capacity,e.status,
        e.registration_closes_at registrationClosesAt,e.event_date<CURDATE() registrationPast,v.name venue,v.address venueAddress
       FROM events e LEFT JOIN venues v ON v.id=e.venue_id
       WHERE e.slug=? AND e.deleted_at IS NULL FOR UPDATE`,
      [input.slug],
    );
    const event = eventRows[0];
    if (!event) { await connection.rollback(); return { result: "EVENT_NOT_FOUND" }; }
    if (!['Upcoming', 'Active'].includes(event.status) || Boolean(event.registrationPast) || (event.registrationClosesAt && new Date(event.registrationClosesAt) <= new Date())) {
      await connection.rollback(); return { result: "REGISTRATION_CLOSED" };
    }

    const [personRows] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM people WHERE LOWER(email)=LOWER(?) AND deleted_at IS NULL FOR UPDATE",
      [input.email],
    );
    let personId = Number(personRows[0]?.id ?? 0);
    if (!personId) {
      const { firstName, lastName } = splitName(input.fullName);
      const [person] = await connection.execute<ResultSetHeader>(
        "INSERT INTO people(first_name,last_name,email,telephone)VALUES(?,?,?,?)",
        [firstName, lastName, input.email, input.telephone],
      );
      personId = person.insertId;
    } else {
      await connection.execute("UPDATE people SET telephone=COALESCE(NULLIF(telephone,''),?) WHERE id=?", [input.telephone, personId]);
    }

    const [userRows] = await connection.query<RowDataPacket[]>("SELECT id,status FROM users WHERE person_id=? AND deleted_at IS NULL FOR UPDATE", [personId]);
    let userId = Number(userRows[0]?.id ?? 0);
    if (userRows[0] && userRows[0].status !== "Active") { await connection.rollback(); return { result: "ACCOUNT_UNAVAILABLE" }; }
    if (!userId) {
      const placeholderHash = await hashPassword(randomBytes(32).toString("hex"));
      const [user] = await connection.execute<ResultSetHeader>("INSERT INTO users(person_id,password_hash,status)VALUES(?,?,'Active')", [personId, placeholderHash]);
      userId = user.insertId;
      newUserId = userId;
    }

    const [attendeeRows] = await connection.query<RowDataPacket[]>("SELECT id,status FROM attendees WHERE person_id=? AND deleted_at IS NULL FOR UPDATE", [personId]);
    let attendeeId = Number(attendeeRows[0]?.id ?? 0);
    if (attendeeRows[0] && attendeeRows[0].status !== "Active") { await connection.rollback(); return { result: "ACCOUNT_UNAVAILABLE" }; }
    if (!attendeeId) {
      const [attendee] = await connection.execute<ResultSetHeader>("INSERT INTO attendees(person_id,status)VALUES(?,'Active')", [personId]);
      attendeeId = attendee.insertId;
    }
    await connection.execute(
      "INSERT IGNORE INTO user_roles(user_id,role_id) SELECT ?,id FROM roles WHERE slug='attendee' AND is_active=TRUE",
      [userId],
    );

    const [existingRows] = await connection.query<RowDataPacket[]>(
      "SELECT id,status FROM registrations WHERE event_id=? AND attendee_id=? AND deleted_at IS NULL FOR UPDATE",
      [event.id, attendeeId],
    );
    const existing = existingRows[0];
    if (existing && existing.status !== "Cancelled") { await connection.rollback(); return { result: "ALREADY_REGISTERED" }; }

    const [[capacityRow]] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) count FROM registrations WHERE event_id=? AND status='Confirmed' AND deleted_at IS NULL",
      [event.id],
    );
    if (Number(capacityRow?.count ?? 0) >= Number(event.capacity)) { await connection.rollback(); return { result: "EVENT_FULL" }; }

    const referenceCode = `REG-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const token = randomBytes(32).toString("hex");
    let registrationId: number;
    if (existing) {
      await connection.execute(
        "UPDATE registrations SET status='Confirmed',reference_code=?,ticket_token=?,registered_at=CURRENT_TIMESTAMP,cancelled_at=NULL WHERE id=?",
        [referenceCode, token, existing.id],
      );
      registrationId = Number(existing.id);
    } else {
      const [registration] = await connection.execute<ResultSetHeader>(
        "INSERT INTO registrations(reference_code,ticket_token,event_id,attendee_id,status)VALUES(?,?,?,?,'Confirmed')",
        [referenceCode, token, event.id, attendeeId],
      );
      registrationId = registration.insertId;
    }
    let setupToken: string | null = null;
    if (newUserId) {
      setupToken = randomBytes(32).toString("hex");
      const setupTokenHash = createHash("sha256").update(setupToken).digest("hex");
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await connection.execute("INSERT INTO account_setup_tokens(user_id,token_hash,created_by_user_id,expires_at)VALUES(?,?,NULL,?)", [newUserId, setupTokenHash, expiresAt]);
    }
    await connection.commit();
    return { result: "REGISTERED", registrationId, referenceCode, ticketToken: token, ticketUrl: ticketUrl(token), accountSetupRequired: Boolean(newUserId), setupToken, event };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export async function sendRegistrationConfirmation(input: Extract<PublicRegistrationResult, { result: "REGISTERED" }> & { email: string; fullName: string }): Promise<void> {
  const qr = await QRCode.toBuffer(input.ticketUrl, { type: "png", width: 360, margin: 2, errorCorrectionLevel: "H" });
  const setupUrl = input.setupToken ? `${frontendUrl}/setup-account?token=${input.setupToken}` : null;
  const time = [input.event.time, input.event.endTime].filter(Boolean).join(" - ") || "Time to be announced";
  const venue = input.event.venue || "Venue to be announced";
  await sendEmail({
    to: input.email,
    subject: `Registration confirmed: ${input.event.name}`,
    text: `Hi ${input.fullName}, your registration for ${input.event.name} is confirmed. Reference: ${input.referenceCode}. Present the QR ticket at check-in. Ticket: ${input.ticketUrl}.${setupUrl ? ` Set your Evently password and open your dashboard: ${setupUrl}` : ` Sign in at ${frontendUrl}/login to open your dashboard.`}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827"><h1 style="font-size:22px">Registration confirmed</h1><p>Hi ${escapeHtml(input.fullName)},</p><p>Your place at <strong>${escapeHtml(input.event.name)}</strong> is confirmed.</p><div style="background:#f3f4f6;border-radius:10px;padding:16px"><p><strong>Date:</strong> ${escapeHtml(input.event.dateLabel)}</p><p><strong>Time:</strong> ${escapeHtml(time)}</p><p><strong>Venue:</strong> ${escapeHtml(venue)}</p><p><strong>Reference:</strong> ${escapeHtml(input.referenceCode)}</p></div><p style="text-align:center"><img src="cid:evently-ticket-qr" width="240" height="240" alt="Ticket QR code"></p><p>Bring this QR code to the event. Event staff will scan or enter the ticket and check you in. Live event access unlocks in your dashboard after successful check-in.</p><p style="margin:24px 0"><a href="${input.ticketUrl}" style="background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600">View Ticket</a></p>${setupUrl ? `<p><a href="${setupUrl}">Set your password to access your attendee dashboard</a>. This one-time link expires in 48 hours.</p>` : `<p><a href="${frontendUrl}/login">Sign in to your attendee dashboard</a>.</p>`}<p style="font-size:12px;color:#6b7280">Do not publicly share your ticket link or QR code.</p></div>`,
    attachments: [{ filename: `${input.referenceCode}.png`, content: qr, cid: "evently-ticket-qr", contentType: "image/png" }],
  });
}

export async function sendExistingAttendeeConfirmation(attendeeId: number, eventId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.id registrationId,r.reference_code referenceCode,r.ticket_token ticketToken,p.email,CONCAT_WS(' ',p.first_name,p.last_name) fullName,
      e.id,e.name,e.slug,DATE_FORMAT(e.event_date,'%Y-%m-%d') date,DATE_FORMAT(e.event_date,'%b %e, %Y') dateLabel,
      TIME_FORMAT(e.start_time,'%H:%i') time,TIME_FORMAT(e.end_time,'%H:%i') endTime,e.capacity,e.status,
      e.registration_closes_at registrationClosesAt,e.event_date<CURDATE() registrationPast,v.name venue,v.address venueAddress
     FROM registrations r JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id
     JOIN events e ON e.id=r.event_id LEFT JOIN venues v ON v.id=e.venue_id
     WHERE r.attendee_id=? AND r.event_id=? AND r.deleted_at IS NULL LIMIT 1`,
    [attendeeId, eventId],
  );
  const row = rows[0];
  if (!row) return;
  await sendRegistrationConfirmation({ result: "REGISTERED", registrationId: row.registrationId, referenceCode: row.referenceCode, ticketToken: row.ticketToken, ticketUrl: ticketUrl(row.ticketToken), accountSetupRequired: false, setupToken: null, event: row as EventRow, email: row.email, fullName: row.fullName });
}

const ticketSelect = `SELECT r.id registrationId,r.reference_code referenceCode,r.ticket_token ticketToken,r.status registrationStatus,
  CONCAT_WS(' ',p.first_name,p.last_name) attendeeName,e.id eventId,e.name event,e.slug,DATE_FORMAT(e.event_date,'%b %e, %Y') date,
  DATE_FORMAT(e.event_date,'%Y-%m-%d') eventDate,TIME_FORMAT(e.start_time,'%H:%i') time,TIME_FORMAT(e.end_time,'%H:%i') endTime,
  e.status eventStatus,e.description,e.agenda_type agendaType,e.agenda_url agendaUrl,e.agenda_file_name agendaFileName,
  v.name venue,v.address venueAddress,ac.checked_in_at checkedInAt
  FROM registrations r JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id
  JOIN events e ON e.id=r.event_id LEFT JOIN venues v ON v.id=e.venue_id LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id`;

export async function getPublicTicket(token: string) {
  const [rows] = await pool.query<RowDataPacket[]>(`${ticketSelect} WHERE r.ticket_token=? AND r.deleted_at IS NULL LIMIT 1`, [token]);
  const ticket = rows[0];
  return ticket ? { ...ticket, ticketUrl: ticketUrl(token), qrCodeDataUrl: await QRCode.toDataURL(ticketUrl(token), { width: 360, margin: 2, errorCorrectionLevel: "H" }) } : null;
}

export type LiveAccessResult = { result: "GRANTED"; data: RowDataPacket } | { result: "INVALID_TICKET" | "EVENT_MISMATCH" | "CANCELLED" | "NOT_CHECKED_IN" | "EVENT_UNAVAILABLE" };

export async function verifyLiveAccess(slug: string, token: string): Promise<LiveAccessResult> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${ticketSelect} WHERE r.ticket_token=? AND r.deleted_at IS NULL LIMIT 1`,
    [token],
  );
  const ticket = rows[0];
  if (!ticket) return { result: "INVALID_TICKET" };
  if (ticket.slug !== slug) return { result: "EVENT_MISMATCH" };
  if (ticket.registrationStatus === "Cancelled") return { result: "CANCELLED" };
  if (!ticket.checkedInAt) return { result: "NOT_CHECKED_IN" };
  if (!['Upcoming', 'Active'].includes(ticket.eventStatus)) return { result: "EVENT_UNAVAILABLE" };
  const [schedule] = await pool.query<RowDataPacket[]>(
    `SELECT s.title,s.description,TIME_FORMAT(s.start_time,'%H:%i') startTime,TIME_FORMAT(s.end_time,'%H:%i') endTime,s.room,
      CONCAT_WS(' ',p.first_name,p.last_name) speaker FROM event_schedule_items s
      LEFT JOIN speakers sp ON sp.id=s.speaker_id LEFT JOIN people p ON p.id=sp.person_id
      WHERE s.event_id=? AND s.deleted_at IS NULL ORDER BY s.item_date,s.start_time,s.sort_order`,
    [ticket.eventId],
  );
  return { result: "GRANTED", data: { ...ticket, schedule } };
}
