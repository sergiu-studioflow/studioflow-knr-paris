-- Migration: Convert brand_intelligence from single-row to multi-brand
-- Adds brand_id FK, type, notion_page_id, owner_name columns
-- Drops airtable_record_id column

ALTER TABLE "brand_intelligence" ADD COLUMN "brand_id" uuid REFERENCES "brands"("id") ON DELETE CASCADE;
ALTER TABLE "brand_intelligence" ADD COLUMN "type" text;
ALTER TABLE "brand_intelligence" ADD COLUMN "notion_page_id" text;
ALTER TABLE "brand_intelligence" ADD COLUMN "owner_name" text;
ALTER TABLE "brand_intelligence" DROP COLUMN IF EXISTS "airtable_record_id";

-- Remove the default on title (no longer singleton)
ALTER TABLE "brand_intelligence" ALTER COLUMN "title" DROP DEFAULT;
