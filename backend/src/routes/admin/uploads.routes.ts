import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import type { RequestHandler } from "express";

import { requireAdmin } from "../../middleware/require-admin";

const router = Router();
router.use(requireAdmin);

const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);
const maximumImageBytes = 5 * 1024 * 1024;

export const uploadEventImage: RequestHandler = async (request, response) => {
  const dataUrl = typeof request.body?.dataUrl === "string" ? request.body.dataUrl : "";
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  const extension = match ? imageTypes.get(match[1] ?? "") : undefined;
  if (!match || !extension) {
    response.status(400).json({ success: false, message: "Choose a JPG, PNG, WebP, or GIF image" });
    return;
  }

  const image = Buffer.from(match[2] ?? "", "base64");
  if (!image.length || image.length > maximumImageBytes) {
    response.status(400).json({ success: false, message: "The event image must be smaller than 5 MB" });
    return;
  }

  try {
    const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
    const directory = path.resolve(process.cwd(), "uploads", "events");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, fileName), image, { flag: "wx" });
    const imageUrl = `${request.protocol}://${request.get("host")}/uploads/events/${fileName}`;
    response.status(201).json({ success: true, message: "Event image uploaded", data: { imageUrl } });
  } catch (error) {
    console.error("Event image upload failed", error);
    response.status(500).json({ success: false, message: "Unable to save the event image" });
  }
};

router.post("/event-image", uploadEventImage);

const agendaTypes = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maximumAgendaBytes = 5 * 1024 * 1024;

export const uploadEventAgenda: RequestHandler = async (request, response) => {
  const dataUrl = typeof request.body?.dataUrl === "string" ? request.body.dataUrl : "";
  const originalName = typeof request.body?.originalName === "string" ? request.body.originalName.slice(0, 255) : "";
  const match = /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  const mimeType = match?.[1] ?? "";
  const extension = match ? agendaTypes.get(mimeType) : undefined;
  if (!match || !extension) {
    response.status(400).json({ success: false, message: "Choose a PDF, JPG, PNG, or WebP file for the agenda" });
    return;
  }

  const file = Buffer.from(match[2] ?? "", "base64");
  if (!file.length || file.length > maximumAgendaBytes) {
    response.status(400).json({ success: false, message: "The agenda file must be smaller than 5 MB" });
    return;
  }

  try {
    const fileName = `${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
    const directory = path.resolve(process.cwd(), "uploads", "agendas");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, fileName), file, { flag: "wx" });
    const agendaUrl = `${request.protocol}://${request.get("host")}/uploads/agendas/${fileName}`;
    response.status(201).json({ success: true, message: "Agenda file uploaded", data: { agendaUrl, agendaFileType: mimeType, agendaFileName: originalName || fileName } });
  } catch (error) {
    console.error("Agenda upload failed", error);
    response.status(500).json({ success: false, message: "Unable to save the agenda file" });
  }
};

router.post("/event-agenda", uploadEventAgenda);

export default router;
