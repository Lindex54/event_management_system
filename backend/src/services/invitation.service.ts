import { createHash, randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../config/database";
import { sendEmail } from "./mail.service";

const setupTokenValidHours = 24;
const passwordResetValidHours = 24;
const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSetupToken(userId: number, createdByUserId: number | null): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + setupTokenValidHours * 60 * 60 * 1000);
  await pool.execute<ResultSetHeader>(
    "INSERT INTO account_setup_tokens (user_id, token_hash, created_by_user_id, expires_at) VALUES (?, ?, ?, ?)",
    [userId, tokenHash(token), createdByUserId, expiresAt],
  );
  return token;
}

interface SetupTokenRow extends RowDataPacket {
  tokenId: number;
  userId: number;
  firstName: string;
  lastName: string | null;
  email: string;
}

export async function validateSetupToken(token: string): Promise<{ tokenId: number; userId: number; name: string; email: string } | null> {
  const [rows] = await pool.query<SetupTokenRow[]>(
    `SELECT t.id AS tokenId, t.user_id AS userId, p.first_name AS firstName, p.last_name AS lastName, p.email
       FROM account_setup_tokens t
       JOIN users u ON u.id = t.user_id
       JOIN people p ON p.id = u.person_id
      WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP AND u.deleted_at IS NULL
      LIMIT 1`,
    [tokenHash(token)],
  );
  const row = rows[0];
  if (!row) return null;
  return { tokenId: row.tokenId, userId: row.userId, name: [row.firstName, row.lastName].filter(Boolean).join(" "), email: row.email };
}

export async function consumeSetupToken(tokenId: number): Promise<void> {
  await pool.execute("UPDATE account_setup_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", [tokenId]);
}

export async function createPasswordResetToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + passwordResetValidHours * 60 * 60 * 1000);
  await pool.execute<ResultSetHeader>(
    "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash(token), expiresAt],
  );
  return token;
}

interface PasswordResetTokenRow extends RowDataPacket {
  tokenId: number;
  userId: number;
  firstName: string;
  lastName: string | null;
  email: string;
}

export async function validatePasswordResetToken(token: string): Promise<{ tokenId: number; userId: number; name: string; email: string } | null> {
  const [rows] = await pool.query<PasswordResetTokenRow[]>(
    `SELECT t.id AS tokenId, t.user_id AS userId, p.first_name AS firstName, p.last_name AS lastName, p.email
       FROM password_reset_tokens t
       JOIN users u ON u.id = t.user_id
       JOIN people p ON p.id = u.person_id
      WHERE t.token_hash = ? AND t.used_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP AND u.status = 'Active' AND u.deleted_at IS NULL
      LIMIT 1`,
    [tokenHash(token)],
  );
  const row = rows[0];
  if (!row) return null;
  return { tokenId: row.tokenId, userId: row.userId, name: [row.firstName, row.lastName].filter(Boolean).join(" "), email: row.email };
}

export async function consumePasswordResetToken(tokenId: number): Promise<void> {
  await pool.execute("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?", [tokenId]);
}

export async function sendPasswordResetEmail(opts: { to: string; name: string; token: string }): Promise<void> {
  const link = `${frontendUrl}/reset-password?token=${opts.token}`;
  await sendEmail({
    to: opts.to,
    subject: "Reset your Evently password",
    text: `Hi ${opts.name}, we received a request to reset your Evently password. Reset it here: ${link} (this link expires in ${passwordResetValidHours} hours and can only be used once). If you didn't request this, you can ignore this email.`,
    html: emailShell("Reset your password", `
      <p>Hi ${opts.name},</p>
      <p>We received a request to reset your Evently password. Click below to choose a new one.</p>
      <p style="margin:24px 0"><a href="${link}" style="background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Reset Password</a></p>
      <p style="font-size:13px;color:#6b7280">This link expires in ${passwordResetValidHours} hours and can only be used once. If the button doesn't work, copy this link into your browser:<br>${link}</p>
      <p style="font-size:13px;color:#6b7280">If you didn't request this, you can safely ignore this email — your password will not be changed.</p>
    `),
  });
}

export async function organizerApprovalStatus(userId: number): Promise<string | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT status FROM organizers WHERE user_id=? LIMIT 1", [userId]);
  return rows[0]?.status ?? null;
}

export function organizerApprovalMessage(status: string | null): string {
  if (status === "Suspended") return "Your organizer account has been suspended. Contact an administrator for help.";
  return "Your organizer account is awaiting administrator approval. You'll be notified once it's approved.";
}

function emailShell(title: string, bodyHtml: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111827">
    <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#6b7280">Evently &middot; Event Management System</p>
  </div>`;
}

export async function sendInvitationEmail(opts: { to: string; name: string; roleName: string; token: string }): Promise<void> {
  const link = `${frontendUrl}/setup-account?token=${opts.token}`;
  await sendEmail({
    to: opts.to,
    subject: "You've been added to Evently — set up your account",
    text: `Hi ${opts.name}, a ${opts.roleName} account has been created for you on Evently. Set your password here: ${link} (this link expires in ${setupTokenValidHours} hours).`,
    html: emailShell("You've been invited to Evently", `
      <p>Hi ${opts.name},</p>
      <p>A <strong>${opts.roleName}</strong> account has been created for you on Evently. Click below to set your password and activate your account.</p>
      <p style="margin:24px 0"><a href="${link}" style="background:#2563eb;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Set Your Password</a></p>
      <p style="font-size:13px;color:#6b7280">This link expires in ${setupTokenValidHours} hours and can only be used once. If the button doesn't work, copy this link into your browser:<br>${link}</p>
    `),
  });
}

const roleLabels: Record<string, string> = {
  "system-administrator": "System Administrator",
  "event-organizer": "Event Organizer",
  "event-staff": "Event Staff",
  attendee: "Attendee",
};

export function formatRoleName(slug: string): string {
  return roleLabels[slug] ?? slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export async function claimFirstLoginWelcome(userId: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE users SET welcome_email_sent_at=CURRENT_TIMESTAMP WHERE id=? AND welcome_email_sent_at IS NULL",
    [userId],
  );
  return result.affectedRows > 0;
}

export async function sendWelcomeEmail(opts: { to: string; name: string; roleName: string }): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "Welcome to Evently",
    text: `Hi ${opts.name}, welcome to Evently! Your ${opts.roleName} account is ready to use.`,
    html: emailShell("Welcome to Evently", `
      <p>Hi ${opts.name},</p>
      <p>Welcome to Evently! Your <strong>${opts.roleName}</strong> account is now active and ready to use.</p>
    `),
  });
}
