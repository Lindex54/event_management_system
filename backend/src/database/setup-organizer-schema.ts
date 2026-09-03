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
    if (!(await columnExists("speakers", "bio"))) await pool.query("ALTER TABLE speakers ADD COLUMN bio TEXT NULL AFTER organization");
    if (!(await columnExists("speakers", "photo_url"))) await pool.query("ALTER TABLE speakers ADD COLUMN photo_url VARCHAR(2048) NULL AFTER bio");
    if (!(await columnExists("speakers", "speaker_type"))) await pool.query("ALTER TABLE speakers ADD COLUMN speaker_type ENUM('Speaker','Guest') NOT NULL DEFAULT 'Speaker' AFTER photo_url");
    await pool.query(`CREATE TABLE IF NOT EXISTS event_schedule_items (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,event_id BIGINT UNSIGNED NOT NULL,speaker_id BIGINT UNSIGNED NULL,
      title VARCHAR(200) NOT NULL,description TEXT NULL,item_date DATE NOT NULL,start_time TIME NOT NULL,end_time TIME NULL,
      room VARCHAR(180) NULL,sort_order INT UNSIGNED NOT NULL DEFAULT 0,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,deleted_at TIMESTAMP NULL DEFAULT NULL,
      CONSTRAINT chk_schedule_time_range CHECK (end_time IS NULL OR end_time > start_time),
      CONSTRAINT fk_schedule_event FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_schedule_speaker FOREIGN KEY(speaker_id) REFERENCES speakers(id) ON DELETE SET NULL ON UPDATE CASCADE,
      INDEX idx_schedule_event_date_time(event_id,item_date,start_time),INDEX idx_schedule_speaker(speaker_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log(`Organizer schema verified in ${database}`);
  } catch (error) { console.error(`Organizer schema setup failed (${databaseErrorCode(error)})`, error); process.exitCode = 1; }
  finally { await pool.end(); }
}
void setup();
