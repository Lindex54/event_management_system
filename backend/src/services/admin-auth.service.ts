import { createHash, randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { pool } from "../config/database";
import { verifyPassword } from "../utils/password";

const sessionHours = 8;

interface AdminAccountRow extends RowDataPacket {
  id: number;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string | null;
}

interface AdminSessionRow extends RowDataPacket {
  userId: number;
  username: string;
  firstName: string;
  lastName: string | null;
}

export interface AdminIdentity {
  id: number;
  username: string;
  name: string;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function identity(row: AdminAccountRow | AdminSessionRow): AdminIdentity {
  return {
    id: "userId" in row ? row.userId : row.id,
    username: row.username,
    name: [row.firstName, row.lastName].filter(Boolean).join(" "),
  };
}

export async function authenticateAdministrator(username: string, password: string): Promise<AdminIdentity | null> {
  const [rows] = await pool.query<AdminAccountRow[]>(
    `SELECT u.id, u.username, u.password_hash AS passwordHash,
            p.first_name AS firstName, p.last_name AS lastName
       FROM users AS u
       JOIN people AS p ON p.id = u.person_id
       JOIN user_roles AS ur ON ur.user_id = u.id
       JOIN roles AS r ON r.id = ur.role_id
      WHERE u.username = ?
        AND u.status = 'Active'
        AND u.deleted_at IS NULL
        AND r.name = 'System Administrator'
      LIMIT 1`,
    [username],
  );
  const account = rows[0];
  if (!account || !(await verifyPassword(password, account.passwordHash))) return null;
  return identity(account);
}

export async function createAdminSession(userId: number, ipAddress?: string, userAgent?: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionHours * 60 * 60 * 1000);
  await pool.execute<ResultSetHeader>(
    "INSERT INTO auth_sessions (user_id, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
    [userId, tokenHash(token), expiresAt, ipAddress ?? null, userAgent?.slice(0, 500) ?? null],
  );
  return token;
}

export async function getAdminSession(token: string): Promise<AdminIdentity | null> {
  const [rows] = await pool.query<AdminSessionRow[]>(
    `SELECT u.id AS userId, u.username, p.first_name AS firstName, p.last_name AS lastName
       FROM auth_sessions AS s
       JOIN users AS u ON u.id = s.user_id
       JOIN people AS p ON p.id = u.person_id
       JOIN user_roles AS ur ON ur.user_id = u.id
       JOIN roles AS r ON r.id = ur.role_id
      WHERE s.token_hash = ?
        AND s.revoked_at IS NULL
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.status = 'Active'
        AND u.deleted_at IS NULL
        AND r.name = 'System Administrator'
      LIMIT 1`,
    [tokenHash(token)],
  );
  const session = rows[0];
  if (!session) return null;
  await pool.execute("UPDATE auth_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE token_hash = ?", [tokenHash(token)]);
  return identity(session);
}

export async function revokeAdminSession(token: string): Promise<void> {
  await pool.execute(
    "UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND revoked_at IS NULL",
    [tokenHash(token)],
  );
}

export const adminSessionMaxAgeMs = sessionHours * 60 * 60 * 1000;
