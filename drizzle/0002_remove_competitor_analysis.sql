-- Remove Competitor Analysis system tables
-- Order matters: drop tables with FK references first

DROP TABLE IF EXISTS "creative_briefs" CASCADE;
DROP TABLE IF EXISTS "competitor_lookup_requests" CASCADE;
DROP TABLE IF EXISTS "analyzed_ads" CASCADE;
DROP TABLE IF EXISTS "scraped_ads" CASCADE;
DROP TABLE IF EXISTS "intelligence_reports" CASCADE;
DROP TABLE IF EXISTS "competitors" CASCADE;
