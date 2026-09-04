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
    if (!(await columnExists("users", "failed_login_attempts"))) {
      await pool.query("ALTER TABLE users ADD COLUMN failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0 AFTER password_hash");
    }
    if (!(await columnExists("users", "locked_at"))) {
      await pool.query("ALTER TABLE users ADD COLUMN locked_at DATETIME NULL DEFAULT NULL AFTER failed_login_attempts");
    }
    await pool.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id BIGINT UNSIGNED NOT NULL,token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,used_at DATETIME NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_password_reset_tokens_hash UNIQUE(token_hash),
      CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_password_reset_tokens_user(user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log(`Auth security schema (lockout + password reset) verified in ${database}`);
  } catch (error) { console.error(`Auth security schema setup failed (${databaseErrorCode(error)})`, error); process.exitCode = 1; }
  finally { await pool.end(); }
}
void setup();
