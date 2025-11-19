import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { toolVersionStatusEnum } from "@/server/db/schema/enums";
import { adminUsersTable } from "@/server/db/schema/admin-users";

export const toolVersionsTable = pgTable(
  "tool_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    label: text("label").notNull(),
    status: toolVersionStatusEnum("status").notNull().default("pending"),
    columnMappings: jsonb("column_mappings")
      .$type<Record<string, string>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    columnCount: integer("column_count").notNull().default(0),
    rowCount: integer("row_count").notNull().default(0),
    sourceFilename: text("source_filename"),
    uploadedBy: uuid("uploaded_by").references(() => adminUsersTable.id),
    importedAt: timestamp("imported_at", { withTimezone: true }).default(sql`now()`),
    isActive: boolean("is_active").notNull().default(false),
    diffSummary: jsonb("diff_summary")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    statusIndex: index("tool_versions_status_idx").on(table.status),
    activeIndex: index("tool_versions_active_idx").on(table.isActive),
  }),
);
