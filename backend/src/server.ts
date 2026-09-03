import "dotenv/config";

import app from "./app";
import { databaseErrorCode, pool, testDatabaseConnection } from "./config/database";

const port = Number(process.env.PORT ?? "5000");

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port number");
}

async function startServer(): Promise<void> {
  try {
    const databaseName = await testDatabaseConnection();
    console.log(`Database connected successfully (${databaseName})`);
  } catch (error) {
    console.error(`Database connection failed (${databaseErrorCode(error)})`);
    process.exitCode = 1;
    await pool.end();
    return;
  }

  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  async function shutdown(): Promise<void> {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
}

void startServer();
