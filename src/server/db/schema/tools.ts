import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { toolStatusEnum } from "@/server/db/schema/enums";
import { toolVersionsTable } from "@/server/db/schema/tool-versions";

type JsonRecord = Record<string, unknown>;

export const toolsTable = pgTable(
  "tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    vendor: text("vendor"),
    summary: text("summary"),
    category: text("category"),
    website: text("website"),
    status: toolStatusEnum("status").notNull().default("draft"),
    highlights: jsonb("highlights")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    regions: jsonb("regions")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    capabilities: jsonb("capabilities")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    comparisonData: jsonb("comparison_data")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    rawData: jsonb("raw_data")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    metadata: jsonb("metadata")
      .$type<JsonRecord>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    featureScore: jsonb("feature_score")
      .$type<Record<string, number>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    versionId: uuid("version_id").references(() => toolVersionsTable.id, {
      onDelete: "set null",
    }),
    isFeatured: boolean("is_featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    slugIndex: uniqueIndex("tools_slug_idx").on(table.slug),
    categoryIndex: index("tools_category_idx").on(table.category),
    featuredIndex: index("tools_featured_idx").on(table.isFeatured),
  }),
);
