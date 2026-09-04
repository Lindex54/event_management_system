import "dotenv/config";
import type { RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, pool, testDatabaseConnection } from "../config/database";

async function columnExists(table: string, column: string) {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?", [table, column]);
  return rows.length > 0;
}

async function indexExists(table: string, index: string) {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND INDEX_NAME=?", [table, index]);
  return rows.length > 0;
}

async function setup() {
  try {
    const database = await testDatabaseConnection();
    if (!(await columnExists("registrations", "ticket_token"))) await pool.query("ALTER TABLE registrations ADD COLUMN ticket_token CHAR(64) NULL DEFAULT NULL AFTER reference_code");
    if (!(await indexExists("registrations", "uq_registrations_ticket_token"))) await pool.query("CREATE UNIQUE INDEX uq_registrations_ticket_token ON registrations(ticket_token)");
    await pool.query("UPDATE registrations SET ticket_token=REPLACE(CONCAT(UUID(),UUID()),'-','') WHERE ticket_token IS NULL");
    await pool.query("ALTER TABLE registrations MODIFY COLUMN ticket_token CHAR(64) NOT NULL");
    console.log(`Participant journey schema verified in ${database}`);
  } catch (error) {
    console.error(`Participant journey schema setup failed (${databaseErrorCode(error)})`);
    process.exitCode = 1;
  } finally { await pool.end(); }
}

void setup();
