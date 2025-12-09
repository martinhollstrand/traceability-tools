ALTER TABLE "report_metadata" ADD COLUMN "pdf_filename" text;--> statement-breakpoint
ALTER TABLE "report_metadata" ADD COLUMN "pdf_size" integer;--> statement-breakpoint
ALTER TABLE "report_metadata" ADD COLUMN "pdf_uploaded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "report_metadata" ADD COLUMN "pdf_uploaded_by" uuid;--> statement-breakpoint
ALTER TABLE "report_metadata" ADD CONSTRAINT "report_metadata_pdf_uploaded_by_admin_users_id_fk" FOREIGN KEY ("pdf_uploaded_by") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;