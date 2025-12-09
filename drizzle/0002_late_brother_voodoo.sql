ALTER TABLE "report_metadata" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "report_metadata" ALTER COLUMN "id" SET DEFAULT 'report-singleton';