import cors from "cors";
import express from "express";

import { databaseErrorCode, pool } from "./config/database";
import adminAuthRouter from "./routes/admin-auth.routes";
import authRouter from "./routes/auth.routes";
import attendeesRouter from "./routes/admin/attendees.routes";
import eventsRouter from "./routes/admin/events.routes";
import organizersRouter from "./routes/admin/organizers.routes";
import registrationsRouter from "./routes/admin/registrations.routes";
import uploadsRouter from "./routes/admin/uploads.routes";
import venuesRouter from "./routes/admin/venues.routes";
import organizerRouter from "./routes/organizer";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads", { fallthrough: false, maxAge: "7d" }));
app.use("/api/auth/admin", adminAuthRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin/events", eventsRouter);
app.use("/api/admin/registrations", registrationsRouter);
app.use("/api/admin/uploads", uploadsRouter);
app.use("/api/admin/attendees", attendeesRouter);
app.use("/api/admin/organizers", organizersRouter);
app.use("/api/admin/venues", venuesRouter);
app.use("/api/organizer", organizerRouter);

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

export default app;
