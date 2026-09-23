import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Only enabled for our own first-party placeholder SVGs under /public —
    // never for user- or admin-uploaded images.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
