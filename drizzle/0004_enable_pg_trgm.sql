-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint

-- Trigram indexes speed up ILIKE '%query%' and trigram operators (%) for fuzzy matching.
-- Keep indexes focused on the columns we search.
CREATE INDEX IF NOT EXISTS "tools_name_trgm_idx" ON "tools" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_vendor_trgm_idx" ON "tools" USING gin (coalesce("vendor", '') gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_category_trgm_idx" ON "tools" USING gin (coalesce("category", '') gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tools_website_trgm_idx" ON "tools" USING gin (coalesce("website", '') gin_trgm_ops);--> statement-breakpoint
