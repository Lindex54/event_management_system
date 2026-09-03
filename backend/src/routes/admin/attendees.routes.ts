import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../../config/database";
import { requireAdmin } from "../../middleware/require-admin";
import { optionalText, positiveId, sendDatabaseError, text } from "../../utils/request";

const router = Router();
router.use(requireAdmin);
const statuses = new Set(["Active", "Disabled"]);

router.get("/", async (_request, response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT a.id, CONCAT_WS(' ', p.first_name, p.last_name) AS name, p.first_name AS firstName,
      p.last_name AS lastName, p.email, p.telephone, a.status, COUNT(r.id) AS eventsRegistered, COUNT(ac.id) AS checkedIn,
      DATE_FORMAT(MAX(r.registered_at), '%b %e, %Y') AS lastRegistration,
      CASE WHEN COUNT(r.id) > 1 THEN TRUE ELSE FALSE END AS \`returning\`
      FROM attendees a JOIN people p ON p.id=a.person_id LEFT JOIN registrations r ON r.attendee_id=a.id AND r.deleted_at IS NULL
      LEFT JOIN attendance_check_ins ac ON ac.registration_id=r.id
      WHERE a.deleted_at IS NULL GROUP BY a.id, p.id ORDER BY a.created_at DESC`);
    response.json({ success: true, data: rows });
  } catch (error) { sendDatabaseError(response, error, "List attendees"); }
});

router.post("/", async (request, response) => {
  const firstName = text(request.body?.firstName); const lastName = text(request.body?.lastName); const email = text(request.body?.email).toLowerCase();
  const status = text(request.body?.status) || "Active";
  if (!firstName || !lastName || !email || !statuses.has(status)) { response.status(400).json({ success: false, message: "First name, last name, email, and valid status are required" }); return; }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [person] = await connection.execute<ResultSetHeader>("INSERT INTO people (first_name,last_name,email,telephone) VALUES (?,?,?,?)", [firstName,lastName,email,optionalText(request.body?.telephone)]);
    const [attendee] = await connection.execute<ResultSetHeader>("INSERT INTO attendees (person_id,status) VALUES (?,?)", [person.insertId,status]);
    await connection.commit(); response.status(201).json({ success: true, message: "Attendee created", id: attendee.insertId });
  } catch (error) { await connection.rollback(); sendDatabaseError(response,error,"Create attendee"); } finally { connection.release(); }
});

router.put("/:id", async (request, response) => {
  const id=positiveId(request.params.id); const firstName=text(request.body?.firstName); const lastName=text(request.body?.lastName); const email=text(request.body?.email).toLowerCase(); const status=text(request.body?.status);
  if(!id||!firstName||!lastName||!email||!statuses.has(status)){response.status(400).json({success:false,message:"Valid attendee details are required"});return;}
  const connection=await pool.getConnection(); try{await connection.beginTransaction(); const [rows]=await connection.query<RowDataPacket[]>("SELECT person_id FROM attendees WHERE id=? AND deleted_at IS NULL FOR UPDATE",[id]); const attendee=rows[0]; if(!attendee){await connection.rollback();response.status(404).json({success:false,message:"Attendee not found"});return;} await connection.execute("UPDATE people SET first_name=?,last_name=?,email=?,telephone=? WHERE id=?",[firstName,lastName,email,optionalText(request.body?.telephone),attendee.person_id]); await connection.execute("UPDATE attendees SET status=? WHERE id=?",[status,id]); await connection.commit();response.json({success:true,message:"Attendee updated"});}catch(error){await connection.rollback();sendDatabaseError(response,error,"Update attendee");}finally{connection.release();}
});

router.delete("/:id", async (request,response)=>{const id=positiveId(request.params.id);if(!id){response.status(400).json({success:false,message:"Valid attendee ID is required"});return;}try{const [result]=await pool.execute<ResultSetHeader>("UPDATE attendees SET deleted_at=CURRENT_TIMESTAMP,status='Disabled' WHERE id=? AND deleted_at IS NULL",[id]);if(!result.affectedRows){response.status(404).json({success:false,message:"Attendee not found"});return;}response.json({success:true,message:"Attendee deleted"});}catch(error){sendDatabaseError(response,error,"Delete attendee");}});

export default router;
