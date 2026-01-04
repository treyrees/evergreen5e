-- Add flavor_text column to saved_items, replacing special_mechanics and cosmetic_features

-- Add the new column
alter table public.saved_items add column if not exists flavor_text text;

-- Migrate existing data: combine special_mechanics and cosmetic_features into flavor_text
update public.saved_items
set flavor_text = coalesce(special_mechanics, '') ||
  case when special_mechanics is not null and cosmetic_features is not null then ' ' else '' end ||
  coalesce(cosmetic_features, '')
where flavor_text is null and (special_mechanics is not null or cosmetic_features is not null);

-- Note: We keep the old columns for backwards compatibility during transition
-- They can be dropped in a future migration after confirming all data is migrated
