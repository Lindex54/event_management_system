import { type NextRequest, NextResponse } from "next/server";

const adminLoginPath = "/admin/login";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/organizer")) {
    const cookie=request.headers.get("cookie");
    if(!cookie)return NextResponse.redirect(new URL("/login",request.url));
    try{const response=await fetch(`${process.env.NEXT_PUBLIC_API_URL??"http://localhost:5000"}/api/auth/session`,{headers:{cookie},cache:"no-store"});if(response.ok){const result=await response.json();if(result.data?.roles?.includes("event-organizer"))return NextResponse.next();}}catch{}
    return NextResponse.redirect(new URL("/login",request.url));
  }
  if (request.nextUrl.pathname === adminLoginPath) return NextResponse.next();

  const cookie = request.headers.get("cookie");
  if (!cookie) return NextResponse.redirect(new URL(adminLoginPath, request.url));

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/auth/admin/session`,
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
