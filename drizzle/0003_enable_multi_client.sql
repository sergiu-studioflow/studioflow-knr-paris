-- Enable multi_client feature flag for KNR Paris (agency portal)
UPDATE "app_config"
SET "features" = COALESCE("features", '{}'::jsonb) || '{"multi_client": true}'::jsonb
WHERE NOT (COALESCE("features", '{}'::jsonb) ? 'multi_client');
