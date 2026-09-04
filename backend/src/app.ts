import cors from "cors";
import express, { type ErrorRequestHandler } from "express";

import { databaseErrorCode, pool } from "./config/database";
import adminAuthRouter from "./routes/admin-auth.routes";
import authRouter from "./routes/auth.routes";
import setupAccountRouter from "./routes/setup-account.routes";
import publicEventsRouter from "./routes/public-events.routes";
import attendeesRouter from "./routes/admin/attendees.routes";
import eventsRouter from "./routes/admin/events.routes";
import organizersRouter from "./routes/admin/organizers.routes";
import registrationsRouter from "./routes/admin/registrations.routes";
import uploadsRouter from "./routes/admin/uploads.routes";
import usersRouter from "./routes/admin/users.routes";
import venuesRouter from "./routes/admin/venues.routes";
import organizerRouter from "./routes/organizer";
import staffRouter from "./routes/staff";
import attendeeRouter from "./routes/attendee";

const app = express();

// Hostinger terminates HTTPS at its reverse proxy. Trust the first proxy hop so
// Express reports the original protocol and client address correctly.
app.set("trust proxy", 1);

const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
let frontendOrigin: string;
try {
  frontendOrigin = new URL(frontendUrl).origin;
} catch {
  throw new Error("FRONTEND_URL must be a valid absolute URL");
}

app.use(cors({
  origin: frontendOrigin,
  credentials: true,
}));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads", { fallthrough: false, maxAge: "7d" }));
app.use("/api/auth/admin", adminAuthRouter);
app.use("/api/auth", authRouter);
app.use("/api/auth", setupAccountRouter);
app.use("/api/events", publicEventsRouter);
app.use("/api/admin/events", eventsRouter);
app.use("/api/admin/registrations", registrationsRouter);
app.use("/api/admin/uploads", uploadsRouter);
app.use("/api/admin/attendees", attendeesRouter);
app.use("/api/admin/organizers", organizersRouter);
app.use("/api/admin/users", usersRouter);
app.use("/api/admin/venues", venuesRouter);
app.use("/api/organizer", organizerRouter);
app.use("/api/staff", staffRouter);
app.use("/api/attendee", attendeeRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Event Management System API is running",
  });
});

app.get("/api/db-health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      message: "Database connection is healthy",
    });
  } catch (error) {
    console.error(`Database health check failed (${databaseErrorCode(error)})`);
    res.status(503).json({
      success: false,
      message: "Database connection is unavailable",
    });
  }
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  console.error(`Unhandled request error (${errorName})`);
  response.status(500).json({
    success: false,
    message: "An unexpected server error occurred",
  });
};

app.use(errorHandler);

export default app;
