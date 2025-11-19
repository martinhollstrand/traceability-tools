import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { adminRoleEnum } from "@/server/db/schema/enums";

export const adminUsersTable = pgTable(
  "admin_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    role: adminRoleEnum("role").notNull().default("editor"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  },
  (table) => ({
    emailIndex: uniqueIndex("admin_users_email_idx").on(table.email),
  }),
);
