import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, pool } from "../config/database";
import { adminSessionMaxAgeMs, createAdminSession } from "../services/admin-auth.service";
import { createUserSession, userSessionMaxAgeMs } from "../services/auth.service";
import { consumePasswordResetToken, createPasswordResetToken, organizerApprovalMessage, organizerApprovalStatus, sendPasswordResetEmail, validatePasswordResetToken } from "../services/invitation.service";
import { adminSessionCookieName, sessionCookieOptions, userSessionCookieName } from "../utils/cookies";
import { hashPassword, passwordStrengthError } from "../utils/password";
import { text } from "../utils/request";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genericMessage = "If an account exists for that email, a password reset link has been sent.";

router.post("/password/forgot", async (request, response) => {
  const email = text(request.body?.email).toLowerCase();
  if (!emailPattern.test(email)) { response.status(400).json({ success: false, message: "A valid email address is required" }); return; }
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT u.id AS userId, CONCAT_WS(' ',p.first_name,p.last_name) AS name FROM users u JOIN people p ON p.id=u.person_id WHERE LOWER(p.email)=? AND u.status='Active' AND u.deleted_at IS NULL LIMIT 1",
      [email],
    );
    const account = rows[0];
    if (account) {
      const token = await createPasswordResetToken(account.userId);
      sendPasswordResetEmail({ to: email, name: account.name, token }).catch((error) => console.error(`Password reset email failed (${databaseErrorCode(error)})`));
    }
    response.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error(`Password reset request failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to process this request right now" });
  }
});

router.get("/password/reset", async (request, response) => {
  const token = text(request.query.token as string | undefined);
  if (!token) { response.status(400).json({ success: false, message: "A reset token is required" }); return; }
  try {
    const result = await validatePasswordResetToken(token);
    if (!result) { response.status(410).json({ success: false, message: "This reset link is invalid, expired, or has already been used" }); return; }
    response.json({ success: true, data: { name: result.name, email: result.email } });
  } catch (error) {
    console.error(`Password reset token validation failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to verify this reset link right now" });
  }
});

router.post("/password/reset", async (request, response) => {
  const token = text(request.body?.token);
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  const confirmPassword = typeof request.body?.confirmPassword === "string" ? request.body.confirmPassword : "";
  if (!token) { response.status(400).json({ success: false, message: "A reset token is required" }); return; }
  if (password !== confirmPassword) { response.status(400).json({ success: false, message: "Passwords do not match" }); return; }
  const strengthError = passwordStrengthError(password);
  if (strengthError) { response.status(400).json({ success: false, message: strengthError }); return; }

  try {
    const result = await validatePasswordResetToken(token);
    if (!result) { response.status(410).json({ success: false, message: "This reset link is invalid, expired, or has already been used" }); return; }

    const passwordHash = await hashPassword(password);
    await pool.execute("UPDATE users SET password_hash=?,failed_login_attempts=0,locked_at=NULL WHERE id=?", [passwordHash, result.userId]);
    await consumePasswordResetToken(result.tokenId);

    const [roleRows] = await pool.query<RowDataPacket[]>(
      "SELECT r.slug FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=?",
      [result.userId],
    );
    const roleSlugs = roleRows.map((row) => row.slug as string);

    if (roleSlugs.includes("event-organizer")) {
      const status = await organizerApprovalStatus(result.userId);
      if (status !== "Active") {
        response.json({ success: true, pending: true, message: `Your password has been reset. ${organizerApprovalMessage(status)}`, data: { redirectTo: null } });
        return;
      }
    }

    let redirectTo = "/login";
    if (roleSlugs.includes("system-administrator")) {
      const sessionToken = await createAdminSession(result.userId, request.ip, request.get("user-agent"));
      response.cookie(adminSessionCookieName, sessionToken, sessionCookieOptions(adminSessionMaxAgeMs));
      redirectTo = "/admin";
    } else {
      const sessionToken = await createUserSession(result.userId, request.ip, request.get("user-agent"));
      response.cookie(userSessionCookieName, sessionToken, sessionCookieOptions(userSessionMaxAgeMs));
      redirectTo = roleSlugs.includes("event-organizer") ? "/organizer" : roleSlugs.includes("event-staff") ? "/staff" : roleSlugs.includes("attendee") ? "/attendee" : "/login";
    }

    response.json({ success: true, message: "Your password has been reset.", data: { redirectTo } });
  } catch (error) {
    console.error(`Password reset failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to reset your password right now" });
  }
});

export default router;
