-- Saved Items - Private user item collection
-- Run this migration in your Supabase SQL editor

-- ============================================
-- SAVED_ITEMS TABLE
-- Stores user's private saved items
-- ============================================

create table if not exists public.saved_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,

  -- Item data
  name text not null,
  base_item text not null,
  attunement boolean not null default false,
  combat jsonb not null, -- CombatFeatures
  ribbons jsonb, -- RibbonFeatures (optional)
  special_mechanics text, -- Power-affecting notes
  cosmetic_features text, -- Flavor text

  -- Calculated fields (stored for quick display)
  score numeric(5,2) not null,
  suggested_rarity text not null,

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Constraints
  constraint name_length check (char_length(name) >= 1 and char_length(name) <= 100),
  constraint valid_rarity check (suggested_rarity in ('Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'))
);

-- Indexes
create index if not exists saved_items_user_idx on public.saved_items(user_id);
create index if not exists saved_items_updated_idx on public.saved_items(updated_at desc);

-- Enable RLS
alter table public.saved_items enable row level security;

-- Policies: Users can only access their own items
create policy "Users can view their own saved items"
  on public.saved_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved items"
  on public.saved_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved items"
  on public.saved_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved items"
  on public.saved_items for delete
  using (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger for updated_at
create trigger saved_items_updated_at
  before update on public.saved_items
  for each row execute procedure public.handle_updated_at();
