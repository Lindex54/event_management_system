import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, pool } from "../config/database";
import { hashPassword } from "../utils/password";

interface IdRow extends RowDataPacket { id: number; }

const staffPassword = "StaffDemo123!";
const attendeePassword = "AttendeeDemo123!";

async function ensureVenue(connection: import("mysql2/promise").PoolConnection): Promise<number> {
  const [existing] = await connection.query<IdRow[]>("SELECT id FROM venues WHERE name = ? LIMIT 1", ["Kampala Serena Conference Centre"]);
  if (existing[0]) return existing[0].id;
  const [result] = await connection.execute<ResultSetHeader>(
    "INSERT INTO venues (name, address, capacity, status) VALUES (?, ?, ?, 'Available')",
    ["Kampala Serena Conference Centre", "Kintu Road, Kampala, Uganda", 500],
  );
  return result.insertId;
}

async function ensureOrganizerId(connection: import("mysql2/promise").PoolConnection): Promise<number> {
  const [rows] = await connection.query<IdRow[]>("SELECT id FROM organizers ORDER BY id LIMIT 1");
  if (!rows[0]) throw new Error("NO_ORGANIZER_FOUND");
  return rows[0].id;
}

async function ensureEvent(connection: import("mysql2/promise").PoolConnection, opts: { organizerId: number; venueId: number; name: string; slug: string; daysFromToday: number; capacity: number }): Promise<number> {
  const [existing] = await connection.query<IdRow[]>("SELECT id FROM events WHERE slug = ? LIMIT 1", [opts.slug]);
  if (existing[0]) return existing[0].id;
  const [result] = await connection.execute<ResultSetHeader>(
    `INSERT INTO events (organizer_id, venue_id, name, slug, theme, description, event_date, start_time, end_time, capacity, status, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), '09:00:00', '17:00:00', ?, 'Active', 0)`,
    [opts.organizerId, opts.venueId, opts.name, opts.slug, "Technology", "Seeded event for testing the Event Staff and Attendee dashboards.", opts.daysFromToday, opts.capacity],
  );
  return result.insertId;
}

async function ensurePersonAndUser(connection: import("mysql2/promise").PoolConnection, opts: { firstName: string; lastName: string; email: string; telephone: string; password: string; roleSlug: string }): Promise<{ userId: number; personId: number; created: boolean }> {
  const [existingUser] = await connection.query<RowDataPacket[]>(
    "SELECT u.id AS userId, u.person_id AS personId FROM users u JOIN people p ON p.id = u.person_id WHERE p.email = ? LIMIT 1",
    [opts.email],
  );
  if (existingUser[0]) return { userId: existingUser[0].userId, personId: existingUser[0].personId, created: false };

  const [personResult] = await connection.execute<ResultSetHeader>(
    "INSERT INTO people (first_name, last_name, email, telephone) VALUES (?, ?, ?, ?)",
    [opts.firstName, opts.lastName, opts.email, opts.telephone],
  );
  const passwordHash = await hashPassword(opts.password);
  const [userResult] = await connection.execute<ResultSetHeader>(
    "INSERT INTO users (person_id, password_hash, status, email_verified_at) VALUES (?, ?, 'Active', CURRENT_TIMESTAMP)",
    [personResult.insertId, passwordHash],
  );
  const [roleRows] = await connection.query<IdRow[]>("SELECT id FROM roles WHERE slug = ? LIMIT 1", [opts.roleSlug]);
  const role = roleRows[0];
  if (!role) throw new Error(`ROLE_MISSING:${opts.roleSlug}`);
  await connection.execute("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userResult.insertId, role.id]);
  return { userId: userResult.insertId, personId: personResult.insertId, created: true };
}

async function ensureAttendeeRecord(connection: import("mysql2/promise").PoolConnection, personId: number): Promise<number> {
  const [existing] = await connection.query<IdRow[]>("SELECT id FROM attendees WHERE person_id = ? LIMIT 1", [personId]);
  if (existing[0]) return existing[0].id;
  const [result] = await connection.execute<ResultSetHeader>("INSERT INTO attendees (person_id, status) VALUES (?, 'Active')", [personId]);
  return result.insertId;
}

async function seed(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const venueId = await ensureVenue(connection);
    const organizerId = await ensureOrganizerId(connection);

    const todayEventId = await ensureEvent(connection, { organizerId, venueId, name: "Product & Innovation Summit 2026", slug: "product-innovation-summit-2026", daysFromToday: 0, capacity: 150 });
    const upcomingEventId = await ensureEvent(connection, { organizerId, venueId, name: "East Africa Tech Conference 2026", slug: "east-africa-tech-conference-2026", daysFromToday: 14, capacity: 300 });

    const [existingSchedule] = await connection.query<IdRow[]>("SELECT id FROM event_schedule_items WHERE event_id = ? LIMIT 1", [todayEventId]);
    if (!existingSchedule[0]) {
      await connection.execute(
        "INSERT INTO event_schedule_items (event_id, title, description, item_date, start_time, end_time, room, sort_order) VALUES (?, ?, ?, CURDATE(), '09:30:00', '10:30:00', 'Main Hall', 1)",
        [todayEventId, "Opening Keynote", "Welcome address and keynote session."],
      );
      await connection.execute(
        "INSERT INTO event_schedule_items (event_id, title, description, item_date, start_time, end_time, room, sort_order) VALUES (?, ?, ?, CURDATE(), '11:00:00', '12:30:00', 'Hall B', 2)",
        [todayEventId, "Panel: The Future of Events Tech", "Industry panel discussion."],
      );
    }

    const staff = await ensurePersonAndUser(connection, { firstName: "Grace", lastName: "Nakato", email: "staff@evently.local", telephone: "+256700111222", password: staffPassword, roleSlug: "event-staff" });
    await connection.query("INSERT IGNORE INTO event_staff (event_id, user_id) VALUES (?, ?), (?, ?)", [todayEventId, staff.userId, upcomingEventId, staff.userId]);

    const attendeeUser = await ensurePersonAndUser(connection, { firstName: "Daniel", lastName: "Mugisha", email: "attendee@evently.local", telephone: "+256700333444", password: attendeePassword, roleSlug: "attendee" });
    const attendeeId = await ensureAttendeeRecord(connection, attendeeUser.personId);

    const walkIn = await ensurePersonAndUser(connection, { firstName: "Sarah", lastName: "Kintu", email: "sarah.kintu@evently.local", telephone: "+256700555666", password: attendeePassword, roleSlug: "attendee" });
    const walkInAttendeeId = await ensureAttendeeRecord(connection, walkIn.personId);

    const [existingRegistration] = await connection.query<IdRow[]>("SELECT id FROM registrations WHERE event_id = ? AND attendee_id = ?", [todayEventId, attendeeId]);
    if (!existingRegistration[0]) {
      await connection.execute(
        "INSERT INTO registrations (reference_code, event_id, attendee_id, status) VALUES (?, ?, ?, 'Confirmed')",
        [`REG-SEED-${attendeeId}`, todayEventId, attendeeId],
      );
    }
    const [existingWalkInRegistration] = await connection.query<IdRow[]>("SELECT id FROM registrations WHERE event_id = ? AND attendee_id = ?", [todayEventId, walkInAttendeeId]);
    if (!existingWalkInRegistration[0]) {
      await connection.execute(
        "INSERT INTO registrations (reference_code, event_id, attendee_id, status) VALUES (?, ?, ?, 'Confirmed')",
        [`REG-SEED-${walkInAttendeeId}`, todayEventId, walkInAttendeeId],
      );
    }

    await connection.commit();

    console.log("Seed complete.");
    console.log(`Event Staff login  -> email: staff@evently.local     password: ${staffPassword}`);
    console.log(`Attendee login     -> email: attendee@evently.local  password: ${attendeePassword}`);
    console.log("A second attendee (sarah.kintu@evently.local) is registered but not checked in, for testing the check-in search.");
  } catch (error) {
    await connection.rollback();
    console.error(`Seeding failed (${databaseErrorCode(error)})`, error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

void seed();
