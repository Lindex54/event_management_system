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
    await pool.query(`CREATE TABLE IF NOT EXISTS account_setup_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id BIGINT UNSIGNED NOT NULL,token_hash CHAR(64) NOT NULL,
      created_by_user_id BIGINT UNSIGNED NULL,expires_at DATETIME NOT NULL,used_at DATETIME NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_account_setup_tokens_hash UNIQUE(token_hash),
      CONSTRAINT fk_account_setup_tokens_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_account_setup_tokens_created_by FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
      INDEX idx_account_setup_tokens_user(user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    if (!(await columnExists("users", "welcome_email_sent_at"))) await pool.query("ALTER TABLE users ADD COLUMN welcome_email_sent_at DATETIME NULL DEFAULT NULL AFTER last_active_at");
    if (!(await columnExists("events", "agenda_type"))) await pool.query("ALTER TABLE events ADD COLUMN agenda_type ENUM('None','File','Url') NOT NULL DEFAULT 'None' AFTER registration_closes_at");
    if (!(await columnExists("events", "agenda_url"))) await pool.query("ALTER TABLE events ADD COLUMN agenda_url VARCHAR(2048) NULL DEFAULT NULL AFTER agenda_type");
    if (!(await columnExists("events", "agenda_file_name"))) await pool.query("ALTER TABLE events ADD COLUMN agenda_file_name VARCHAR(255) NULL DEFAULT NULL AFTER agenda_url");
    if (!(await columnExists("events", "agenda_file_type"))) await pool.query("ALTER TABLE events ADD COLUMN agenda_file_type VARCHAR(120) NULL DEFAULT NULL AFTER agenda_file_name");
    console.log(`Onboarding + agenda schema verified in ${database}`);
  } catch (error) { console.error(`Onboarding schema setup failed (${databaseErrorCode(error)})`, error); process.exitCode = 1; }
  finally { await pool.end(); }
}
void setup();
