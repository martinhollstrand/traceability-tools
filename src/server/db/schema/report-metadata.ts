import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { adminUsersTable } from "./admin-users";

export const reportMetadataTable = pgTable("report_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  ingress: text("ingress"),
  keyFindings: jsonb("key_findings")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  pdfUrl: text("pdf_url"),
  pdfFilename: text("pdf_filename"),
  pdfSize: integer("pdf_size"), // Size in bytes
  pdfUploadedAt: timestamp("pdf_uploaded_at", { withTimezone: true }),
  pdfUploadedBy: uuid("pdf_uploaded_by").references(() => adminUsersTable.id, {
    onDelete: "set null",
  }),
  isPublished: boolean("is_published").notNull().default(false),
  previewData: jsonb("preview_data")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
