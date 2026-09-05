import type { Response } from "express";

import { databaseErrorCode, databaseErrorSqlMessage } from "../config/database";

export function positiveId(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function optionalText(value: unknown): string | null {
  const parsed = text(value);
  return parsed || null;
}

export function positiveInteger(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function sendDatabaseError(response: Response, error: unknown, action: string): void {
  const code = databaseErrorCode(error);
  const sqlMessage = databaseErrorSqlMessage(error);
  console.error(`${action} failed (${code})${sqlMessage ? `: ${sqlMessage}` : ""}`);
  if (code === "ER_DUP_ENTRY") {
    response.status(409).json({ success: false, message: "A record with those unique details already exists" });
    return;
  }
  if (code === "ER_NO_REFERENCED_ROW_2" || code === "ER_ROW_IS_REFERENCED_2") {
    response.status(409).json({ success: false, message: "The record is linked to other data and cannot be changed that way" });
    return;
  }
  response.status(500).json({ success: false, message: `Unable to ${action.toLowerCase()}` });
}
