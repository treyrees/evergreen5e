-- Seed data for testing the voting flow
-- Run this in Supabase SQL editor to populate test items
--
-- This script creates:
-- - 5 test users with profiles
-- - 10 community items with various rarities for voting

-- ============================================
-- STEP 1: Create test users in auth.users
-- ============================================

-- Note: In production, users are created via Discord OAuth.
-- For testing, we insert directly into auth.users which triggers profile creation.

DO $$
DECLARE
  test_user_ids uuid[] := ARRAY[
    'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
    'aaaaaaaa-0002-4000-8000-000000000002'::uuid,
    'aaaaaaaa-0003-4000-8000-000000000003'::uuid,
    'aaaaaaaa-0004-4000-8000-000000000004'::uuid,
    'aaaaaaaa-0005-4000-8000-000000000005'::uuid
  ];
  test_emails text[] := ARRAY[
    'test-dragon@evergreen5e.local',
    'test-wizard@evergreen5e.local',
    'test-paladin@evergreen5e.local',
    'test-rogue@evergreen5e.local',
    'test-bard@evergreen5e.local'
  ];
  display_names text[] := ARRAY[
    'DragonSlayer42',
    'ArcaneWizard',
    'HolyPaladin',
    'ShadowRogue',
    'MelodyBard'
  ];
  emojis text[] := ARRAY[
    '🐉',
    '🔮',
    '🛡️',
    '🗡️',
    '🎭'
  ];
  accent_colors text[] := ARRAY[
    'crimson',
    'amethyst',
    'gold',
    'obsidian',
    'sapphire'
  ];
  i integer;
BEGIN
  FOR i IN 1..5 LOOP
    -- Insert into auth.users if not exists
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    )
    VALUES (
      test_user_ids[i],
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      test_emails[i],
      crypt('test-password-123', gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object(
        'display_name', display_names[i],
        'emoji', emojis[i],
        'accent_color', accent_colors[i]
      )
    )
    ON CONFLICT (id) DO NOTHING;

    -- Ensure profile exists (trigger should create it, but just in case)
    INSERT INTO public.profiles (
      id,
      display_name,
      emoji,
      accent_color,
      tickets,
      total_votes
    )
    VALUES (
      test_user_ids[i],
      display_names[i],
      emojis[i],
      accent_colors[i],
      5, -- Give them some tickets
      0
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      emoji = EXCLUDED.emoji,
      accent_color = EXCLUDED.accent_color;
  END LOOP;
END $$;

-- ============================================
-- STEP 2: Insert community items for voting
-- ============================================

-- Delete any existing test items (to allow re-running)
DELETE FROM public.community_items
WHERE creator_id IN (
  'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
  'aaaaaaaa-0002-4000-8000-000000000002'::uuid,
  'aaaaaaaa-0003-4000-8000-000000000003'::uuid,
  'aaaaaaaa-0004-4000-8000-000000000004'::uuid,
  'aaaaaaaa-0005-4000-8000-000000000005'::uuid
);

-- Item 1: Uncommon - Simple +1 Sword (DragonSlayer42)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0001-4000-8000-000000000001',
  'Blade of the Ember',
  'longsword',
  false,
  '{"enhancement": 1, "damageBonus": {"dice": "1d4", "type": "fire"}}'::jsonb,
  '{}'::jsonb,
  'Flames flicker along the blade when drawn',
  1.4,
  'Uncommon',
  'DragonSlayer42',
  '🐉',
  'crimson',
  2,
  'pending'
);

-- Item 2: Rare - Staff with charges (ArcaneWizard)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0002-4000-8000-000000000002',
  'Staff of Frozen Stars',
  'quarterstaff',
  true,
  '{"enhancement": 1, "chargePool": {"maxCharges": 7, "chargesPerLongRest": 7, "chargesPerShortRest": 0, "abilities": [{"spell": "Ice Knife", "spellLevel": 1, "chargesPerUse": 1}, {"spell": "Hold Person", "spellLevel": 2, "chargesPerUse": 2}]}}'::jsonb,
  '{"exploration": ["glows faintly in starlight"]}'::jsonb,
  'Carved from eternal ice, never melts',
  2.1,
  'Rare',
  'ArcaneWizard',
  '🔮',
  'amethyst',
  5,
  'pending'
);

-- Item 3: Very Rare - Shield with AC and saves (HolyPaladin)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0003-4000-8000-000000000003',
  'Aegis of the Dawn',
  'shield',
  true,
  '{"enhancement": 0, "acBonus": 2, "savingThrowBonus": 1, "resistances": ["radiant"]}'::jsonb,
  '{"social": ["inspires courage in allies"]}'::jsonb,
  'Blessed by a solar, glows golden in the presence of undead',
  3.2,
  'Very Rare',
  'HolyPaladin',
  '🛡️',
  'gold',
  8,
  'pending'
);

-- Item 4: Uncommon - Dagger with conditional damage (ShadowRogue)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0004-4000-8000-000000000004',
  'Nightfang',
  'dagger',
  false,
  '{"enhancement": 1, "damageBonus": {"dice": "2d6", "type": "necrotic", "conditionalType": "environmental"}}'::jsonb,
  '{"mobilitySenses": ["darkens the area around the blade"]}'::jsonb,
  'Extra damage when fighting in dim light or darkness',
  1.2,
  'Uncommon',
  'ShadowRogue',
  '🗡️',
  'obsidian',
  1,
  'pending'
);

-- Item 5: Rare - Bow with special abilities (MelodyBard)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0005-4000-8000-000000000005',
  'Songbow of the Siren',
  'longbow',
  true,
  '{"enhancement": 1, "damageBonus": {"dice": "1d6", "type": "thunder"}, "advantage": ["attack"]}'::jsonb,
  '{"social": ["can play music with the bowstring"]}'::jsonb,
  'Arrows whistle melodically in flight',
  2.3,
  'Rare',
  'MelodyBard',
  '🎭',
  'sapphire',
  3,
  'pending'
);

-- Item 6: Legendary - Powerful hammer (DragonSlayer42)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0001-4000-8000-000000000001',
  'Worldbreaker',
  'maul',
  true,
  '{"enhancement": 3, "damageBonus": {"dice": "2d6", "type": "force"}, "abilityScoreSetter": {"ability": "STR", "setValue": 23}}'::jsonb,
  '{"exploration": ["ground trembles when planted"]}'::jsonb,
  'Forged from a fallen meteor, shatters stone on impact',
  5.4,
  'Legendary',
  'DragonSlayer42',
  '🐉',
  'crimson',
  9,
  'pending'
);

-- Item 7: Common - Simple charm (ArcaneWizard)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0002-4000-8000-000000000002',
  'Lucky Copper Coin',
  'wondrous item',
  false,
  '{"enhancement": 0, "advantage": ["initiative"]}'::jsonb,
  '{"cosmetic": ["always lands on heads"]}'::jsonb,
  'A worn copper coin that feels warm to the touch',
  0.4,
  'Common',
  'ArcaneWizard',
  '🔮',
  'amethyst',
  0,
  'pending'
);

-- Item 8: Rare - Armor with resistances (HolyPaladin)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0003-4000-8000-000000000003',
  'Dragonhide Plate',
  'plate armor',
  true,
  '{"enhancement": 1, "resistances": ["fire", "cold"]}'::jsonb,
  '{"cosmetic": ["scales shimmer in firelight"]}'::jsonb,
  'Crafted from the scales of an ancient dragon',
  2.4,
  'Rare',
  'HolyPaladin',
  '🛡️',
  'gold',
  4,
  'pending'
);

-- Item 9: Very Rare - Cloak with powerful defenses (ShadowRogue)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0004-4000-8000-000000000004',
  'Cloak of the Phantom',
  'cloak',
  true,
  '{"enhancement": 0, "acBonus": 1, "savingThrowBonus": 1, "conditionImmunities": ["charmed", "frightened"], "permanentBuffs": {"seeInvisibility": true}}'::jsonb,
  '{"mobilitySenses": ["billows dramatically even without wind"]}'::jsonb,
  'Woven from shadows and moonlight',
  3.8,
  'Very Rare',
  'ShadowRogue',
  '🗡️',
  'obsidian',
  7,
  'pending'
);

-- Item 10: Uncommon - Ring with utility (MelodyBard)
INSERT INTO public.community_items (
  creator_id, name, base_item, attunement, combat, ribbons, description,
  score, suggested_rarity, creator_display_name, creator_emoji, creator_accent_color,
  upvotes, status
) VALUES (
  'aaaaaaaa-0005-4000-8000-000000000005',
  'Ring of Echoes',
  'ring',
  true,
  '{"enhancement": 0, "spellSaveDCBonus": 1, "advantage": ["perception"]}'::jsonb,
  '{"social": ["voice carries clearly over long distances"]}'::jsonb,
  'Amplifies the wearers voice and hearing',
  1.1,
  'Uncommon',
  'MelodyBard',
  '🎭',
  'sapphire',
  2,
  'pending'
);

-- ============================================
-- VERIFICATION
-- ============================================

-- Show what was created
SELECT
  ci.name,
  ci.suggested_rarity,
  ci.score,
  ci.upvotes,
  ci.creator_display_name,
  ci.status
FROM public.community_items ci
WHERE ci.creator_id IN (
  'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
  'aaaaaaaa-0002-4000-8000-000000000002'::uuid,
  'aaaaaaaa-0003-4000-8000-000000000003'::uuid,
  'aaaaaaaa-0004-4000-8000-000000000004'::uuid,
  'aaaaaaaa-0005-4000-8000-000000000005'::uuid
)
ORDER BY ci.score DESC;

-- Show test profiles
SELECT
  p.display_name,
  p.emoji,
  p.accent_color,
  p.tickets
FROM public.profiles p
WHERE p.id IN (
  'aaaaaaaa-0001-4000-8000-000000000001'::uuid,
  'aaaaaaaa-0002-4000-8000-000000000002'::uuid,
  'aaaaaaaa-0003-4000-8000-000000000003'::uuid,
  'aaaaaaaa-0004-4000-8000-000000000004'::uuid,
  'aaaaaaaa-0005-4000-8000-000000000005'::uuid
);
