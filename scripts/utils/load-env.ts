import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..", "..");

function loadEnvFile(filename: string) {
  const filePath = resolve(projectRoot, filename);
  if (existsSync(filePath)) {
    config({ path: filePath, override: true });
  }
}

// Prioritize developer overrides in .env.local, then fall back to .env
loadEnvFile(".env.local");
loadEnvFile(".env");
