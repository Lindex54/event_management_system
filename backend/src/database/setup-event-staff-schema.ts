import "dotenv/config";
import type { RowDataPacket } from "mysql2/promise";
import { databaseErrorCode, pool, testDatabaseConnection } from "../config/database";

async function columnExists(table: string, column: string) {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?", [table, column]);
  return rows.length > 0;
}

async function setup() {
  try {
    const database = await testDatabaseConnection();
    if (!(await columnExists("event_staff", "assignment_role"))) {
      await pool.query("ALTER TABLE event_staff ADD COLUMN assignment_role VARCHAR(40) NOT NULL DEFAULT 'co_organizer' AFTER user_id");
    }
    console.log(`Event staff (co-organizer) schema verified in ${database}`);
  } catch (error) { console.error(`Event staff schema setup failed (${databaseErrorCode(error)})`, error); process.exitCode = 1; }
  finally { await pool.end(); }
}
void setup();
