-- Add flavor_text column to saved_items, replacing special_mechanics and cosmetic_features
-- This migration is optional - saved_items table may not exist in all environments

DO $$
BEGIN
  -- Only run if saved_items table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_items') THEN
    -- Add the new column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'saved_items' AND column_name = 'flavor_text') THEN
      ALTER TABLE public.saved_items ADD COLUMN flavor_text text;
    END IF;

    -- Migrate existing data: combine special_mechanics and cosmetic_features into flavor_text
    UPDATE public.saved_items
    SET flavor_text = coalesce(special_mechanics, '') ||
      case when special_mechanics is not null and cosmetic_features is not null then ' ' else '' end ||
      coalesce(cosmetic_features, '')
    WHERE flavor_text IS NULL AND (special_mechanics IS NOT NULL OR cosmetic_features IS NOT NULL);
  END IF;
END $$;

-- Note: We keep the old columns for backwards compatibility during transition
-- They can be dropped in a future migration after confirming all data is migrated
