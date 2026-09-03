export const adminSessionCookieName = "evently_admin_session";
export const userSessionCookieName = "evently_session";

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const item of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = item.trim().split("=");
    if (cookieName === name) return decodeURIComponent(valueParts.join("="));
  }
  return undefined;
}
