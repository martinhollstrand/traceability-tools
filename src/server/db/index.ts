import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  connection?: ReturnType<typeof postgres>;
};

if (!globalForDb.connection) {
  globalForDb.connection = postgres(env.DATABASE_URL, {
    ssl: env.DATABASE_URL.includes("neon.tech") ? "require" : undefined,
    max: 3,
  });
}

export const db = drizzle(globalForDb.connection, { schema });
export type DbClient = typeof db;

// Export getDb function for compatibility with existing code
export function getDb() {
  return db;
}
