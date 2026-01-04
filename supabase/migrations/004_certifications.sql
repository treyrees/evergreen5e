-- Evergreen 5e Certifications Schema
-- This migration removes community features and adds certifications

-- ============================================
-- DROP COMMUNITY FEATURES
-- ============================================

-- Drop trigger on auth.users FIRST (must happen before function drop)
do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    drop trigger on_auth_user_created on auth.users;
  end if;
end $$;

-- Drop functions (CASCADE to handle any remaining dependencies)
drop function if exists public.handle_new_user cascade;
drop function if exists public.generate_unique_display_name cascade;
drop function if exists public.cast_vote cascade;
drop function if exists public.submit_item cascade;
drop function if exists public.get_items_to_vote cascade;
drop function if exists public.graduate_items cascade;

-- Drop tables (votes references community_items, community_items references profiles)
drop table if exists public.votes cascade;
drop table if exists public.community_items cascade;
drop table if exists public.profiles cascade;

-- ============================================
-- CERTIFICATIONS TABLE
-- Public balance certifications for magic items
-- ============================================

create table if not exists public.certifications (
  id uuid default gen_random_uuid() primary key,

  -- Optional user link (null for anonymous/free certifications)
  user_id uuid references auth.users on delete set null,

  -- Item identification
  item_name text not null,
  creator_name text, -- Optional creator attribution
  flavor_text text, -- Optional flavor description

  -- Item data
  base_item text not null,
  attunement boolean not null default false,
  combat jsonb not null, -- CombatFeatures
  ribbons jsonb, -- RibbonFeatures (optional)

  -- Calculated fields
  score numeric(5,2) not null,
  suggested_rarity text not null,

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Constraints
  constraint item_name_length check (char_length(item_name) >= 1 and char_length(item_name) <= 100),
  constraint creator_name_length check (creator_name is null or char_length(creator_name) <= 50),
  constraint flavor_text_length check (flavor_text is null or char_length(flavor_text) <= 500),
  constraint valid_rarity check (suggested_rarity in ('Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'))
);

-- Indexes
create index if not exists certifications_user_idx on public.certifications(user_id);
create index if not exists certifications_created_idx on public.certifications(created_at desc);
create index if not exists certifications_rarity_idx on public.certifications(suggested_rarity);

-- Enable RLS
alter table public.certifications enable row level security;

-- Policies: Certifications are public to view, users can manage their own
create policy "Certifications are viewable by everyone"
  on public.certifications for select
  using (true);

create policy "Anyone can create certifications"
  on public.certifications for insert
  with check (true);

create policy "Users can update their own certifications"
  on public.certifications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own certifications"
  on public.certifications for delete
  using (auth.uid() = user_id);
