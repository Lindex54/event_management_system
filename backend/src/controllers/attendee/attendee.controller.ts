import type { RequestHandler, Response } from "express";
import { databaseErrorCode } from "../../config/database";
import * as service from "../../services/attendee/attendee.service";
import { optionalText, positiveId, positiveInteger, text } from "../../utils/request";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function attendee(response: Response): { userId: number; attendeeId: number; name: string; email: string } {
  return response.locals.attendee as { userId: number; attendeeId: number; name: string; email: string };
}

function fail(response: Response, error: unknown, action: string): void {
  console.error(`${action} failed (${databaseErrorCode(error)})`);
  response.status(500).json({ success: false, message: `Unable to ${action.toLowerCase()}` });
}

export const getDashboard: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.dashboard(attendee(res).attendeeId) }); }
  catch (error) { fail(res, error, "Load dashboard"); }
};

export const listEvents: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.listEvents(attendee(res).attendeeId) }); }
  catch (error) { fail(res, error, "List events"); }
};

export const listAvailableEvents: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.availableEvents(attendee(res).attendeeId) }); }
  catch (error) { fail(res, error, "List available events"); }
};

export const listRegistrations: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.listRegistrations(attendee(res).attendeeId) }); }
  catch (error) { fail(res, error, "List registrations"); }
};

export const cancelRegistration: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(400).json({ success: false, message: "Valid registration ID is required" }); return; }
  try {
    if (!(await service.cancelRegistration(attendee(res).attendeeId, id))) {
      res.status(404).json({ success: false, message: "Registration not found or already cancelled" });
      return;
    }
    res.json({ success: true, message: "Registration cancelled" });
  } catch (error) { fail(res, error, "Cancel registration"); }
};

const registerMessages: Record<string, { status: number; message: string }> = {
  REGISTERED: { status: 201, message: "You are registered for this event" },
  EVENT_NOT_FOUND: { status: 404, message: "Event not found" },
  REGISTRATION_CLOSED: { status: 409, message: "Registration is closed for this event" },
  ALREADY_REGISTERED: { status: 409, message: "You are already registered for this event" },
  EVENT_FULL: { status: 409, message: "This event has reached capacity" },
};

export const registerForEvent: RequestHandler = async (req, res) => {
  const eventId = positiveId(req.params.id);
  if (!eventId) { res.status(400).json({ success: false, message: "Valid event ID is required" }); return; }
  try {
    const result = await service.registerForEvent(attendee(res).attendeeId, eventId);
    const outcome = registerMessages[result]!;
    res.status(outcome.status).json({ success: result === "REGISTERED", message: outcome.message, data: { result } });
  } catch (error) { fail(res, error, "Register for event"); }
};

export const listTickets: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.tickets(attendee(res).attendeeId) }); }
  catch (error) { fail(res, error, "List tickets"); }
};

export const listNotifications: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.notifications(attendee(res).userId) }); }
  catch (error) { fail(res, error, "List notifications"); }
};

export const readNotification: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(400).json({ success: false, message: "Valid notification ID is required" }); return; }
  try {
    if (!(await service.markNotification(attendee(res).userId, id))) { res.status(404).json({ success: false, message: "Notification not found" }); return; }
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) { fail(res, error, "Update notification"); }
};

export const readAllNotifications: RequestHandler = async (_req, res) => {
  try { await service.markAllNotifications(attendee(res).userId); res.json({ success: true, message: "All notifications marked as read" }); }
  catch (error) { fail(res, error, "Update notifications"); }
};

export const getProfile: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.getProfile(attendee(res).userId) }); }
  catch (error) { fail(res, error, "Load profile"); }
};

export const updateProfile: RequestHandler = async (req, res) => {
  const firstName = text(req.body?.firstName);
  const email = text(req.body?.email).toLowerCase();
  if (!firstName || !emailPattern.test(email)) { res.status(400).json({ success: false, message: "Valid first name and email are required" }); return; }
  try {
    await service.updateProfile(attendee(res).userId, { firstName, lastName: optionalText(req.body?.lastName), email, telephone: optionalText(req.body?.telephone) });
    res.json({ success: true, message: "Profile updated" });
  } catch (error) { fail(res, error, "Update profile"); }
};

void positiveInteger;
