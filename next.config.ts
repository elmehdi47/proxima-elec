import type { NextConfig } from "next";

/**
 * Security headers applied to every response:
 *  - Clickjacking protection (X-Frame-Options / frame-ancestors)
 *  - MIME-sniffing protection (nosniff)
 *  - Referrer privacy
 *  - Permissions lockdown (camera/mic/geo/payment disabled)
 *  - HSTS (forces HTTPS once served over TLS, e.g. on Vercel)
 *  - Content-Security-Policy (scripts/styles/images limited to what Next needs)
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js needs inline bootstrap scripts; dev (HMR) needs eval
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // local assets + data/blob URIs + remote product photos set by the admin
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // keep the admin panel out of search engines
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
