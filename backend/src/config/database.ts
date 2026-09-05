import "dotenv/config";

import mysql, { type PoolOptions, type RowDataPacket } from "mysql2/promise";

function requiredEnvironmentValue(name: "DB_HOST" | "DB_USER" | "DB_NAME"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const port = Number(process.env.DB_PORT ?? "3306");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("DB_PORT must be a valid TCP port number");
}

export const databaseConfig: PoolOptions = {
  host: requiredEnvironmentValue("DB_HOST"),
  port,
  user: requiredEnvironmentValue("DB_USER"),
  password: process.env.DB_PASSWORD ?? "",
  database: requiredEnvironmentValue("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60_000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: "utf8mb4",
};

export const pool = mysql.createPool(databaseConfig);

interface SelectedDatabaseRow extends RowDataPacket {
  databaseName: string | null;
}

export async function testDatabaseConnection(): Promise<string> {
  const connection = await pool.getConnection();
  try {
    await connection.query("SELECT 1");
    const [rows] = await connection.query<SelectedDatabaseRow[]>("SELECT DATABASE() AS databaseName");
    const selectedDatabase = rows[0]?.databaseName;
    if (!selectedDatabase) throw new Error("No MySQL database is selected");
    return selectedDatabase;
  } finally {
    connection.release();
  }
}

export function databaseErrorCode(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return "UNKNOWN_DATABASE_ERROR";
}

export function databaseErrorSqlMessage(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "sqlMessage" in error && typeof error.sqlMessage === "string") {
    return error.sqlMessage;
  }
  return null;
}
