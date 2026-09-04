import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { databaseErrorCode, pool } from "../config/database";
import { adminSessionMaxAgeMs, createAdminSession } from "../services/admin-auth.service";
import { createUserSession, userSessionMaxAgeMs } from "../services/auth.service";
import { claimFirstLoginWelcome, consumeSetupToken, formatRoleName, organizerApprovalMessage, organizerApprovalStatus, sendWelcomeEmail, validateSetupToken } from "../services/invitation.service";
import { adminSessionCookieName, sessionCookieOptions, userSessionCookieName } from "../utils/cookies";
import { hashPassword } from "../utils/password";

const router = Router();

const passwordPattern = {
  length: /.{8,}/,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

function passwordError(password: string): string | null {
  if (!passwordPattern.length.test(password)) return "Password must be at least 8 characters long";
  if (!passwordPattern.upper.test(password)) return "Password must contain at least one uppercase letter";
  if (!passwordPattern.lower.test(password)) return "Password must contain at least one lowercase letter";
  if (!passwordPattern.number.test(password)) return "Password must contain at least one number";
  if (!passwordPattern.special.test(password)) return "Password must contain at least one special character";
  return null;
}

router.get("/setup-account", async (request, response) => {
  const token = typeof request.query.token === "string" ? request.query.token : "";
  if (!token) { response.status(400).json({ success: false, message: "A setup token is required" }); return; }
  try {
    const result = await validateSetupToken(token);
    if (!result) { response.status(410).json({ success: false, message: "This invitation link is invalid, expired, or has already been used" }); return; }
    response.json({ success: true, data: { name: result.name, email: result.email } });
  } catch (error) {
    console.error(`Setup token validation failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to verify this invitation right now" });
  }
});

router.post("/setup-account", async (request, response) => {
  const token = typeof request.body?.token === "string" ? request.body.token : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  const confirmPassword = typeof request.body?.confirmPassword === "string" ? request.body.confirmPassword : "";
  if (!token) { response.status(400).json({ success: false, message: "A setup token is required" }); return; }
  if (password !== confirmPassword) { response.status(400).json({ success: false, message: "Passwords do not match" }); return; }
  const strengthError = passwordError(password);
  if (strengthError) { response.status(400).json({ success: false, message: strengthError }); return; }

  try {
    const result = await validateSetupToken(token);
    if (!result) { response.status(410).json({ success: false, message: "This invitation link is invalid, expired, or has already been used" }); return; }

    const passwordHash = await hashPassword(password);
    await pool.execute("UPDATE users SET password_hash=?, status='Active' WHERE id=?", [passwordHash, result.userId]);
    await consumeSetupToken(result.tokenId);

    const [roleRows] = await pool.query<RowDataPacket[]>(
      "SELECT r.slug FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=?",
      [result.userId],
    );
    const roleSlugs = roleRows.map((row) => row.slug as string);

    if (roleSlugs.includes("event-organizer")) {
      const status = await organizerApprovalStatus(result.userId);
      if (status !== "Active") {
        response.json({ success: true, pending: true, message: `Your password has been created. ${organizerApprovalMessage(status)}`, data: { redirectTo: null } });
        return;
      }
    }

    let redirectTo = "/login";
    let roleName = formatRoleName(roleSlugs[0] ?? "");
    if (roleSlugs.includes("system-administrator")) {
      const sessionToken = await createAdminSession(result.userId, request.ip, request.get("user-agent"));
      response.cookie(adminSessionCookieName, sessionToken, sessionCookieOptions(adminSessionMaxAgeMs));
      redirectTo = "/admin";
      roleName = formatRoleName("system-administrator");
    } else {
      const sessionToken = await createUserSession(result.userId, request.ip, request.get("user-agent"));
      response.cookie(userSessionCookieName, sessionToken, sessionCookieOptions(userSessionMaxAgeMs));
      redirectTo = roleSlugs.includes("event-organizer") ? "/organizer" : roleSlugs.includes("event-staff") ? "/staff" : roleSlugs.includes("attendee") ? "/attendee" : "/login";
    }

    response.json({ success: true, message: "Your password has been created.", data: { redirectTo } });
    claimFirstLoginWelcome(result.userId).then((isFirst) => {
      if (isFirst) void sendWelcomeEmail({ to: result.email, name: result.name, roleName }).catch((error) => console.error(`Welcome email failed (${databaseErrorCode(error)})`));
    }).catch((error) => console.error(`First-login check failed (${databaseErrorCode(error)})`));
  } catch (error) {
    console.error(`Account setup failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to complete account setup right now" });
  }
});

export default router;
