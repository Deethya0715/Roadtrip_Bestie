import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7 + node-postgres use native runtime features (dynamic requires,
  // process.env-based URL parsing) that Turbopack mangles when it bundles
  // them into server chunks, which surfaces as `ERR_INVALID_URL` from
  // `prisma.*.upsert()`. Keep them external so they run from node_modules.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "pg-native",
  ],
};

export default nextConfig;
