import { type NextRequest, NextResponse } from "next/server";

import { BACKEND_ORIGIN } from "@/lib/api/server-config";

const adminLoginPath = "/admin/login";
const userLoginPath = "/login";

const protectedUserAreas = [
  { prefix: "/organizer", role: "event-organizer" },
  { prefix: "/staff", role: "event-staff" },
  { prefix: "/attendee", role: "attendee" },
] as const;

export async function proxy(request: NextRequest) {
  const userArea = protectedUserAreas.find(({ prefix }) =>
    request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (userArea) {
    const cookie = request.headers.get("cookie");
    if (!cookie) return NextResponse.redirect(new URL(userLoginPath, request.url));

    try {
      const response = await fetch(`${BACKEND_ORIGIN}/api/auth/session`, {
        headers: { cookie },
        cache: "no-store",
      });
      if (response.ok) {
        const result = await response.json() as { data?: { roles?: string[] } };
        if (result.data?.roles?.includes(userArea.role)) return NextResponse.next();
      }
    } catch {
      // Express still performs final authorization for every API request.
    }

    return NextResponse.redirect(new URL(userLoginPath, request.url));
  }

  if (request.nextUrl.pathname === adminLoginPath) return NextResponse.next();

  const cookie = request.headers.get("cookie");
  if (!cookie) return NextResponse.redirect(new URL(adminLoginPath, request.url));

  try {
    const response = await fetch(`${BACKEND_ORIGIN}/api/auth/admin/session`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (response.ok) return NextResponse.next();
  } catch {
    // The login page reports backend availability when a user submits.
  }

  return NextResponse.redirect(new URL(adminLoginPath, request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/organizer/:path*", "/staff/:path*", "/attendee/:path*"],
};
