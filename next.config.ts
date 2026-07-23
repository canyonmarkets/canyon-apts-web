import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones on the home network reach the dev server (local signing-page tests)
  allowedDevOrigins: ["192.168.12.199"],
};

export default nextConfig;
