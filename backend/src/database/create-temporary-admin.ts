import { randomBytes } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, pool } from "../config/database";
import { hashPassword } from "../utils/password";

interface IdRow extends RowDataPacket { id: number; }

async function createTemporaryAdministrator(): Promise<void> {
  const username = "admin";
  const password = `Evtly-${randomBytes(12).toString("base64url")}!`;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [existing] = await connection.query<IdRow[]>("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (existing.length) throw new Error("TEMP_ADMIN_EXISTS");

    const [roleRows] = await connection.query<IdRow[]>("SELECT id FROM roles WHERE name = 'System Administrator' LIMIT 1");
    const role = roleRows[0];
    if (!role) throw new Error("SYSTEM_ADMIN_ROLE_MISSING");

    const [personResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO people (first_name, last_name, email, telephone) VALUES (?, ?, ?, ?)",
      ["System", "Administrator", "admin@evently.local", null],
    );
    const passwordHash = await hashPassword(password);
    const [userResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO users (person_id, username, password_hash, status, email_verified_at) VALUES (?, ?, ?, 'Active', CURRENT_TIMESTAMP)",
      [personResult.insertId, username, passwordHash],
    );
    await connection.execute("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userResult.insertId, role.id]);
    await connection.commit();

    console.log("Temporary administrator created successfully");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    await connection.rollback();
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "TEMP_ADMIN_EXISTS") console.error("Temporary administrator already exists; no account was changed");
    else if (message === "SYSTEM_ADMIN_ROLE_MISSING") console.error("System Administrator role is missing");
    else console.error(`Temporary administrator creation failed (${databaseErrorCode(error)})`);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

void createTemporaryAdministrator();
