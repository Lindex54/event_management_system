const localApiBaseUrl = "http://localhost:5000";

// If NEXT_PUBLIC_API_URL is explicitly set to an empty string, that means
// "call this same origin" (used in production behind the Next.js rewrite
// proxy — see next.config.ts). Only fall back to the local backend when the
// variable was never set at all.
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const API_BASE_URL = (
  rawApiUrl === undefined ? localApiBaseUrl : rawApiUrl.trim()
).replace(/\/$/, "");
