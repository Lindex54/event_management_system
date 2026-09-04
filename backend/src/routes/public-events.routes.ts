import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";

import { pool } from "../config/database";
import { getPublicTicket, registerParticipant, sendRegistrationConfirmation, verifyLiveAccess } from "../services/participant-journey.service";
import { sendDatabaseError, text } from "../utils/request";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telephonePattern = /^\+?[\d\s()-]{7,20}$/;
const ticketTokenPattern = /^[a-f0-9]{64}$/i;

const eventSelect = `SELECT e.id,e.name,e.slug,e.theme,e.description,DATE_FORMAT(e.event_date,'%Y-%m-%d') AS date,
  DATE_FORMAT(e.event_date,'%b %e, %Y') AS dateLabel,TIME_FORMAT(e.start_time,'%H:%i') AS time,TIME_FORMAT(e.end_time,'%H:%i') AS endTime,
  e.timezone,e.capacity,e.status,e.is_featured AS isFeatured,e.image_url AS imageUrl,e.image_alt AS imageAlt,e.registration_closes_at AS registrationClosesAt,
  e.agenda_type AS agendaType,e.agenda_url AS agendaUrl,e.agenda_file_name AS agendaFileName,e.agenda_file_type AS agendaFileType,
  v.name AS venue,v.address AS venueAddress,o.organization AS organizer,
  COUNT(DISTINCT CASE WHEN r.status='Confirmed' THEN r.id END) AS registrations
  FROM events e JOIN organizers o ON o.id=e.organizer_id LEFT JOIN venues v ON v.id=e.venue_id
  LEFT JOIN registrations r ON r.event_id=e.id AND r.deleted_at IS NULL
  WHERE e.deleted_at IS NULL`;

router.get("/", async (_request, response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${eventSelect} AND e.status IN ('Upcoming','Active') AND e.event_date>=CURDATE()
       GROUP BY e.id,v.id,o.id ORDER BY e.event_date ASC,e.start_time ASC`,
    );
    response.json({ success: true, data: rows });
  } catch (error) { sendDatabaseError(response, error, "List events"); }
});

router.get("/tickets/:token", async (request, response) => {
  const token = text(request.params.token);
  if (!ticketTokenPattern.test(token)) { response.status(404).json({ success: false, message: "Invalid ticket" }); return; }
  try {
    const ticket = await getPublicTicket(token);
    if (!ticket) { response.status(404).json({ success: false, message: "Ticket not found" }); return; }
    response.json({ success: true, data: ticket });
  } catch (error) { sendDatabaseError(response, error, "Get ticket"); }
});

router.get("/:slug/live-access", async (request, response) => {
  const slug = text(request.params.slug);
  const ticket = text(request.query.ticket);
  if (!slug || !ticketTokenPattern.test(ticket)) { response.status(403).json({ success: false, message: "A valid event ticket is required", data: { result: "INVALID_TICKET" } }); return; }
  try {
    const outcome = await verifyLiveAccess(slug, ticket);
    if (outcome.result !== "GRANTED") {
      const messages = { INVALID_TICKET: "This ticket is invalid", EVENT_MISMATCH: "This ticket belongs to a different event", CANCELLED: "This registration was cancelled", NOT_CHECKED_IN: "Event access unlocks after staff check-in", EVENT_UNAVAILABLE: "This event is not currently available" } as const;
      response.status(403).json({ success: false, message: messages[outcome.result], data: { result: outcome.result } });
      return;
    }
    response.json({ success: true, data: outcome.data });
  } catch (error) { sendDatabaseError(response, error, "Verify live event access"); }
});

router.post("/:slug/register", async (request, response) => {
  const slug = text(request.params.slug);
  const fullName = text(request.body?.fullName);
  const email = text(request.body?.email).toLowerCase();
  const telephone = text(request.body?.telephone);
  if (!slug || fullName.length < 2 || !emailPattern.test(email) || !telephonePattern.test(telephone)) {
    response.status(400).json({ success: false, message: "Full name, valid email, and telephone are required" });
    return;
  }
  try {
    const outcome = await registerParticipant({ slug, fullName, email, telephone });
    if (outcome.result !== "REGISTERED") {
      const details = {
        EVENT_NOT_FOUND: { status: 404, message: "Event not found" },
        REGISTRATION_CLOSED: { status: 409, message: "Registration is closed for this event" },
        EVENT_FULL: { status: 409, message: "This event has reached capacity" },
        ALREADY_REGISTERED: { status: 409, message: "This email is already registered for this event" },
        ACCOUNT_UNAVAILABLE: { status: 403, message: "This attendee account is unavailable. Please contact support." },
      } as const;
      const detail = details[outcome.result];
      response.status(detail.status).json({ success: false, message: detail.message, data: { result: outcome.result } });
      return;
    }
    let emailSent = true;
    try { await sendRegistrationConfirmation({ ...outcome, email, fullName }); }
    catch (mailError) { emailSent = false; console.error("Registration confirmation email failed", mailError); }
    response.status(201).json({
      success: true,
      message: emailSent ? "Registration confirmed. Your ticket has been emailed." : "Registration confirmed, but the email could not be sent. Save your ticket now.",
      data: { result: outcome.result, referenceCode: outcome.referenceCode, ticketUrl: outcome.ticketUrl, accountSetupRequired: outcome.accountSetupRequired, emailSent },
    });
  } catch (error) { sendDatabaseError(response, error, "Register participant"); }
});

router.get("/:slug", async (request, response) => {
  const slug = text(request.params.slug);
  if (!slug) { response.status(400).json({ success: false, message: "A valid event slug is required" }); return; }
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `${eventSelect} AND e.status<>'Draft' AND e.slug=? GROUP BY e.id,v.id,o.id`,
      [slug],
    );
    const event = rows[0];
    if (!event) { response.status(404).json({ success: false, message: "Event not found" }); return; }
    const [schedule] = await pool.query<RowDataPacket[]>(
      `SELECT s.title,s.description,TIME_FORMAT(s.start_time,'%H:%i') AS startTime,TIME_FORMAT(s.end_time,'%H:%i') AS endTime,s.room,
        CONCAT_WS(' ',p.first_name,p.last_name) AS speaker
       FROM event_schedule_items s LEFT JOIN speakers sp ON sp.id=s.speaker_id LEFT JOIN people p ON p.id=sp.person_id
       WHERE s.event_id=? AND s.deleted_at IS NULL ORDER BY s.item_date,s.start_time,s.sort_order`,
      [event.id],
    );
    const [coOrganizers] = await pool.query<RowDataPacket[]>(
      `SELECT CONCAT_WS(' ',p.first_name,p.last_name) AS name
       FROM event_staff es JOIN users u ON u.id=es.user_id JOIN people p ON p.id=u.person_id
       WHERE es.event_id=? ORDER BY name`,
      [event.id],
    );
    const [speakers] = await pool.query<RowDataPacket[]>(
      `SELECT CONCAT_WS(' ',p.first_name,p.last_name) AS name,sp.professional_title AS title,sp.organization,sp.bio,sp.photo_url AS photoUrl,sp.speaker_type AS type
       FROM event_speakers es JOIN speakers sp ON sp.id=es.speaker_id AND sp.deleted_at IS NULL JOIN people p ON p.id=sp.person_id
       WHERE es.event_id=? AND es.invitation_status='Confirmed' ORDER BY sp.created_at`,
      [event.id],
    );
    response.json({ success: true, data: { ...event, schedule, coOrganizers, speakers } });
  } catch (error) { sendDatabaseError(response, error, "Get event"); }
});

export default router;
