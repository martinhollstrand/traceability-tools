CREATE TYPE "question_type" AS ENUM('metadata', 'survey');--> statement-breakpoint
CREATE TYPE "mapped_field" AS ENUM('name', 'vendor', 'website', 'category');--> statement-breakpoint
ALTER TABLE "survey_questions" ADD COLUMN "question_type" "question_type" DEFAULT 'survey' NOT NULL;--> statement-breakpoint
ALTER TABLE "survey_questions" ADD COLUMN "mapped_field" "mapped_field";--> statement-breakpoint
CREATE INDEX "survey_questions_type_idx" ON "survey_questions" USING btree ("question_type");