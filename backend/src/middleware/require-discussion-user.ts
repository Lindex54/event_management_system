import type { RequestHandler } from "express";

import { databaseErrorCode } from "../config/database";
import { getAdminSession } from "../services/admin-auth.service";
import { getUserSession } from "../services/auth.service";
import { adminSessionCookieName, readCookie, userSessionCookieName } from "../utils/cookies";

export interface DiscussionIdentity {
  userId: number;
  name: string;
  email: string;
  roles: string[];
  organizerId: number | null;
  attendeeId: number | null;
  isAdministrator: boolean;
}

export const requireDiscussionUser: RequestHandler = async (request, response, next) => {
  try {
    const adminToken = readCookie(request.headers.cookie, adminSessionCookieName);
    if (adminToken) {
      const admin = await getAdminSession(adminToken);
      if (admin) {
        response.locals.discussionUser = { userId: admin.id, name: admin.name, email: admin.email, roles: ["system-administrator"], organizerId: null, attendeeId: null, isAdministrator: true } satisfies DiscussionIdentity;
        next();
        return;
      }
    }
    const token = readCookie(request.headers.cookie, userSessionCookieName);
    const user = token ? await getUserSession(token) : null;
    if (!user) {
      response.status(401).json({ success: false, message: "Sign in is required to access event discussions" });
      return;
    }
    response.locals.discussionUser = { userId: user.id, name: user.name, email: user.email, roles: user.roles, organizerId: user.organizerId, attendeeId: user.attendeeId, isAdministrator: false } satisfies DiscussionIdentity;
    next();
  } catch (error) {
    console.error(`Discussion authorization failed (${databaseErrorCode(error)})`);
    response.status(503).json({ success: false, message: "Unable to verify discussion access" });
  }
};
