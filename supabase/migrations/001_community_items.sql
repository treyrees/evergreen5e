-- Evergreen 5e Community Items Schema
-- Run this migration in your Supabase SQL editor

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  emoji text not null default '⚔️',
  accent_color text not null default 'silver',
  tickets integer not null default 0,
  total_votes integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Constraints
  constraint display_name_length check (char_length(display_name) >= 2 and char_length(display_name) <= 30),
  constraint valid_accent_color check (accent_color in ('crimson', 'amber', 'gold', 'emerald', 'sapphire', 'amethyst', 'silver', 'obsidian')),
  constraint tickets_non_negative check (tickets >= 0),
  constraint total_votes_non_negative check (total_votes >= 0)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, emoji, accent_color)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Adventurer'),
    coalesce(new.raw_user_meta_data->>'emoji', '⚔️'),
    coalesce(new.raw_user_meta_data->>'accent_color', 'silver')
  );
  return new;
end;
$$;

-- Trigger to auto-create profile
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- COMMUNITY_ITEMS TABLE
-- Stores user-submitted magic items
-- ============================================

create table if not exists public.community_items (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,

  -- Item data (stored as JSONB for flexibility)
  name text not null,
  base_item text not null,
  attunement boolean not null default false,
  combat jsonb not null, -- CombatFeatures
  ribbons jsonb, -- RibbonFeatures (optional)
  description text, -- Special mechanics description

  -- Calculated fields
  score numeric(5,2) not null,
  suggested_rarity text not null,

  -- Denormalized creator info for display
  creator_display_name text not null,
  creator_emoji text not null,
  creator_accent_color text not null,

  -- Voting & status
  upvotes integer not null default 0,
  status text not null default 'pending',

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  graduated_at timestamp with time zone,

  -- Constraints
  constraint name_length check (char_length(name) >= 2 and char_length(name) <= 100),
  constraint valid_status check (status in ('pending', 'graduated')),
  constraint valid_rarity check (suggested_rarity in ('Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary')),
  constraint upvotes_non_negative check (upvotes >= 0)
);

-- Indexes for common queries
create index if not exists community_items_status_idx on public.community_items(status);
create index if not exists community_items_creator_idx on public.community_items(creator_id);
create index if not exists community_items_upvotes_idx on public.community_items(upvotes desc);
create index if not exists community_items_created_at_idx on public.community_items(created_at desc);

-- Enable RLS
alter table public.community_items enable row level security;

-- Policies for community_items
create policy "Graduated items are viewable by everyone"
  on public.community_items for select
  using (status = 'graduated');

create policy "Pending items are viewable by authenticated users"
  on public.community_items for select
  using (status = 'pending' and auth.role() = 'authenticated');

create policy "Users can view their own items"
  on public.community_items for select
  using (auth.uid() = creator_id);

create policy "Authenticated users can insert items"
  on public.community_items for insert
  with check (auth.uid() = creator_id);

create policy "Users can update their own pending items"
  on public.community_items for update
  using (auth.uid() = creator_id and status = 'pending');

create policy "Users can delete their own pending items"
  on public.community_items for delete
  using (auth.uid() = creator_id and status = 'pending');

-- ============================================
-- VOTES TABLE
-- Tracks user votes on submissions
-- ============================================

create table if not exists public.votes (
  id uuid default gen_random_uuid() primary key,
  voter_id uuid references public.profiles(id) on delete cascade not null,
  submission_id uuid references public.community_items(id) on delete cascade not null,
  vote text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Constraints
  constraint valid_vote check (vote in ('up', 'pass')),
  constraint unique_vote unique (voter_id, submission_id)
);

-- Indexes
create index if not exists votes_voter_idx on public.votes(voter_id);
create index if not exists votes_submission_idx on public.votes(submission_id);

-- Enable RLS
alter table public.votes enable row level security;

-- Policies for votes
create policy "Users can view their own votes"
  on public.votes for select
  using (auth.uid() = voter_id);

create policy "Authenticated users can insert votes"
  on public.votes for insert
  with check (auth.uid() = voter_id);

-- Users cannot update or delete votes (votes are final)

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle voting (increments upvotes and user's total_votes)
create or replace function public.cast_vote(
  p_submission_id uuid,
  p_vote text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_voter_id uuid;
  v_submission_creator_id uuid;
  v_new_total_votes integer;
  v_earned_ticket boolean := false;
begin
  -- Get current user
  v_voter_id := auth.uid();
  if v_voter_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get submission creator (can't vote on your own items)
  select creator_id into v_submission_creator_id
  from public.community_items
  where id = p_submission_id and status = 'pending';

  if v_submission_creator_id is null then
    raise exception 'Submission not found or not pending';
  end if;

  if v_submission_creator_id = v_voter_id then
    raise exception 'Cannot vote on your own submission';
  end if;

  -- Insert vote (will fail on duplicate due to unique constraint)
  insert into public.votes (voter_id, submission_id, vote)
  values (v_voter_id, p_submission_id, p_vote);

  -- If upvote, increment the item's upvotes
  if p_vote = 'up' then
    update public.community_items
    set upvotes = upvotes + 1
    where id = p_submission_id;
  end if;

  -- Increment voter's total_votes and check for earned ticket
  update public.profiles
  set total_votes = total_votes + 1
  where id = v_voter_id
  returning total_votes into v_new_total_votes;

  -- Award ticket every 15 votes
  if v_new_total_votes % 15 = 0 then
    update public.profiles
    set tickets = tickets + 1
    where id = v_voter_id;
    v_earned_ticket := true;
  end if;

  return jsonb_build_object(
    'success', true,
    'earned_ticket', v_earned_ticket,
    'total_votes', v_new_total_votes
  );
end;
$$;

-- Function to submit an item (consumes a ticket)
create or replace function public.submit_item(
  p_name text,
  p_base_item text,
  p_attunement boolean,
  p_combat jsonb,
  p_ribbons jsonb,
  p_description text,
  p_score numeric,
  p_suggested_rarity text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_profile record;
  v_item_id uuid;
begin
  -- Get current user
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Get profile and check tickets
  select * into v_profile
  from public.profiles
  where id = v_user_id;

  if v_profile.tickets < 1 then
    raise exception 'No tickets available';
  end if;

  -- Consume ticket
  update public.profiles
  set tickets = tickets - 1
  where id = v_user_id;

  -- Insert item
  insert into public.community_items (
    creator_id,
    name,
    base_item,
    attunement,
    combat,
    ribbons,
    description,
    score,
    suggested_rarity,
    creator_display_name,
    creator_emoji,
    creator_accent_color
  )
  values (
    v_user_id,
    p_name,
    p_base_item,
    p_attunement,
    p_combat,
    p_ribbons,
    p_description,
    p_score,
    p_suggested_rarity,
    v_profile.display_name,
    v_profile.emoji,
    v_profile.accent_color
  )
  returning id into v_item_id;

  return v_item_id;
end;
$$;

-- Function to get random pending items for voting (excludes user's own items and already voted)
create or replace function public.get_items_to_vote(p_limit integer default 10)
returns setof public.community_items
language sql
security definer
stable
as $$
  select ci.*
  from public.community_items ci
  where ci.status = 'pending'
    and ci.creator_id != auth.uid()
    and not exists (
      select 1 from public.votes v
      where v.submission_id = ci.id
        and v.voter_id = auth.uid()
    )
  order by random()
  limit p_limit;
$$;

-- Function to graduate items (called periodically or by admin)
-- Items with 10+ upvotes become graduated
create or replace function public.graduate_items()
returns integer
language plpgsql
security definer
as $$
declare
  v_count integer;
begin
  update public.community_items
  set
    status = 'graduated',
    graduated_at = now()
  where status = 'pending'
    and upvotes >= 10;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
