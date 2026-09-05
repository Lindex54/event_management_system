import "dotenv/config";

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, pool } from "../config/database";

const lockName = "evently_schema_migrations";
// Resolve from this source/compiled module so Hostinger may start the backend
// from either the repository root or the backend directory.
const migrationsDirectory = resolve(__dirname, "../../database/migrations");

interface LockRow extends RowDataPacket { acquired: number | null; }
interface AppliedRow extends RowDataPacket { migrationName: string; checksum: string; }

function statements(sql: string): string[] {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function migrate() {
  const connection = await pool.getConnection();
  let locked = false;
  try {
    const [lockRows] = await connection.query<LockRow[]>("SELECT GET_LOCK(?, 30) acquired", [lockName]);
    if (lockRows[0]?.acquired !== 1) throw new Error("Could not acquire the database migration lock within 30 seconds");
    locked = true;

    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_schema_migrations_name UNIQUE (migration_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    const files = (await readdir(migrationsDirectory))
      .filter((name) => /^\d{3,}_[a-z0-9][a-z0-9_-]*\.sql$/i.test(name))
      .sort((left, right) => left.localeCompare(right, "en"));
    if (!files.length) throw new Error(`No migration files found in ${migrationsDirectory}`);

    const [appliedRows] = await connection.query<AppliedRow[]>("SELECT migration_name migrationName,checksum FROM schema_migrations");
    const applied = new Map(appliedRows.map((row) => [row.migrationName, row.checksum]));

    for (const file of files) {
      const sql = await readFile(resolve(migrationsDirectory, file), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const previousChecksum = applied.get(file);
      if (previousChecksum) {
        if (previousChecksum !== checksum) throw new Error(`Applied migration ${file} was modified; create a new numbered migration instead`);
        console.log(`Migration already applied: ${file}`);
        continue;
      }

      const migrationStatements = statements(sql);
      console.log(`Applying migration: ${file} (${migrationStatements.length} statements)`);
      for (let index = 0; index < migrationStatements.length; index += 1) {
        try {
          await connection.query(migrationStatements[index]!);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown SQL error";
          throw new Error(`Migration ${file} failed at statement ${index + 1}/${migrationStatements.length} (${databaseErrorCode(error)}): ${message}`);
        }
      }
      try {
        await connection.execute("INSERT INTO schema_migrations(migration_name,checksum) VALUES(?,?)", [file, checksum]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown migration recording error";
        throw new Error(`Migration ${file} ran but could not be recorded (${databaseErrorCode(error)}): ${message}`);
      }
      console.log(`Migration applied: ${file}`);
    }
  } finally {
    if (locked) await connection.query("SELECT RELEASE_LOCK(?)", [lockName]);
    connection.release();
  }
}

async function main() {
  try {
    await migrate();
    console.log("Database migrations are up to date");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown migration error";
    console.error(`Database migration failed (${databaseErrorCode(error)}): ${message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();
