import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only enabled for our own first-party placeholder SVGs under /public —
    // never for user- or admin-uploaded images.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // The Home page hero banner — a curated stock photo, not user/admin
    // uploaded content, so this is a narrow, deliberate allow-list.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
