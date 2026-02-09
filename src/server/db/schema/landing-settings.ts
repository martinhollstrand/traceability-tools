import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export type LandingContent = {
  hero: {
    badge: string;
    headline: string;
    subtext: string;
  };
  featuredSection: {
    label: string;
    title: string;
    description: string;
  };
  insightBullets: Array<{
    title: string;
    copy: string;
    icon: string;
  }>;
};

export const landingSettingsTable = pgTable("landing_settings", {
  id: text("id").primaryKey().default("default"),
  content: jsonb("content").$type<LandingContent>(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});
