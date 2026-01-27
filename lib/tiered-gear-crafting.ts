/**
 * Tiered Gear Crafting System
 *
 * This module defines the progression system for gear acquisition:
 *
 * LOOT BOXES (Competing/Keys):
 * - Can drop ANY archetype regardless of player level
 * - Can drop ANY rarity (subject to soft caps)
 * - This is the primary source for Very Rare and Legendary gear
 *
 * CRAFTING (Deterministic):
 * - Archetype access is gated by player level tier
 * - Rarity output is fixed by tier (no RNG)
 * - Provides reliable way to get specific gear
 *
 * Level Tiers:
 * - Tier 1 (Levels 1-10):  5 archetypes available → Always crafts Common
 * - Tier 2 (Levels 10-20): +4 archetypes (9 total) → Always crafts Uncommon
 * - Tier 3 (Levels 20-30): +3 archetypes (12 total) → Always crafts Rare
 */

import type { Rarity } from '@/types/magic-item';

// ============================================================================
// CRAFTING TIER DEFINITIONS
// ============================================================================

export interface CraftingTier {
  /** Tier identifier */
  tier: 1 | 2 | 3;
  /** Minimum player level for this tier (inclusive) */
  minLevel: number;
  /** Maximum player level for this tier (inclusive) */
  maxLevel: number;
  /** Rarity of all crafted items in this tier */
  craftedRarity: Extract<Rarity, 'Common' | 'Uncommon' | 'Rare'>;
  /** Archetype IDs unlocked at this tier (cumulative with previous tiers) */
  newArchetypes: string[];
}

export const CRAFTING_TIERS: readonly CraftingTier[] = [
  {
    tier: 1,
    minLevel: 1,
    maxLevel: 10,
    craftedRarity: 'Common',
    // Starter archetypes: accessible themes for new players
    newArchetypes: [
      'pyromancer',      // Fire - classic elemental, easy to understand
      'cryomancer',      // Cold - classic elemental counterpart
      'berserker',       // Warrior - straightforward combat theme
      'sentinel',        // Defender - tanky, protective theme
      'beast-lord',      // Nature - animal/primal theme
    ],
  },
  {
    tier: 2,
    minLevel: 10,
    maxLevel: 20,
    craftedRarity: 'Uncommon',
    // Intermediate archetypes: more specialized themes
    newArchetypes: [
      'stormcaller',     // Lightning/thunder - dynamic elemental
      'radiant-champion', // Divine - holy warrior theme
      'shadow-walker',   // Necrotic - dark magic theme
      'venomancer',      // Poison - debuff/control specialist
    ],
  },
  {
    tier: 3,
    minLevel: 20,
    maxLevel: 30,
    craftedRarity: 'Rare',
    // Advanced archetypes: complex or powerful themes
    newArchetypes: [
      'arcanist',        // Force/utility - arcane mastery
      'mind-flayer',     // Psychic - mental domination
      'void-touched',    // Exotic - eldritch/planar theme
      // Note: 'draconic' archetype reserved for loot-only (13th archetype)
    ],
  },
] as const;

// ============================================================================
// ARCHETYPE REGISTRY
// ============================================================================

/**
 * Maps archetype IDs to display names and metadata.
 * IDs use kebab-case for consistency, display names are title case.
 */
export interface ArchetypeInfo {
  id: string;
  displayName: string;
  description: string;
  /** If true, this archetype can only be obtained through loot, never crafted */
  lootOnly?: boolean;
}

export const ARCHETYPE_REGISTRY: Record<string, ArchetypeInfo> = {
  // Tier 1 - Starter Archetypes (Levels 1-10)
  'pyromancer': {
    id: 'pyromancer',
    displayName: 'Pyromancer',
    description: 'Fire damage, fire resistance, fire spells',
  },
  'cryomancer': {
    id: 'cryomancer',
    displayName: 'Cryomancer',
    description: 'Cold damage, cold resistance, cold spells',
  },
  'berserker': {
    id: 'berserker',
    displayName: 'Berserker',
    description: 'Thunder/lightning damage, speed bonuses, rage-themed',
  },
  'sentinel': {
    id: 'sentinel',
    displayName: 'Sentinel',
    description: 'Defensive focus, multiple resistances, protection spells',
  },
  'beast-lord': {
    id: 'beast-lord',
    displayName: 'Beast Lord',
    description: 'Nature theme, movement buffs, animal-inspired',
  },

  // Tier 2 - Intermediate Archetypes (Levels 10-20)
  'stormcaller': {
    id: 'stormcaller',
    displayName: 'Stormcaller',
    description: 'Lightning/thunder damage, speed, storm spells',
  },
  'radiant-champion': {
    id: 'radiant-champion',
    displayName: 'Radiant Champion',
    description: 'Radiant damage, healing spells, divine theme',
  },
  'shadow-walker': {
    id: 'shadow-walker',
    displayName: 'Shadow Walker',
    description: 'Necrotic damage, darkness, shadow magic',
  },
  'venomancer': {
    id: 'venomancer',
    displayName: 'Venomancer',
    description: 'Poison damage, debuffs, control spells',
  },

  // Tier 3 - Advanced Archetypes (Levels 20-30)
  'arcanist': {
    id: 'arcanist',
    displayName: 'Arcanist',
    description: 'Force damage, utility spells, arcane mastery',
  },
  'mind-flayer': {
    id: 'mind-flayer',
    displayName: 'Mind Flayer',
    description: 'Psychic damage, enchantment, mental domination',
  },
  'void-touched': {
    id: 'void-touched',
    displayName: 'Void Touched',
    description: 'Force/psychic damage, teleportation, eldritch theme',
  },

  // Loot-Only Archetype (never craftable)
  'draconic': {
    id: 'draconic',
    displayName: 'Draconic',
    description: 'Multi-element damage, extensive resistances, flight',
    lootOnly: true,
  },
};

// ============================================================================
// LOOT BOX CONFIGURATION
// ============================================================================

/**
 * Loot box (competing/keys) configuration.
 * Loot boxes can drop ANY archetype and ANY rarity (up to soft caps).
 */
export interface LootBoxConfig {
  /** All archetypes that can drop from loot boxes */
  availableArchetypes: string[];
  /** Rarity weights for drops (higher = more common) */
  rarityWeights: Record<Rarity, number>;
  /** Soft cap: maximum rarity that can drop at each player level range */
  raritySoftCaps: Array<{
    minLevel: number;
    maxLevel: number;
    maxRarity: Rarity;
  }>;
}

export const LOOT_BOX_CONFIG: LootBoxConfig = {
  // ALL archetypes can drop from loot, including loot-only ones
  availableArchetypes: Object.keys(ARCHETYPE_REGISTRY),

  // Rarity weights (Legendary is rare, Common is frequent)
  rarityWeights: {
    'Common': 30,
    'Uncommon': 35,
    'Rare': 20,
    'Very Rare': 10,
    'Legendary': 4,
    'Legendary*': 1, // Ultra-rare imbalanced items
  },

  // Soft caps prevent high-rarity drops at low levels
  raritySoftCaps: [
    { minLevel: 1, maxLevel: 5, maxRarity: 'Uncommon' },
    { minLevel: 6, maxLevel: 10, maxRarity: 'Rare' },
    { minLevel: 11, maxLevel: 15, maxRarity: 'Very Rare' },
    { minLevel: 16, maxLevel: 30, maxRarity: 'Legendary' },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the crafting tier for a given player level.
 */
export function getCraftingTier(level: number): CraftingTier {
  if (level < 1) level = 1;
  if (level > 30) level = 30;

  for (const tier of CRAFTING_TIERS) {
    if (level >= tier.minLevel && level <= tier.maxLevel) {
      return tier;
    }
  }
  // Fallback to tier 1
  return CRAFTING_TIERS[0];
}

/**
 * Get all archetypes available for crafting at a given player level.
 * Returns cumulative list (all unlocked archetypes up to current tier).
 */
export function getAvailableCraftingArchetypes(level: number): ArchetypeInfo[] {
  const currentTier = getCraftingTier(level);
  const available: ArchetypeInfo[] = [];

  for (const tier of CRAFTING_TIERS) {
    // Add all archetypes from this tier and previous tiers
    for (const archetypeId of tier.newArchetypes) {
      const info = ARCHETYPE_REGISTRY[archetypeId];
      if (info && !info.lootOnly) {
        available.push(info);
      }
    }
    // Stop once we've processed the current tier
    if (tier.tier === currentTier.tier) break;
  }

  return available;
}

/**
 * Get the fixed rarity for crafted items at a given player level.
 */
export function getCraftedRarity(level: number): Extract<Rarity, 'Common' | 'Uncommon' | 'Rare'> {
  return getCraftingTier(level).craftedRarity;
}

/**
 * Check if a specific archetype is available for crafting at a given level.
 */
export function canCraftArchetype(archetypeId: string, level: number): boolean {
  const info = ARCHETYPE_REGISTRY[archetypeId];
  if (!info || info.lootOnly) return false;

  const available = getAvailableCraftingArchetypes(level);
  return available.some(a => a.id === archetypeId);
}

/**
 * Get the maximum rarity that can drop from loot at a given player level.
 */
export function getMaxLootRarity(level: number): Rarity {
  for (const cap of LOOT_BOX_CONFIG.raritySoftCaps) {
    if (level >= cap.minLevel && level <= cap.maxLevel) {
      return cap.maxRarity;
    }
  }
  return 'Legendary'; // No cap at high levels
}

/**
 * Get all archetypes that can drop from loot boxes (all of them).
 */
export function getLootArchetypes(): ArchetypeInfo[] {
  return LOOT_BOX_CONFIG.availableArchetypes.map(id => ARCHETYPE_REGISTRY[id]);
}

/**
 * Summary of the crafting progression for display purposes.
 */
export function getCraftingProgressionSummary(): Array<{
  tier: number;
  levelRange: string;
  craftedRarity: string;
  archetypeCount: number;
  newArchetypes: string[];
  totalArchetypes: string[];
}> {
  let cumulative: string[] = [];

  return CRAFTING_TIERS.map(tier => {
    cumulative = [...cumulative, ...tier.newArchetypes];
    return {
      tier: tier.tier,
      levelRange: `${tier.minLevel}-${tier.maxLevel}`,
      craftedRarity: tier.craftedRarity,
      archetypeCount: cumulative.length,
      newArchetypes: tier.newArchetypes.map(id => ARCHETYPE_REGISTRY[id]?.displayName || id),
      totalArchetypes: cumulative.map(id => ARCHETYPE_REGISTRY[id]?.displayName || id),
    };
  });
}
