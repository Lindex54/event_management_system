import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../../config/database";
import { requireAdmin } from "../../middleware/require-admin";
import { scheduleInput } from "../../controllers/organizer/organizer.controller";
import { positiveId, positiveInteger, sendDatabaseError } from "../../utils/request";

const router = Router();
router.use(requireAdmin);

// Unlike the organizer/staff schedule endpoints (each scoped to their own events),
// the admin view has no ownership filter — an admin sees every schedule item across
// every organizer's events, and can add items for any of them.
const selectSchedule = `SELECT s.id,s.event_id eventId,e.name event,o.organization organizer,s.speaker_id speakerId,
    CONCAT_WS(' ',p.first_name,p.last_name) speaker,s.title,s.description,
    DATE_FORMAT(s.item_date,'%Y-%m-%d') date,TIME_FORMAT(s.start_time,'%H:%i') startTime,TIME_FORMAT(s.end_time,'%H:%i') endTime,
    s.room,s.sort_order sortOrder,s.created_by_role createdByRole,CONCAT_WS(' ',cp.first_name,cp.last_name) createdBy
  FROM event_schedule_items s JOIN events e ON e.id=s.event_id JOIN organizers o ON o.id=e.organizer_id
  LEFT JOIN speakers sp ON sp.id=s.speaker_id LEFT JOIN people p ON p.id=sp.person_id
  LEFT JOIN users cu ON cu.id=s.created_by_user_id LEFT JOIN people cp ON cp.id=cu.person_id
  WHERE e.deleted_at IS NULL AND s.deleted_at IS NULL`;

router.get("/", async (request, response) => {
  const eventId = request.query.eventId ? positiveInteger(request.query.eventId) : undefined;
  if (request.query.eventId && !eventId) { response.status(400).json({ success: false, message: "Valid event ID is required" }); return; }
  try {
    const values: unknown[] = [];
    let extra = "";
    if (eventId) { extra = " AND e.id=?"; values.push(eventId); }
    const [rows] = await pool.query<RowDataPacket[]>(`${selectSchedule}${extra} ORDER BY s.item_date,s.start_time,s.sort_order`, values);
    response.json({ success: true, data: rows });
  } catch (error) { sendDatabaseError(response, error, "List schedule"); }
});

router.post("/", async (request, response) => {
  const input = scheduleInput(request.body);
  if (!input) { response.status(400).json({ success: false, message: "Valid event, title, date, and time range are required" }); return; }
  try {
    if (input.speakerId) {
      const [assignment] = await pool.query<RowDataPacket[]>("SELECT 1 FROM event_speakers WHERE event_id=? AND speaker_id=?", [input.eventId, input.speakerId]);
      if (!assignment[0]) { response.status(400).json({ success: false, message: "Speaker must be assigned to the selected event" }); return; }
    }
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO event_schedule_items(event_id,speaker_id,title,description,item_date,start_time,end_time,room,sort_order,created_by_user_id,created_by_role)VALUES(?,?,?,?,?,?,?,?,?,?,'Admin')",
      [input.eventId, input.speakerId ?? null, input.title, input.description ?? null, input.date, input.startTime, input.endTime ?? null, input.room ?? null, input.sortOrder, response.locals.administrator.id],
    );
    response.status(201).json({ success: true, message: "Schedule item created", data: { id: result.insertId } });
  } catch (error) { sendDatabaseError(response, error, "Create schedule item"); }
});

router.put("/:id", async (request, response) => {
  const id = positiveId(request.params.id), input = scheduleInput(request.body);
  if (!id || !input) { response.status(400).json({ success: false, message: "Valid schedule details are required" }); return; }
  try {
    if (input.speakerId) {
      const [assignment] = await pool.query<RowDataPacket[]>("SELECT 1 FROM event_speakers WHERE event_id=? AND speaker_id=?", [input.eventId, input.speakerId]);
      if (!assignment[0]) { response.status(400).json({ success: false, message: "Speaker must be assigned to the selected event" }); return; }
    }
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE event_schedule_items SET event_id=?,speaker_id=?,title=?,description=?,item_date=?,start_time=?,end_time=?,room=?,sort_order=? WHERE id=? AND deleted_at IS NULL",
      [input.eventId, input.speakerId ?? null, input.title, input.description ?? null, input.date, input.startTime, input.endTime ?? null, input.room ?? null, input.sortOrder, id],
    );
    if (!result.affectedRows) { response.status(404).json({ success: false, message: "Schedule item not found" }); return; }
    response.json({ success: true, message: "Schedule item updated" });
  } catch (error) { sendDatabaseError(response, error, "Update schedule item"); }
});

router.delete("/:id", async (request, response) => {
  const id = positiveId(request.params.id);
  if (!id) { response.status(400).json({ success: false, message: "Valid schedule item ID is required" }); return; }
  try {
    const [result] = await pool.execute<ResultSetHeader>("UPDATE event_schedule_items SET deleted_at=CURRENT_TIMESTAMP WHERE id=? AND deleted_at IS NULL", [id]);
    if (!result.affectedRows) { response.status(404).json({ success: false, message: "Schedule item not found" }); return; }
    response.json({ success: true, message: "Schedule item removed" });
  } catch (error) { sendDatabaseError(response, error, "Delete schedule item"); }
});

export default router;
