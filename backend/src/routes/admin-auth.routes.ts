import { Router } from "express";

import { databaseErrorCode, databaseErrorSqlMessage } from "../config/database";
import {
  adminSessionMaxAgeMs,
  authenticateAdministrator,
  createAdminSession,
  getAdminSession,
  revokeAdminSession,
} from "../services/admin-auth.service";
import { claimFirstLoginWelcome, sendWelcomeEmail } from "../services/invitation.service";
import {
  adminSessionCookieName,
  clearSessionCookieOptions,
  readCookie,
  sessionCookieOptions,
} from "../utils/cookies";

const router = Router();

router.post("/login", async (request, response) => {
  const username = typeof request.body?.username === "string" ? request.body.username.trim() : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  if (!username || !password) {
    response.status(400).json({ success: false, message: "Username and password are required" });
    return;
  }

  try {
    const outcome = await authenticateAdministrator(username, password);
    if (outcome.result === "LOCKED") {
      response.status(423).json({ success: false, locked: true, message: "Too many failed attempts. Reset your password to sign in again." });
      return;
    }
    if (outcome.result === "INVALID") {
      response.status(401).json({ success: false, message: "Invalid administrator credentials" });
      return;
    }
    const administrator = outcome.admin;
    const token = await createAdminSession(administrator.id, request.ip, request.get("user-agent"));
    response.cookie(adminSessionCookieName, token, sessionCookieOptions(adminSessionMaxAgeMs));
    response.json({ success: true, message: "Administrator signed in", user: administrator });
    claimFirstLoginWelcome(administrator.id).then((isFirst) => {
      if (isFirst) void sendWelcomeEmail({ to: administrator.email, name: administrator.name, roleName: "System Administrator" }).catch((error) => console.error(`Welcome email failed (${databaseErrorCode(error)})`));
    }).catch((error) => console.error(`First-login check failed (${databaseErrorCode(error)})`));
  } catch (error) {
    const code = databaseErrorCode(error);
    const sqlMessage = code === "ER_BAD_FIELD_ERROR" ? databaseErrorSqlMessage(error) : null;
    console.error(`Administrator login failed (${code})${sqlMessage ? `: ${sqlMessage}` : ""}`);
    response.status(500).json({ success: false, message: "Unable to sign in right now" });
  }
});

router.get("/session", async (request, response) => {
  const token = readCookie(request.headers.cookie, adminSessionCookieName);
  if (!token) {
    response.status(401).json({ success: false, message: "Administrator session is required" });
    return;
  }
  try {
    const administrator = await getAdminSession(token);
    if (!administrator) {
      response.clearCookie(adminSessionCookieName, clearSessionCookieOptions());
      response.status(401).json({ success: false, message: "Administrator session is invalid or expired" });
      return;
    }
    response.json({ success: true, user: administrator });
  } catch (error) {
    console.error(`Administrator session check failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to verify administrator session" });
  }
});

router.post("/logout", async (request, response) => {
  const token = readCookie(request.headers.cookie, adminSessionCookieName);
  try {
    if (token) await revokeAdminSession(token);
  } catch (error) {
    console.error(`Administrator logout failed (${databaseErrorCode(error)})`);
  }
  response.clearCookie(adminSessionCookieName, clearSessionCookieOptions());
  response.json({ success: true, message: "Administrator signed out" });
});

export default router;
