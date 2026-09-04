import type { NextConfig } from "next";

// This origin is server-only. Browsers call same-origin /api and /uploads
// paths; Next.js forwards those requests to Express. Development defaults to
// the local backend so it uses the same request path as production.
const backendOrigin = (
  process.env.BACKEND_ORIGIN?.trim() || "http://localhost:5000"
).replace(/\/$/, "");

function backendImagePattern() {
  try {
    const url = new URL(backendOrigin);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/uploads/**" as const,
    };
  } catch {
    throw new Error("BACKEND_ORIGIN must be a valid absolute URL");
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      backendImagePattern(),
    ],
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendOrigin}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendOrigin}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
