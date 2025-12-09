-- Step 1: Delete the old singleton record (if it exists)
-- Note: This may fail if column is already UUID, but that's okay
DELETE FROM "report_metadata" WHERE "id"::text = 'report-singleton';--> statement-breakpoint
-- Step 2: Drop default before changing type
ALTER TABLE "report_metadata" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
-- Step 3: Change column type to UUID, generating new UUIDs for any existing records
ALTER TABLE "report_metadata" ALTER COLUMN "id" SET DATA TYPE uuid USING gen_random_uuid();--> statement-breakpoint
-- Step 4: Set new default
ALTER TABLE "report_metadata" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
