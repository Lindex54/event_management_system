import { randomBytes } from "node:crypto";
import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../../config/database";
import { requireAdmin } from "../../middleware/require-admin";
import { createSetupToken, formatRoleName, sendInvitationEmail } from "../../services/invitation.service";
import { hashPassword } from "../../utils/password";
import { optionalText, positiveId, sendDatabaseError, text } from "../../utils/request";

const router = Router();
router.use(requireAdmin);

const invitableRoles = new Set(["System Administrator", "Event Staff"]);

const selectUsers = `SELECT u.id,u.username,CONCAT_WS(' ',p.first_name,p.last_name) AS name,p.first_name AS firstName,p.last_name AS lastName,p.email,p.telephone,
  GROUP_CONCAT(DISTINCT r.name ORDER BY r.name SEPARATOR ', ') AS role,u.status,DATE_FORMAT(u.created_at,'%b %e, %Y') AS joined,
  DATE_FORMAT(u.last_active_at,'%b %e, %Y') AS lastActive,
  EXISTS(SELECT 1 FROM account_setup_tokens t WHERE t.user_id=u.id AND t.used_at IS NULL AND t.expires_at>CURRENT_TIMESTAMP) AS setupPending
  FROM users u JOIN people p ON p.id=u.person_id JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id
  WHERE u.deleted_at IS NULL GROUP BY u.id,p.id ORDER BY u.created_at DESC`;

router.get("/", async (_request, response) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(selectUsers);
    response.json({ success: true, data: rows });
  } catch (error) { sendDatabaseError(response, error, "List users"); }
});

router.post("/", async (request, response) => {
  const firstName = text(request.body?.firstName);
  const lastName = text(request.body?.lastName);
  const email = text(request.body?.email).toLowerCase();
  const role = text(request.body?.role);
  const username = optionalText(request.body?.username);
  if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !invitableRoles.has(role)) {
    response.status(400).json({ success: false, message: "First name, last name, valid email, and a valid role are required" });
    return;
  }
  if (role === "System Administrator" && !username) {
    response.status(400).json({ success: false, message: "A username is required for System Administrator accounts" });
    return;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [roleRows] = await connection.query<RowDataPacket[]>("SELECT id FROM roles WHERE name=? LIMIT 1", [role]);
    if (!roleRows[0]) throw new Error("ROLE_MISSING");

    const [person] = await connection.execute<ResultSetHeader>(
      "INSERT INTO people(first_name,last_name,email,telephone)VALUES(?,?,?,?)",
      [firstName, lastName, email, optionalText(request.body?.telephone)],
    );
    const placeholderHash = await hashPassword(randomBytes(32).toString("hex"));
    const [user] = await connection.execute<ResultSetHeader>(
      "INSERT INTO users(person_id,username,password_hash,status)VALUES(?,?,?,'Active')",
      [person.insertId, username, placeholderHash],
    );
    await connection.execute(
      "INSERT INTO user_roles(user_id,role_id,assigned_by_user_id)VALUES(?,?,?)",
      [user.insertId, roleRows[0].id, response.locals.administrator.id],
    );
    await connection.commit();

    const token = await createSetupToken(user.insertId, response.locals.administrator.id);
    try {
      await sendInvitationEmail({ to: email, name: `${firstName} ${lastName}`, roleName: formatRoleName(role === "System Administrator" ? "system-administrator" : "event-staff"), token });
      response.status(201).json({ success: true, message: "User created and an invitation email was sent", id: user.insertId });
    } catch (mailError) {
      console.error("Invitation email failed to send", mailError);
      response.status(201).json({ success: true, message: "User created, but the invitation email could not be sent. Ask them to contact support.", id: user.insertId });
    }
  } catch (error) {
    await connection.rollback();
    sendDatabaseError(response, error, "Create user");
  } finally {
    connection.release();
  }
});

router.patch("/:id/status", async (request, response) => {
  const id = positiveId(request.params.id);
  const status = text(request.body?.status);
  if (!id || !["Active", "Inactive"].includes(status)) {
    response.status(400).json({ success: false, message: "A valid user ID and status are required" });
    return;
  }
  try {
    const [result] = await pool.execute<ResultSetHeader>("UPDATE users SET status=? WHERE id=? AND deleted_at IS NULL", [status, id]);
    if (!result.affectedRows) { response.status(404).json({ success: false, message: "User not found" }); return; }
    response.json({ success: true, message: `User ${status === "Active" ? "activated" : "deactivated"}` });
  } catch (error) { sendDatabaseError(response, error, "Update user status"); }
});

router.delete("/:id", async (request, response) => {
  const id = positiveId(request.params.id);
  if (!id) { response.status(400).json({ success: false, message: "Valid user ID is required" }); return; }
  try {
    const [result] = await pool.execute<ResultSetHeader>("UPDATE users SET deleted_at=CURRENT_TIMESTAMP,status='Inactive' WHERE id=? AND deleted_at IS NULL", [id]);
    if (!result.affectedRows) { response.status(404).json({ success: false, message: "User not found" }); return; }
    response.json({ success: true, message: "User deleted" });
  } catch (error) { sendDatabaseError(response, error, "Delete user"); }
});

export default router;
