-- Certifications Migration
-- Removes community features and adds certifications table
--
-- This migration:
-- 1. Drops the trigger and functions that depend on auth.users
-- 2. Drops community tables (votes, community_items, profiles)
-- 3. Creates the certifications table

-- ============================================
-- STEP 1: DROP TRIGGER ON AUTH.USERS
-- Must be done first since it depends on handle_new_user()
-- ============================================

-- Drop the trigger that fires on auth.users inserts
-- This must succeed before we can drop handle_new_user()
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- STEP 2: DROP FUNCTIONS
-- Using CASCADE to automatically drop any remaining dependencies
-- ============================================

-- Drop community functions
DROP FUNCTION IF EXISTS public.cast_vote CASCADE;
DROP FUNCTION IF EXISTS public.submit_item CASCADE;
DROP FUNCTION IF EXISTS public.get_items_to_vote CASCADE;
DROP FUNCTION IF EXISTS public.graduate_items CASCADE;

-- Drop profile-related functions (CASCADE handles any remaining trigger deps)
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.generate_unique_display_name CASCADE;

-- Drop saved_items trigger function
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;

-- ============================================
-- STEP 3: DROP TABLES
-- Order matters due to foreign key constraints
-- ============================================

-- Drop in reverse dependency order
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.community_items CASCADE;
DROP TABLE IF EXISTS public.saved_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- STEP 4: CREATE CERTIFICATIONS TABLE
-- Stores balance certifications for magic items
-- ============================================

CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Optional user association (null for anonymous certifications)
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,

  -- Item data
  name text NOT NULL,
  base_item text NOT NULL,
  attunement boolean NOT NULL DEFAULT false,
  combat jsonb NOT NULL,
  ribbons jsonb,
  special_mechanics text,
  cosmetic_features text,

  -- Calculated balance data
  score numeric(5,2) NOT NULL,
  suggested_rarity text NOT NULL,

  -- Timestamps
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Constraints
  CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT valid_rarity CHECK (suggested_rarity IN ('Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS certifications_user_idx ON public.certifications(user_id);
CREATE INDEX IF NOT EXISTS certifications_created_idx ON public.certifications(created_at DESC);
CREATE INDEX IF NOT EXISTS certifications_rarity_idx ON public.certifications(suggested_rarity);

-- Enable RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Anyone can create certifications (including anonymous users)
CREATE POLICY "Anyone can create certifications"
  ON public.certifications FOR INSERT
  WITH CHECK (true);

-- Users can view their own certifications
CREATE POLICY "Users can view their own certifications"
  ON public.certifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own certifications
CREATE POLICY "Users can update their own certifications"
  ON public.certifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own certifications
CREATE POLICY "Users can delete their own certifications"
  ON public.certifications FOR DELETE
  USING (auth.uid() = user_id);
