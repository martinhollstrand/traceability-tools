import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

const envFiles = [".env.local", ".env"];
for (const file of envFiles) {
  if (existsSync(file)) {
    loadEnv({ path: file });
    break;
  }
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
