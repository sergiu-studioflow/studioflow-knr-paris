-- Per-client compliance rules — rich-text guardrails the AI generators must honour.
-- Applied to KNR Paris Neon project restless-violet-72045844 on 2026-05-12.
ALTER TABLE brands ADD COLUMN IF NOT EXISTS compliance_rules text;
