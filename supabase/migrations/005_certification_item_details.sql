-- Add item stats and flavor text to certifications
-- These fields allow the certificate to display what makes the item special

-- Item enhancement bonuses (display only)
alter table public.certifications add column if not exists enhancement_bonus smallint;
alter table public.certifications add column if not exists ac_bonus smallint;
alter table public.certifications add column if not exists saving_throw_bonus smallint;

-- Extra damage (e.g., "2d6 fire")
alter table public.certifications add column if not exists extra_damage_dice text;
alter table public.certifications add column if not exists extra_damage_type text;

-- Charges description (e.g., "7 charges, regains 1d6+1 daily")
alter table public.certifications add column if not exists charges_description text;

-- Flavor text (cosmetic description, max 280 chars like a tweet)
alter table public.certifications add column if not exists flavor_text text;
alter table public.certifications add constraint flavor_text_length
  check (flavor_text is null or char_length(flavor_text) <= 280);
