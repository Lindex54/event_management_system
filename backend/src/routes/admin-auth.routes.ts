import { Router } from "express";

import { databaseErrorCode } from "../config/database";
import {
  adminSessionMaxAgeMs,
  authenticateAdministrator,
  createAdminSession,
  getAdminSession,
  revokeAdminSession,
} from "../services/admin-auth.service";
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
    const administrator = await authenticateAdministrator(username, password);
    if (!administrator) {
      response.status(401).json({ success: false, message: "Invalid administrator credentials" });
      return;
    }
    const token = await createAdminSession(administrator.id, request.ip, request.get("user-agent"));
    response.cookie(adminSessionCookieName, token, sessionCookieOptions(adminSessionMaxAgeMs));
    response.json({ success: true, message: "Administrator signed in", user: administrator });
  } catch (error) {
    console.error(`Administrator login failed (${databaseErrorCode(error)})`);
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
