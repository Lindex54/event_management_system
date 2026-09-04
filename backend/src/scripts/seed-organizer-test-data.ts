import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { databaseErrorCode, pool } from "../config/database";
import { hashPassword } from "../utils/password";

interface IdRow extends RowDataPacket { id: number; }

const primaryPassword = "OrganizerDemo123!";
const secondPassword = "OrganizerTwoDemo123!";

async function ensurePersonAndUser(connection: import("mysql2/promise").PoolConnection, opts: { firstName: string; lastName: string; email: string; telephone: string; password: string }): Promise<{ userId: number; personId: number }> {
  const [existingUser] = await connection.query<RowDataPacket[]>(
    "SELECT u.id AS userId, u.person_id AS personId FROM users u JOIN people p ON p.id = u.person_id WHERE p.email = ? LIMIT 1",
    [opts.email],
  );
  if (existingUser[0]) return { userId: existingUser[0].userId, personId: existingUser[0].personId };

  const [personResult] = await connection.execute<ResultSetHeader>(
    "INSERT INTO people (first_name, last_name, email, telephone) VALUES (?, ?, ?, ?)",
    [opts.firstName, opts.lastName, opts.email, opts.telephone],
  );
  const passwordHash = await hashPassword(opts.password);
  const [userResult] = await connection.execute<ResultSetHeader>(
    "INSERT INTO users (person_id, password_hash, status, email_verified_at) VALUES (?, ?, 'Active', CURRENT_TIMESTAMP)",
    [personResult.insertId, passwordHash],
  );
  const [roleRows] = await connection.query<IdRow[]>("SELECT id FROM roles WHERE slug = 'event-organizer' LIMIT 1");
  const role = roleRows[0];
  if (!role) throw new Error("ROLE_MISSING:event-organizer");
  await connection.execute("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userResult.insertId, role.id]);
  return { userId: userResult.insertId, personId: personResult.insertId };
}

async function seed(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Activate the existing organizer account and set a known password for testing.
    const [existingOrganizer] = await connection.query<RowDataPacket[]>(
      "SELECT o.id AS organizerId, o.user_id AS userId FROM organizers o WHERE o.organization = 'Kampala' LIMIT 1",
    );
    if (existingOrganizer[0]) {
      await connection.execute("UPDATE organizers SET status='Active' WHERE id=?", [existingOrganizer[0].organizerId]);
      const passwordHash = await hashPassword(primaryPassword);
      await connection.execute("UPDATE users SET password_hash=?, status='Active' WHERE id=?", [passwordHash, existingOrganizer[0].userId]);
      console.log(`Activated existing organizer (organizer_id=${existingOrganizer[0].organizerId}, owns events 3 & 4). Login: joshvictor@gmail.com / ${primaryPassword}`);
    }

    // Create a second, unrelated organizer + event, purely to prove cross-organizer isolation.
    const second = await ensurePersonAndUser(connection, { firstName: "Amina", lastName: "Wanjiru", email: "organizer2@evently.local", telephone: "+256700777888", password: secondPassword });
    const [existingSecondOrganizer] = await connection.query<IdRow[]>("SELECT id FROM organizers WHERE user_id = ? LIMIT 1", [second.userId]);
    let secondOrganizerId = existingSecondOrganizer[0]?.id;
    if (!secondOrganizerId) {
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO organizers (user_id, organization, position, status) VALUES (?, ?, ?, 'Active')",
        [second.userId, "Nairobi Events Collective", "Founder"],
      );
      secondOrganizerId = result.insertId;
    }

    const [venueRows] = await connection.query<IdRow[]>("SELECT id FROM venues LIMIT 1");
    const venueId = venueRows[0]?.id;
    if (venueId) {
      const [existingSecondEvent] = await connection.query<IdRow[]>("SELECT id FROM events WHERE slug = 'nairobi-founders-night-2026' LIMIT 1");
      if (!existingSecondEvent[0]) {
        await connection.execute(
          `INSERT INTO events (organizer_id, venue_id, name, slug, theme, description, event_date, start_time, end_time, capacity, status, is_featured)
           VALUES (?, ?, 'Nairobi Founders Night 2026', 'nairobi-founders-night-2026', 'Networking', 'A private event belonging to a different organizer, used to verify cross-organizer isolation.', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '18:00:00', '21:00:00', 80, 'Active', 0)`,
          [secondOrganizerId, venueId],
        );
      }
    }

    await connection.commit();
    console.log(`Second organizer ready. Login: organizer2@evently.local / ${secondPassword} (owns only "Nairobi Founders Night 2026")`);
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
