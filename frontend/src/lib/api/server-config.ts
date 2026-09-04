import "server-only";

const localBackendOrigin = "http://localhost:5000";

export const BACKEND_ORIGIN = (
  process.env.BACKEND_ORIGIN?.trim() || localBackendOrigin
).replace(/\/$/, "");

try {
  new URL(BACKEND_ORIGIN);
} catch {
  throw new Error("BACKEND_ORIGIN must be a valid absolute URL");
}
