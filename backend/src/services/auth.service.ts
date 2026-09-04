import { createHash, randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database";
import { verifyPassword } from "../utils/password";

const sessionHours = 12;
function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

interface AccountRow extends RowDataPacket { userId: number; username: string | null; passwordHash?: string; firstName: string; lastName: string | null; email: string; roles: string; organizerId: number | null; organization: string | null; attendeeId: number | null; }
export interface UserIdentity { id: number; username: string | null; name: string; email: string; roles: string[]; organizerId: number | null; organization: string | null; attendeeId: number | null; }
function identity(row: AccountRow): UserIdentity { return { id: row.userId, username: row.username, name: [row.firstName,row.lastName].filter(Boolean).join(" "), email: row.email, roles: row.roles.split(",").filter(Boolean), organizerId: row.organizerId, organization: row.organization, attendeeId: row.attendeeId }; }

const identitySelect = `SELECT u.id AS userId,u.username,u.password_hash AS passwordHash,p.first_name AS firstName,p.last_name AS lastName,p.email,
  GROUP_CONCAT(DISTINCT r.slug ORDER BY r.slug) AS roles,o.id AS organizerId,o.organization,att.id AS attendeeId
  FROM users u JOIN people p ON p.id=u.person_id JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id AND r.is_active=TRUE
  LEFT JOIN organizers o ON o.user_id=u.id AND o.deleted_at IS NULL AND o.status='Active'
  LEFT JOIN attendees att ON att.person_id=p.id AND att.deleted_at IS NULL`;

export async function authenticateUser(identifier: string, password: string): Promise<UserIdentity | null> {
  const [rows] = await pool.query<AccountRow[]>(`${identitySelect} WHERE (LOWER(p.email)=LOWER(?) OR LOWER(u.username)=LOWER(?)) AND u.status='Active' AND u.deleted_at IS NULL GROUP BY u.id,p.id,o.id,att.id LIMIT 1`, [identifier,identifier]);
  const account=rows[0]; if(!account?.passwordHash || !(await verifyPassword(password,account.passwordHash))) return null; return identity(account);
}
export async function createUserSession(userId:number,ipAddress?:string,userAgent?:string){const token=randomBytes(32).toString("hex");const expires=new Date(Date.now()+sessionHours*3600000);await pool.execute<ResultSetHeader>("INSERT INTO auth_sessions(user_id,token_hash,expires_at,ip_address,user_agent)VALUES(?,?,?,?,?)",[userId,hashToken(token),expires,ipAddress??null,userAgent?.slice(0,500)??null]);return token;}
export async function getUserSession(token:string):Promise<UserIdentity|null>{const[rows]=await pool.query<AccountRow[]>(`${identitySelect} JOIN auth_sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>CURRENT_TIMESTAMP AND u.status='Active' AND u.deleted_at IS NULL GROUP BY u.id,p.id,o.id,att.id LIMIT 1`,[hashToken(token)]);const account=rows[0];if(!account)return null;await pool.execute("UPDATE auth_sessions SET last_used_at=CURRENT_TIMESTAMP WHERE token_hash=?",[hashToken(token)]);return identity(account);}
export async function revokeUserSession(token:string){await pool.execute("UPDATE auth_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE token_hash=? AND revoked_at IS NULL",[hashToken(token)]);}
export const userSessionMaxAgeMs=sessionHours*3600000;
