-- Add item_attributes column to certifications
-- Stores the full list of item attributes as JSON for display on the certificate
-- Format: [{"label": "Enhancement", "value": "+1 bonus to attack and damage rolls"}, ...]

alter table public.certifications add column if not exists item_attributes jsonb;
