import type { Request, RequestHandler, Response } from "express";
import { databaseErrorCode } from "../../config/database";
import * as service from "../../services/staff/staff.service";
import { eventInput, registrationStatuses, scheduleInput } from "../organizer/organizer.controller";
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

export const updateEvent: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id), input = eventInput(req.body);
  if (!id || !input) { res.status(400).json({ success: false, message: "Valid event details are required" }); return; }
  try {
    if (!(await service.updateEvent(staff(res).userId, id, input))) { res.status(404).json({ success: false, message: "Event not found or not assigned to you" }); return; }
    res.json({ success: true, message: "Event updated successfully" });
  } catch (error) { fail(res, error, "Update event"); }
};

export const updateRegistration: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id), status = text(req.body?.status);
  if (!id || !registrationStatuses.has(status)) { res.status(400).json({ success: false, message: "Valid registration status is required" }); return; }
  try {
    if (!(await service.updateRegistrationStatus(staff(res).userId, id, status))) { res.status(404).json({ success: false, message: "Registration not found or not assigned to you" }); return; }
    res.json({ success: true, message: "Registration updated" });
  } catch (error) { fail(res, error, "Update registration"); }
};

export const createSchedule: RequestHandler = async (req, res) => {
  const input = scheduleInput(req.body);
  if (!input) { res.status(400).json({ success: false, message: "Valid event, title, date, and time range are required" }); return; }
  try {
    const id = await service.createSchedule(staff(res).userId, input);
    if (!id) { res.status(403).json({ success: false, message: "You are not assigned to this event" }); return; }
    res.status(201).json({ success: true, message: "Schedule item created", data: { id } });
  } catch (error) {
    if (error instanceof Error && error.message === "SPEAKER_NOT_ASSIGNED") { res.status(400).json({ success: false, message: "Speaker must be assigned to the selected event" }); return; }
    fail(res, error, "Create schedule item");
  }
};

export const updateSchedule: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id), input = scheduleInput(req.body);
  if (!id || !input) { res.status(400).json({ success: false, message: "Valid schedule details are required" }); return; }
  try {
    if (!(await service.updateSchedule(staff(res).userId, id, input))) { res.status(404).json({ success: false, message: "Schedule item not found or not assigned to you" }); return; }
    res.json({ success: true, message: "Schedule item updated" });
  } catch (error) { fail(res, error, "Update schedule item"); }
};

export const deleteSchedule: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) { res.status(400).json({ success: false, message: "Valid schedule item ID is required" }); return; }
  try {
    if (!(await service.deleteSchedule(staff(res).userId, id))) { res.status(404).json({ success: false, message: "Schedule item not found or not assigned to you" }); return; }
    res.json({ success: true, message: "Schedule item removed" });
  } catch (error) { fail(res, error, "Remove schedule item"); }
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

export const verifyTicket: RequestHandler = async (req, res) => {
  const eventId = positiveInteger(req.body?.eventId);
  const rawTicket = text(req.body?.ticketToken);
  const ticketToken = rawTicket.split(/[/?#]/).filter(Boolean).pop() ?? "";
  if (!eventId || !/^[a-f0-9]{64}$/i.test(ticketToken)) { res.status(400).json({ success: false, message: "Select an event and scan or enter a valid ticket", data: { result: "INVALID_TICKET" } }); return; }
  try {
    const outcome = await service.verifyTicket(staff(res).userId, eventId, ticketToken);
    const messages = { VALID: "Valid ticket", ALREADY_CHECKED_IN: "Attendee was already checked in", CANCELLED: "Registration was cancelled", NOT_CONFIRMED: "Registration is not confirmed", INVALID_TICKET: "Invalid ticket", EVENT_MISMATCH: "Ticket belongs to a different event", NOT_ASSIGNED: "You are not assigned to this event" } as const;
    const status = outcome.result === "NOT_ASSIGNED" ? 403 : ["INVALID_TICKET", "EVENT_MISMATCH"].includes(outcome.result) ? 404 : 200;
    res.status(status).json({ success: status === 200, message: messages[outcome.result], data: outcome });
  } catch (error) { fail(res, error, "Verify ticket"); }
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

export const listVenues: RequestHandler = async (_req, res) => {
  try { res.json({ success: true, data: await service.listVenues() }); }
  catch (error) { fail(res, error, "List venues"); }
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
