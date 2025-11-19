import { sql } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const reportMetadataTable = pgTable("report_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  ingress: text("ingress"),
  keyFindings: jsonb("key_findings")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  pdfUrl: text("pdf_url"),
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
