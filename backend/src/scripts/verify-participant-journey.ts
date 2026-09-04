import type { RowDataPacket } from "mysql2/promise";

import { pool } from "../config/database";
import { getPublicTicket, registerParticipant, verifyLiveAccess } from "../services/participant-journey.service";
import { checkInRegistration, verifyTicket } from "../services/staff/staff.service";

async function verify() {
  const [[schema]] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) total,SUM(ticket_token IS NULL) missing,COUNT(DISTINCT ticket_token) uniqueTokens FROM registrations WHERE deleted_at IS NULL",
  );
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT r.id registrationId,r.ticket_token token,e.slug,e.id eventId,es.user_id staffId,ac.id checkInId,
      p.email,CONCAT_WS(' ',p.first_name,p.last_name) fullName,COALESCE(p.telephone,'+256700000000') telephone
     FROM registrations r JOIN events e ON e.id=r.event_id LEFT JOIN event_staff es ON es.event_id=e.id
     JOIN attendees a ON a.id=r.attendee_id JOIN people p ON p.id=a.person_id
     LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
     WHERE r.deleted_at IS NULL AND r.status='Confirmed' ORDER BY ac.id IS NOT NULL DESC LIMIT 1`,
  );
  const row = rows[0];
  const ticket = row ? await getPublicTicket(row.token) : null;
  const live = row ? await verifyLiveAccess(row.slug, row.token) : null;
  const mismatch = row ? await verifyLiveAccess("definitely-not-this-event", row.token) : null;
  const staff = row?.staffId ? await verifyTicket(row.staffId, row.eventId, row.token) : null;
  const duplicate = row?.staffId && row.checkInId ? await checkInRegistration(row.staffId, row.registrationId) : null;
  const duplicateRegistration = row ? await registerParticipant({ slug: row.slug, fullName: row.fullName, email: row.email, telephone: row.telephone }) : null;
  const [closedEvents] = await pool.query<RowDataPacket[]>("SELECT slug FROM events WHERE deleted_at IS NULL AND status NOT IN ('Upcoming','Active') LIMIT 1");
  const closedRegistration = closedEvents[0] ? await registerParticipant({ slug: closedEvents[0].slug, fullName: "Workflow Test", email: "workflow-test@example.invalid", telephone: "+256700000000" }) : null;
  console.log(JSON.stringify({
    schema: { total: Number(schema?.total ?? 0), missing: Number(schema?.missing ?? 0), uniqueTokens: Number(schema?.uniqueTokens ?? 0) },
    ticketQrGenerated: Boolean(ticket?.qrCodeDataUrl?.startsWith("data:image/png")),
    liveAccess: live?.result ?? "NO_FIXTURE",
    eventMismatch: mismatch?.result ?? "NO_FIXTURE",
    staffVerification: staff?.result ?? "NO_ASSIGNED_STAFF_FIXTURE",
    duplicateCheckIn: duplicate ?? "NO_CHECKED_IN_FIXTURE",
    duplicateRegistration: duplicateRegistration?.result ?? "NO_FIXTURE",
    closedRegistration: closedRegistration?.result ?? "NO_CLOSED_EVENT_FIXTURE",
  }, null, 2));
}

void verify().finally(() => pool.end());
