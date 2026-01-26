import { pgEnum } from "drizzle-orm/pg-core";

export const toolStatusEnum = pgEnum("tool_status", ["draft", "published", "archived"]);

export const toolVersionStatusEnum = pgEnum("tool_version_status", [
  "pending",
  "processing",
  "ready",
  "failed",
]);

export const adminRoleEnum = pgEnum("admin_role", ["admin", "editor", "viewer"]);

// Question types: metadata (maps to tool fields) vs survey (actual survey questions)
export const questionTypeEnum = pgEnum("question_type", ["metadata", "survey"]);

// Tool fields that metadata questions can map to
export const mappedFieldEnum = pgEnum("mapped_field", [
  "name",
  "vendor",
  "website",
  "category",
]);
