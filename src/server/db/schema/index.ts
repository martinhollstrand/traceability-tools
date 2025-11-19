import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const tools = pgTable(
  "tools",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    vendor: text("vendor").notNull(),
    category: text("category").notNull(),
    summary: text("summary").notNull(),
    website: text("website").notNull(),
    logoUrl: text("logo_url"),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    stats: jsonb("stats")
      .$type<{ customers: number; coverage: number; contracts: number }>()
      .notNull()
      .default({
        customers: 0,
        coverage: 0,
        contracts: 0,
      }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("tools_slug_idx").on(table.slug),
  }),
);

export const toolVersions = pgTable("tool_versions", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => tools.id),
  versionTag: text("version_tag").notNull(),
  diffSummary: text("diff_summary"),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
  columnMapping: jsonb("column_mapping").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  createdBy: text("created_by"),
});

export const reportMetadata = pgTable("report_metadata", {
  id: text("id").primaryKey(),
  toolId: text("tool_id")
    .notNull()
    .references(() => tools.id),
  title: text("title").notNull(),
  pdfUrl: text("pdf_url"),
  highlights: jsonb("highlights").$type<
    {
      label: string;
      detail: string;
    }[]
  >(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
});

export const adminUsers = pgTable(
  "admin_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name"),
    role: text("role").notNull().default("admin"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: false }),
    createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow(),
  },
  (table) => ({
    emailIdx: uniqueIndex("admin_users_email_idx").on(table.email),
  }),
);

export const toolEmbeddings = pgTable("tool_embeddings", {
  toolId: text("tool_id")
    .primaryKey()
    .references(() => tools.id),
  embedding: jsonb("embedding").$type<number[]>(),
  dimension: integer("dimension").default(0),
  lastComputedAt: timestamp("last_computed_at", { withTimezone: false }),
});

export const toolRelations = relations(tools, ({ many }) => ({
  versions: many(toolVersions),
  reports: many(reportMetadata),
}));

export const toolVersionRelations = relations(toolVersions, ({ one }) => ({
  tool: one(tools, {
    fields: [toolVersions.toolId],
    references: [tools.id],
  }),
}));

export const reportRelations = relations(reportMetadata, ({ one }) => ({
  tool: one(tools, {
    fields: [reportMetadata.toolId],
    references: [tools.id],
  }),
}));
