// Browser requests must always stay on the Next.js origin. next.config.ts
// proxies /api and /uploads to Express in both development and production.
// Keeping this value constant also prevents a stale NEXT_PUBLIC_API_URL from
// silently restoring cross-origin authentication in a production build.
export const API_BASE_URL = "";
