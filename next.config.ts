import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  outputFileTracingIncludes: {
    "/api/scholarlens": ["./data/corpus/**/*"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
