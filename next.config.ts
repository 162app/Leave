import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip static generation errors when env vars are missing (build-time only)
  // All pages that need Supabase are client components anyway
  output: "standalone",
};

export default nextConfig;
