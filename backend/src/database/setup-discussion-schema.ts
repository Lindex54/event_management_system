import "dotenv/config";

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { databaseErrorCode, pool, testDatabaseConnection } from "../config/database";

async function setup() {
  try {
    const database = await testDatabaseConnection();
    const sql = await readFile(resolve(process.cwd(), "database/event_discussions.sql"), "utf8");
    for (const statement of sql.split(";").map((part) => part.trim()).filter(Boolean)) await pool.query(statement);
    console.log(`Event discussion schema verified in ${database}`);
  } catch (error) {
    console.error(`Event discussion schema setup failed (${databaseErrorCode(error)})`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void setup();
