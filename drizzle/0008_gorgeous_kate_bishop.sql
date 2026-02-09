CREATE TABLE IF NOT EXISTS "landing_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"content" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
