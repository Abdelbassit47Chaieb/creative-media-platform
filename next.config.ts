import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // static HTML export for Cloudflare Pages
  trailingSlash: true,       // ensures /briefs/ → briefs/index.html
  images: {
    unoptimized: true,       // next/image not supported in static export
  },
};

export default nextConfig;
