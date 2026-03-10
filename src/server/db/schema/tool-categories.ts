import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const toolCategoriesTable = pgTable(
  "tool_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    showInSearchFilter: boolean("show_in_search_filter").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    nameIndex: uniqueIndex("tool_categories_name_idx").on(table.name),
    showInSearchFilterIndex: index("tool_categories_show_in_search_filter_idx").on(
      table.showInSearchFilter,
    ),
  }),
);
