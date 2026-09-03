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

export default router;
