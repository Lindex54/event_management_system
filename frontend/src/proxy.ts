import { type NextRequest, NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/api/config";

const adminLoginPath = "/admin/login";

export async function proxy(request: NextRequest) {
  // API_BASE_URL can be a relative "" in production (see lib/api/config.ts),
  // meaning "call this same origin" through the Next.js rewrite proxy. A
  // server-side fetch still needs an absolute URL, so resolve against the
  // incoming request's own origin in that case.
  const base = API_BASE_URL || request.nextUrl.origin;

  if (request.nextUrl.pathname.startsWith("/organizer")) {
    const cookie=request.headers.get("cookie");
    if(!cookie)return NextResponse.redirect(new URL("/login",request.url));
    try{const response=await fetch(`${base}/api/auth/session`,{headers:{cookie},cache:"no-store"});if(response.ok){const result=await response.json();if(result.data?.roles?.includes("event-organizer"))return NextResponse.next();}}catch{}
    return NextResponse.redirect(new URL("/login",request.url));
  }
  if (request.nextUrl.pathname === adminLoginPath) return NextResponse.next();

  const cookie = request.headers.get("cookie");
  if (!cookie) return NextResponse.redirect(new URL(adminLoginPath, request.url));

  try {
    const response = await fetch(
      `${base}/api/auth/admin/session`,
      { headers: { cookie }, cache: "no-store" },
    );
    if (response.ok) return NextResponse.next();
  } catch {
    // The login page will explain backend availability when a user submits.
  }

  return NextResponse.redirect(new URL(adminLoginPath, request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/organizer/:path*"],
};
