import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../../config/database";
import { requireAdmin } from "../../middleware/require-admin";
import { optionalText, positiveId, positiveInteger, sendDatabaseError, text } from "../../utils/request";

const router = Router();
router.use(requireAdmin);
const statuses = new Set(["Available", "Active", "Disabled"]);

router.get("/", async (_request, response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT v.id, v.name, v.address AS location, v.capacity, v.description, v.contact, v.status,
      COUNT(e.id) AS events FROM venues v LEFT JOIN events e ON e.venue_id = v.id AND e.deleted_at IS NULL
      WHERE v.deleted_at IS NULL GROUP BY v.id ORDER BY v.created_at DESC`);
    response.json({ success: true, data: rows });
  } catch (error) { sendDatabaseError(response, error, "List venues"); }
});

router.post("/", async (request, response) => {
  const name = text(request.body?.name); const location = text(request.body?.location);
  const capacity = positiveInteger(request.body?.capacity); const status = text(request.body?.status) || "Available";
  if (!name || !location || !capacity || !statuses.has(status)) { response.status(400).json({ success: false, message: "Name, location, positive capacity, and valid status are required" }); return; }
  try {
    const [result] = await pool.execute<ResultSetHeader>("INSERT INTO venues (name, address, capacity, description, contact, status) VALUES (?, ?, ?, ?, ?, ?)", [name, location, capacity, optionalText(request.body?.description), optionalText(request.body?.contact), status]);
    response.status(201).json({ success: true, message: "Venue created", id: result.insertId });
  } catch (error) { sendDatabaseError(response, error, "Create venue"); }
});

router.put("/:id", async (request, response) => {
  const id = positiveId(request.params.id); const name = text(request.body?.name); const location = text(request.body?.location);
  const capacity = positiveInteger(request.body?.capacity); const status = text(request.body?.status);
  if (!id || !name || !location || !capacity || !statuses.has(status)) { response.status(400).json({ success: false, message: "Valid venue details are required" }); return; }
  try {
    const [result] = await pool.execute<ResultSetHeader>("UPDATE venues SET name=?, address=?, capacity=?, description=?, contact=?, status=? WHERE id=? AND deleted_at IS NULL", [name, location, capacity, optionalText(request.body?.description), optionalText(request.body?.contact), status, id]);
    if (!result.affectedRows) { response.status(404).json({ success: false, message: "Venue not found" }); return; }
    response.json({ success: true, message: "Venue updated" });
  } catch (error) { sendDatabaseError(response, error, "Update venue"); }
});

router.delete("/:id", async (request, response) => {
  const id = positiveId(request.params.id); if (!id) { response.status(400).json({ success: false, message: "Valid venue ID is required" }); return; }
  try {
    const [result] = await pool.execute<ResultSetHeader>("UPDATE venues SET deleted_at=CURRENT_TIMESTAMP, status='Disabled' WHERE id=? AND deleted_at IS NULL", [id]);
    if (!result.affectedRows) { response.status(404).json({ success: false, message: "Venue not found" }); return; }
    response.json({ success: true, message: "Venue deleted" });
  } catch (error) { sendDatabaseError(response, error, "Delete venue"); }
});

export default router;
