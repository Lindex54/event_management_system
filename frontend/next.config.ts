import type { NextConfig } from "next";

// Set only in production (server-side only — never exposed to the browser):
// the backend's real origin, e.g. https://api-xxxx.hostingersite.com
// When set, /api/* and /uploads/* requests are transparently proxied through
// this Next.js server to the backend. That makes every request same-origin
// from the browser's point of view, so the backend's session cookie is
// scoped to the frontend's own domain and survives page navigations even
// when the two apps live on completely unrelated hostnames (as with
// Hostinger's auto-generated per-app subdomains, which share no parent
// domain a cookie's Domain attribute could target).
const backendOrigin = process.env.BACKEND_ORIGIN?.trim().replace(/\/$/, "");

function backendImagePattern() {
  if (!backendOrigin) return null;
  try {
    const url = new URL(backendOrigin);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/uploads/**" as const,
    };
  } catch {
    return null;
  }
}

const backendPattern = backendImagePattern();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      ...(backendPattern ? [backendPattern] : []),
    ],
  },
  async rewrites() {
    if (!backendOrigin) return [];
    return [
      { source: "/api/:path*", destination: `${backendOrigin}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendOrigin}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
