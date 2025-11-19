import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { toolsTable } from "@/server/db/schema/tools";

export const toolEmbeddingsTable = pgTable(
  "tool_embeddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    toolId: uuid("tool_id")
      .notNull()
      .references(() => toolsTable.id, { onDelete: "cascade" }),
    model: text("model").notNull(),
    dimension: integer("dimension").notNull().default(1536),
    embedding: jsonb("embedding")
      .$type<number[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    toolModelIndex: uniqueIndex("tool_embeddings_tool_model_idx").on(
      table.toolId,
      table.model,
    ),
  }),
);
