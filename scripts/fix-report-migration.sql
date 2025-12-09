-- Manual fix script: Delete old singleton record before running migration
-- Run this if migration 0003 fails due to existing "report-singleton" record

-- Option 1: If column is still text type
DELETE FROM "report_metadata" WHERE "id" = 'report-singleton';

-- Option 2: If column is already UUID type (this will fail gracefully if not applicable)
-- DELETE FROM "report_metadata" WHERE "id"::text = 'report-singleton';
