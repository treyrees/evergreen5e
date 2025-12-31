/**
 * Constants for the calculator page.
 * Static data with no dependencies.
 */

/**
 * Base item types organized by category
 */
export const BASE_ITEMS = {
  'Melee Weapons (Simple)': [
    'club',
    'dagger',
    'greatclub',
    'handaxe',
    'javelin',
    'mace',
    'quarterstaff',
    'spear',
  ],
  'Melee Weapons (Martial)': [
    'battleaxe',
    'flail',
    'glaive',
    'greataxe',
    'greatsword',
    'halberd',
    'lance',
    'longsword',
    'maul',
    'morningstar',
    'pike',
    'rapier',
    'scimitar',
    'shortsword',
    'trident',
    'warhammer',
    'whip',
  ],
  'Ranged Weapons': [
    'crossbow (hand)',
    'crossbow (heavy)',
    'crossbow (light)',
    'longbow',
    'shortbow',
  ],
  'Armor': [
    'armor (light)',
    'armor (medium)',
    'armor (heavy)',
    'shield',
  ],
  'Implements': [
    'rod',
    'staff',
    'wand',
  ],
  'Accessories': [
    'amulet',
    'boots',
    'cloak',
    'gloves',
    'ring',
  ],
  'Wondrous Items': [
    'wondrous item',
  ],
} as const;

/**
 * Helper set to check if a base item is a weapon
 */
export const WEAPON_ITEMS: Set<string> = new Set([
  ...BASE_ITEMS['Melee Weapons (Simple)'],
  ...BASE_ITEMS['Melee Weapons (Martial)'],
  ...BASE_ITEMS['Ranged Weapons'],
]);

/**
 * Helper set to check if a base item is armor/shield
 */
export const ARMOR_ITEMS: Set<string> = new Set([
  ...BASE_ITEMS['Armor'],
]);

/**
 * Available damage types for magic items
 */
export const DAMAGE_TYPES = [
  'fire',
  'cold',
  'lightning',
  'acid',
  'poison',
  'thunder',
  'radiant',
  'necrotic',
  'psychic',
  'force',
  'piercing',
  'slashing',
  'bludgeoning',
] as const;

/**
 * Conditions ordered by combat severity (most impactful first)
 */
export const CONDITIONS = [
  'paralyzed',
  'stunned',
  'petrified',
  'charmed',
  'frightened',
  'restrained',
  'poisoned',
  'blinded',
  'incapacitated',
  'prone',
  'grappled',
  'deafened',
  'exhaustion',
] as const;
