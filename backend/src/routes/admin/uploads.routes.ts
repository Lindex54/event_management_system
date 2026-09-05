import { randomBytes } from "node:crypto";
import { Router } from "express";
import type { RequestHandler } from "express";
import type { ResultSetHeader } from "mysql2/promise";

import { databaseErrorCode, databaseErrorSqlMessage, pool } from "../../config/database";
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

async function storeFile(category:"EventImage"|"EventAgenda",originalName:string,mimeType:string,data:Buffer):Promise<string>{
  const storageKey=randomBytes(24).toString("hex");
  await pool.execute<ResultSetHeader>("INSERT INTO uploaded_files(storage_key,category,original_name,mime_type,file_size,file_data)VALUES(?,?,?,?,?,?)",[storageKey,category,originalName,mimeType,data.length,data]);
  return `/api/files/${storageKey}`;
}

function logUploadError(action:string,error:unknown){
  const code=databaseErrorCode(error),sqlMessage=databaseErrorSqlMessage(error);
  console.error(`${action} failed (${code})${sqlMessage?`: ${sqlMessage}`:""}`);
}

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
    const originalName=typeof request.body?.originalName==="string"?request.body.originalName.slice(0,255):"";
    const imageUrl=await storeFile("EventImage",originalName||`event-image.${extension}`,match[1]!,image);
    response.status(201).json({ success: true, message: "Event image uploaded", data: { imageUrl } });
  } catch (error) {
    logUploadError("Event image upload",error);
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
    const agendaFileName=originalName||`event-agenda.${extension}`;
    const agendaUrl=await storeFile("EventAgenda",agendaFileName,mimeType,file);
    response.status(201).json({ success: true, message: "Agenda file uploaded", data: { agendaUrl, agendaFileType: mimeType, agendaFileName } });
  } catch (error) {
    logUploadError("Agenda upload",error);
    response.status(500).json({ success: false, message: "Unable to save the agenda file" });
  }
};

router.post("/event-agenda", uploadEventAgenda);

export default router;
