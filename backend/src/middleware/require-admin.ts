import type { RequestHandler } from "express";

import { databaseErrorCode } from "../config/database";
import { getAdminSession } from "../services/admin-auth.service";
import { adminSessionCookieName, readCookie } from "../utils/cookies";

export const requireAdmin: RequestHandler = async (request, response, next) => {
  const token = readCookie(request.headers.cookie, adminSessionCookieName);
  if (!token) {
    response.status(401).json({ success: false, message: "Administrator session is required" });
    return;
  }
  try {
    const administrator = await getAdminSession(token);
    if (!administrator) {
      response.status(401).json({ success: false, message: "Administrator session is invalid or expired" });
      return;
    }
    response.locals.administrator = administrator;
    next();
  } catch (error) {
    console.error(`Administrator authorization failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to verify administrator session" });
  }
};
