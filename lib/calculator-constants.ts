/**
 * Constants for the magic item calculator form.
 * Extracted to reduce main page file size.
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

export const WEAPON_ITEMS: Set<string> = new Set([
  ...BASE_ITEMS['Melee Weapons (Simple)'],
  ...BASE_ITEMS['Melee Weapons (Martial)'],
  ...BASE_ITEMS['Ranged Weapons'],
]);

export const ARMOR_ITEMS: Set<string> = new Set([
  ...BASE_ITEMS['Armor'],
]);

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
