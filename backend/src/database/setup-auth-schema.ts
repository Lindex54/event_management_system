import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, pool, testDatabaseConnection } from "../config/database";

async function setupAuthSchema(): Promise<void> {
  try {
    const databaseName = await testDatabaseConnection();
    const sqlPath = resolve(process.cwd(), "database", "auth_schema.sql");
    const sql = await readFile(sqlPath, "utf8");
    const statements = sql
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) await pool.query(statement);

    const [usernameColumns] = await pool.query<RowDataPacket[]>(
      "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'username'",
    );
    if (usernameColumns.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN username VARCHAR(100) NULL AFTER person_id");
    }

    const [usernameIndexes] = await pool.query<RowDataPacket[]>(
      "SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'uq_users_username'",
    );
    if (usernameIndexes.length === 0) {
      await pool.query("ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username)");
    }

    console.log(`Authentication schema verified in ${databaseName}`);
  } catch (error) {
    console.error(`Authentication schema setup failed (${databaseErrorCode(error)})`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void setupAuthSchema();
