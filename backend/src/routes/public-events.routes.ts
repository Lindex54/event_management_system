import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";

import { pool } from "../config/database";
import { sendDatabaseError, text } from "../utils/request";

const router = Router();

const eventSelect = `SELECT e.id,e.name,e.slug,e.theme,e.description,DATE_FORMAT(e.event_date,'%Y-%m-%d') AS date,
  DATE_FORMAT(e.event_date,'%b %e, %Y') AS dateLabel,TIME_FORMAT(e.start_time,'%H:%i') AS time,TIME_FORMAT(e.end_time,'%H:%i') AS endTime,
  e.timezone,e.capacity,e.status,e.image_url AS imageUrl,e.image_alt AS imageAlt,e.registration_closes_at AS registrationClosesAt,
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
    response.json({ success: true, data: { ...event, schedule } });
  } catch (error) { sendDatabaseError(response, error, "Get event"); }
});

export default router;
