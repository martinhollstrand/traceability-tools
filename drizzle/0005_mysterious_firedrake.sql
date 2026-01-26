CREATE TABLE "survey_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"question_text" text NOT NULL,
	"for_comparison" boolean DEFAULT false NOT NULL,
	"supportive_text" text,
	"version_id" uuid,
	"sort_order" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "survey_questions" ADD CONSTRAINT "survey_questions_version_id_tool_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."tool_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "survey_questions_code_idx" ON "survey_questions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "survey_questions_for_comparison_idx" ON "survey_questions" USING btree ("for_comparison");