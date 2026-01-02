-- Fix display name generation to use Discord usernames and ensure uniqueness
-- Run this migration in your Supabase SQL editor

-- Helper function to generate a unique display name
create or replace function public.generate_unique_display_name(
  p_preferred_name text
)
returns text
language plpgsql
security definer
as $$
declare
  v_base_name text;
  v_candidate text;
  v_suffix text;
  v_attempts integer := 0;
begin
  -- Clean and truncate the base name (max 25 chars to leave room for suffix)
  v_base_name := substring(
    regexp_replace(coalesce(p_preferred_name, 'Adventurer'), '[^a-zA-Z0-9_-]', '', 'g')
    from 1 for 25
  );

  -- Ensure minimum length
  if length(v_base_name) < 2 then
    v_base_name := 'Adventurer';
  end if;

  -- First try the base name as-is
  if not exists (select 1 from public.profiles where display_name = v_base_name) then
    return v_base_name;
  end if;

  -- Add random suffix until we find a unique name
  loop
    v_attempts := v_attempts + 1;

    -- Generate a 4-character alphanumeric suffix
    v_suffix := substring(
      replace(replace(encode(gen_random_bytes(3), 'base64'), '+', ''), '/', '')
      from 1 for 4
    );

    v_candidate := v_base_name || '-' || v_suffix;

    if not exists (select 1 from public.profiles where display_name = v_candidate) then
      return v_candidate;
    end if;

    -- Safety limit
    if v_attempts > 100 then
      -- Fall back to UUID-based name
      return 'Adventurer-' || substring(gen_random_uuid()::text from 1 for 8);
    end if;
  end loop;
end;
$$;

-- Update the handle_new_user function to use Discord metadata and generate unique names
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_preferred_name text;
  v_display_name text;
begin
  -- Try to get a name from various metadata sources
  -- Discord provides: full_name, name, user_name, preferred_username
  v_preferred_name := coalesce(
    new.raw_user_meta_data->>'display_name',     -- Explicit display_name (dev users)
    new.raw_user_meta_data->>'user_name',        -- Discord username (handle)
    new.raw_user_meta_data->>'preferred_username', -- Alternative Discord username
    new.raw_user_meta_data->>'name',             -- Discord display name
    new.raw_user_meta_data->>'full_name',        -- Discord full name
    'Adventurer'
  );

  -- Generate a unique display name
  v_display_name := public.generate_unique_display_name(v_preferred_name);

  insert into public.profiles (id, display_name, emoji, accent_color)
  values (
    new.id,
    v_display_name,
    coalesce(new.raw_user_meta_data->>'emoji', '⚔️'),
    coalesce(new.raw_user_meta_data->>'accent_color', 'silver')
  );
  return new;
end;
$$;

-- Add unique constraint on display_name to prevent future collisions
-- First, fix any existing duplicates by appending a suffix
do $$
declare
  r record;
  v_new_name text;
begin
  -- Find and fix duplicates
  for r in (
    select id, display_name, row_number() over (partition by display_name order by created_at) as rn
    from public.profiles
  )
  loop
    if r.rn > 1 then
      v_new_name := public.generate_unique_display_name(r.display_name);
      update public.profiles set display_name = v_new_name where id = r.id;
    end if;
  end loop;
end $$;

-- Now add the unique constraint
alter table public.profiles
  add constraint profiles_display_name_unique unique (display_name);
