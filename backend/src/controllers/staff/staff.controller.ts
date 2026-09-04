import type { Request, RequestHandler, Response } from "express";
import { databaseErrorCode } from "../../config/database";
import * as service from "../../services/staff/staff.service";
import { optionalText, positiveId, positiveInteger, text } from "../../utils/request";

function staff(response: Response): { userId: number; name: string; email: string } {
  return response.locals.staff as { userId: number; name: string; email: string };
}

function fail(response: Response, error: unknown, action: string): void {
  console.error(`${action} failed (${databaseErrorCode(error)})`);
  response.status(500).json({ success: false, message: `Unable to ${action.toLowerCase()}` });
}

export const getDashboard: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.dashboard(staff(res).userId) }); }
  catch (error) { fail(res, error, "Load dashboard"); }
};

export const listEvents: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.listEvents(staff(res).userId) }); }
  catch (error) { fail(res, error, "List assigned events"); }
};

export const getEvent: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(400).json({ success: false, message: "Valid event ID is required" }); return; }
  try {
    const data = await service.getEvent(staff(res).userId, id);
    if (!data) { res.status(404).json({ success: false, message: "Event not found or not assigned to you" }); return; }
    res.json({ success: true, data });
  } catch (error) { fail(res, error, "Load event"); }
};

export const listEventAttendees: RequestHandler = async (req: Request, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(400).json({ success: false, message: "Valid event ID is required" }); return; }
  try {
    if (!(await service.isAssigned(staff(res).userId, id))) {
      res.status(403).json({ success: false, message: "You are not assigned to this event" });
      return;
    }
    res.json({ success: true, data: await service.listAttendees(staff(res).userId, id) });
  } catch (error) { fail(res, error, "List event attendees"); }
};

export const listAttendees: RequestHandler = async (req, res) => {
  const eventId = req.query.eventId ? (positiveInteger(req.query.eventId) ?? undefined) : undefined;
  if (req.query.eventId && !eventId) { res.status(400).json({ success: false, message: "Valid event ID is required" }); return; }
  try { res.json({ success: true, data: await service.listAttendees(staff(res).userId, eventId) }); }
  catch (error) { fail(res, error, "List attendees"); }
};

export const searchCheckIn: RequestHandler = async (req, res) => {
  const eventId = positiveInteger(req.query.eventId);
  const query = text(req.query.q);
  if (!eventId || !query) { res.status(400).json({ success: false, message: "Event and search text are required" }); return; }
  try {
    const results = await service.searchAttendees(staff(res).userId, eventId, query);
    if (results === null) { res.status(403).json({ success: false, message: "You are not assigned to this event" }); return; }
    res.json({ success: true, data: results });
  } catch (error) { fail(res, error, "Search attendees"); }
};

const checkInMessages: Record<string, { status: number; message: string }> = {
  CHECKED_IN: { status: 200, message: "Attendee checked in successfully" },
  ALREADY_CHECKED_IN: { status: 200, message: "Attendee was already checked in" },
  NOT_FOUND: { status: 404, message: "Registration not found" },
  CANCELLED: { status: 409, message: "Registration was cancelled" },
  NOT_CONFIRMED: { status: 409, message: "Registration is not confirmed" },
};

export const checkIn: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(400).json({ success: false, message: "Valid registration ID is required" }); return; }
  try {
    const result = await service.checkInRegistration(staff(res).userId, id);
    const outcome = checkInMessages[result]!;
    res.status(outcome.status).json({ success: result === "CHECKED_IN" || result === "ALREADY_CHECKED_IN", message: outcome.message, data: { result } });
  } catch (error) { fail(res, error, "Check in attendee"); }
};

export const listSchedule: RequestHandler = async (req, res) => {
  const eventId = req.query.eventId ? (positiveInteger(req.query.eventId) ?? undefined) : undefined;
  if (req.query.eventId && !eventId) { res.status(400).json({ success: false, message: "Valid event ID is required" }); return; }
  try { res.json({ success: true, data: await service.listSchedule(staff(res).userId, eventId) }); }
  catch (error) { fail(res, error, "List schedule"); }
};

export const listNotifications: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.notifications(staff(res).userId) }); }
  catch (error) { fail(res, error, "List notifications"); }
};

export const readNotification: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(400).json({ success: false, message: "Valid notification ID is required" }); return; }
  try {
    if (!(await service.markNotification(staff(res).userId, id))) { res.status(404).json({ success: false, message: "Notification not found" }); return; }
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) { fail(res, error, "Update notification"); }
};

export const readAllNotifications: RequestHandler = async (_req, res) => {
  try { await service.markAllNotifications(staff(res).userId); res.json({ success: true, message: "All notifications marked as read" }); }
  catch (error) { fail(res, error, "Update notifications"); }
};

export const getProfile: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.getProfile(staff(res).userId) }); }
  catch (error) { fail(res, error, "Load profile"); }
};

export const updateProfile: RequestHandler = async (req, res) => {
  const firstName = text(req.body?.firstName);
  if (!firstName) { res.status(400).json({ success: false, message: "First name is required" }); return; }
  try {
    await service.updateProfile(staff(res).userId, { firstName, lastName: optionalText(req.body?.lastName), telephone: optionalText(req.body?.telephone) });
    res.json({ success: true, message: "Profile updated" });
  } catch (error) { fail(res, error, "Update profile"); }
};
