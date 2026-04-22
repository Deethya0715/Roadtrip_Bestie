import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 requires a driver adapter — the ORM no longer bundles a Rust
 * engine. `@prisma/adapter-pg` is the node-postgres adapter.
 *
 * Next.js hot-reloads route handlers in dev, which would otherwise
 * create a new PrismaClient on every edit and exhaust the Postgres
 * connection pool, so we cache the instance on globalThis.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Fill it in backend-api/.env with your Supabase connection string."
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
