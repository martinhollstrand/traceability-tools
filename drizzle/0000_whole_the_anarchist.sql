CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_metadata" (
	"id" text PRIMARY KEY NOT NULL,
	"tool_id" text NOT NULL,
	"title" text NOT NULL,
	"pdf_url" text,
	"highlights" jsonb,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tool_embeddings" (
	"tool_id" text PRIMARY KEY NOT NULL,
	"embedding" jsonb,
	"dimension" integer DEFAULT 0,
	"last_computed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tool_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"tool_id" text NOT NULL,
	"version_tag" text NOT NULL,
	"diff_summary" text,
	"snapshot" jsonb NOT NULL,
	"column_mapping" jsonb,
	"created_at" timestamp DEFAULT now(),
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"vendor" text NOT NULL,
	"category" text NOT NULL,
	"summary" text NOT NULL,
	"website" text NOT NULL,
	"logo_url" text,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stats" jsonb DEFAULT '{"customers":0,"coverage":0,"contracts":0}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "report_metadata" ADD CONSTRAINT "report_metadata_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_embeddings" ADD CONSTRAINT "tool_embeddings_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_versions" ADD CONSTRAINT "tool_versions_tool_id_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."tools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "tools_slug_idx" ON "tools" USING btree ("slug");