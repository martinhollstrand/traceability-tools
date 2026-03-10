CREATE TABLE "tool_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"show_in_search_filter" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "tool_categories_name_idx" ON "tool_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "tool_categories_show_in_search_filter_idx" ON "tool_categories" USING btree ("show_in_search_filter");