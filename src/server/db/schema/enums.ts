import { pgEnum } from "drizzle-orm/pg-core";

export const toolStatusEnum = pgEnum("tool_status", ["draft", "published", "archived"]);

export const toolVersionStatusEnum = pgEnum("tool_version_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const adminRoleEnum = pgEnum("admin_role", ["admin", "editor", "viewer"]);
