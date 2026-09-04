import type { CookieOptions } from "express";

export const adminSessionCookieName = "evently_admin_session";
export const userSessionCookieName = "evently_session";

function cookieDomain(): string | undefined {
  const value = process.env.COOKIE_DOMAIN?.trim();
  return value || undefined;
}

export function sessionCookieOptions(maxAge?: number): CookieOptions {
  const domain = cookieDomain();
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(maxAge !== undefined ? { maxAge } : {}),
    ...(domain ? { domain } : {}),
  };
}

export function clearSessionCookieOptions(): CookieOptions {
  const { maxAge: _maxAge, ...options } = sessionCookieOptions();
  return options;
}

export function readCookie(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const item of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = item.trim().split("=");
    if (cookieName === name) return decodeURIComponent(valueParts.join("="));
  }
  return undefined;
}
