/**
 * Surprise item generator for the calculator page.
 * Generates random magic items with balanced attributes and thematic coherence.
 *
 * The generator uses "item archetypes" to create items with consistent themes.
 * For example, a "pyromancer" archetype will have fire damage, fire spells,
 * fire resistance, and fire-themed names.
 */

import { DamageBonus, ChargedAbility, AbilityScoreSetter, PermanentBuffs } from '@/types/magic-item';
import { generateRandomItemNameForBase } from '@/lib/item-name-generator';
import { BASE_ITEMS, WEAPON_ITEMS, ARMOR_ITEMS } from '@/lib/calculator-constants';

/**
 * Configuration for a generated surprise item
 */
export interface SurpriseItemConfig {
  itemName: string;
  baseItem: string;
  enhancement: number;
  attunement: boolean;
  damageBonus: DamageBonus | undefined;
  acBonus: number;
  savingThrowBonus: number;
  resistances: string[];
  conditionImmunities: string[];
  spellSaveDCBonus: number;
  spellAttackBonus: number;
  abilityScoreSetter: AbilityScoreSetter | undefined;
  permanentBuffs: PermanentBuffs;
  maxCharges: number;
  chargesPerShortRest: number;
  chargesPerLongRest: number;
  abilities: ChargedAbility[];
}

// ============================================================================
// ITEM ARCHETYPES - Themed item generation templates
// ============================================================================

interface ItemArchetype {
  name: string;
  weight: number; // Higher = more common
  theme: string; // For themed name generation
  damageTypes: string[];
  resistances: string[];
  conditions: string[];
  spellThemes: string[];
  buffs: (keyof PermanentBuffs)[];
  abilityScores: ('STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA')[];
  preferredCategories: ('weapon' | 'armor' | 'trinket')[];
}

const ITEM_ARCHETYPES: ItemArchetype[] = [
  // ELEMENTAL ARCHETYPES
  {
    name: 'Pyromancer',
    weight: 10,
    theme: 'fire',
    damageTypes: ['fire'],
    resistances: ['fire', 'cold'],
    conditions: ['frightened'],
    spellThemes: ['fire'],
    buffs: ['darkvision'],
    abilityScores: ['INT', 'CHA'],
    preferredCategories: ['weapon', 'trinket'],
  },
  {
    name: 'Cryomancer',
    weight: 10,
    theme: 'cold',
    damageTypes: ['cold'],
    resistances: ['cold', 'fire'],
    conditions: ['paralyzed'],
    spellThemes: ['cold'],
    buffs: ['swimming'],
    abilityScores: ['INT', 'WIS'],
    preferredCategories: ['weapon', 'trinket'],
  },
  {
    name: 'Stormcaller',
    weight: 10,
    theme: 'lightning',
    damageTypes: ['lightning', 'thunder'],
    resistances: ['lightning', 'thunder'],
    conditions: ['stunned'],
    spellThemes: ['lightning', 'thunder'],
    buffs: ['speedBonus', 'flight'],
    abilityScores: ['DEX', 'CHA'],
    preferredCategories: ['weapon', 'trinket'],
  },

  // DIVINE/UNDEAD ARCHETYPES
  {
    name: 'Radiant Champion',
    weight: 8,
    theme: 'radiant',
    damageTypes: ['radiant'],
    resistances: ['radiant', 'necrotic'],
    conditions: ['frightened', 'charmed'],
    spellThemes: ['radiant', 'healing'],
    buffs: ['darkvision'],
    abilityScores: ['WIS', 'CHA', 'STR'],
    preferredCategories: ['weapon', 'armor'],
  },
  {
    name: 'Shadow Walker',
    weight: 8,
    theme: 'necrotic',
    damageTypes: ['necrotic'],
    resistances: ['necrotic', 'poison'],
    conditions: ['poisoned', 'frightened'],
    spellThemes: ['shadow', 'enchantment'],
    buffs: ['darkvision'],
    abilityScores: ['DEX', 'INT', 'CHA'],
    preferredCategories: ['weapon', 'trinket'],
  },

  // ARCANE ARCHETYPES
  {
    name: 'Arcanist',
    weight: 8,
    theme: 'force',
    damageTypes: ['force'],
    resistances: ['psychic'],
    conditions: ['charmed'],
    spellThemes: ['force', 'utility', 'teleportation'],
    buffs: ['flight'],
    abilityScores: ['INT'],
    preferredCategories: ['trinket'],
  },
  {
    name: 'Mind Flayer',
    weight: 5,
    theme: 'psychic',
    damageTypes: ['psychic'],
    resistances: ['psychic'],
    conditions: ['charmed', 'stunned'],
    spellThemes: ['enchantment', 'illusion'],
    buffs: [],
    abilityScores: ['INT', 'WIS', 'CHA'],
    preferredCategories: ['trinket'],
  },

  // WARRIOR ARCHETYPES
  {
    name: 'Berserker',
    weight: 10,
    theme: 'thunder',
    damageTypes: ['thunder', 'lightning'],
    resistances: ['thunder'],
    conditions: ['frightened'],
    spellThemes: ['buff'],
    buffs: ['speedBonus'],
    abilityScores: ['STR', 'CON'],
    preferredCategories: ['weapon', 'armor'],
  },
  {
    name: 'Sentinel',
    weight: 10,
    theme: 'radiant',
    damageTypes: ['radiant'],
    resistances: ['fire', 'cold', 'lightning'],
    conditions: ['paralyzed', 'stunned', 'poisoned'],
    spellThemes: ['defense', 'healing'],
    buffs: [],
    abilityScores: ['CON', 'WIS', 'STR'],
    preferredCategories: ['armor'],
  },

  // NATURE ARCHETYPES
  {
    name: 'Venomancer',
    weight: 6,
    theme: 'poison',
    damageTypes: ['poison'],
    resistances: ['poison', 'acid'],
    conditions: ['poisoned'],
    spellThemes: ['control', 'debuff'],
    buffs: ['climbBurrow', 'swimming'],
    abilityScores: ['DEX', 'CON'],
    preferredCategories: ['weapon', 'trinket'],
  },
  {
    name: 'Beast Lord',
    weight: 6,
    theme: 'thunder',
    damageTypes: ['thunder'],
    resistances: ['poison'],
    conditions: ['frightened', 'charmed'],
    spellThemes: ['buff', 'movement'],
    buffs: ['darkvision', 'swimming', 'climbBurrow'],
    abilityScores: ['WIS', 'STR', 'CON'],
    preferredCategories: ['weapon', 'armor'],
  },

  // SPECIAL ARCHETYPES
  {
    name: 'Void Touched',
    weight: 4,
    theme: 'force',
    damageTypes: ['force', 'psychic'],
    resistances: ['psychic', 'necrotic'],
    conditions: ['charmed', 'frightened'],
    spellThemes: ['teleportation', 'illusion', 'force'],
    buffs: ['flight'],
    abilityScores: ['INT', 'WIS'],
    preferredCategories: ['trinket'],
  },
  {
    name: 'Draconic',
    weight: 5,
    theme: 'fire',
    damageTypes: ['fire', 'cold', 'lightning', 'poison'],
    resistances: ['fire', 'cold', 'lightning', 'acid', 'poison'],
    conditions: ['frightened'],
    spellThemes: ['fire', 'cold', 'lightning'],
    buffs: ['flight', 'darkvision'],
    abilityScores: ['STR', 'CHA', 'CON'],
    preferredCategories: ['weapon', 'armor'],
  },
];

// ============================================================================
// SPELL DATABASE - Organized by theme for coherent generation
// ============================================================================

interface SpellEntry {
  name: string;
  level: number;
  themes: string[];
}

const SPELL_DATABASE: SpellEntry[] = [
  // Level 1 Spells
  { name: 'Magic Missile', level: 1, themes: ['force', 'utility'] },
  { name: 'Shield', level: 1, themes: ['defense', 'force'] },
  { name: 'Cure Wounds', level: 1, themes: ['healing'] },
  { name: 'Faerie Fire', level: 1, themes: ['utility', 'radiant'] },
  { name: 'Thunderwave', level: 1, themes: ['thunder'] },
  { name: 'Burning Hands', level: 1, themes: ['fire'] },
  { name: 'Detect Magic', level: 1, themes: ['utility'] },
  { name: 'Fog Cloud', level: 1, themes: ['utility', 'cold'] },
  { name: 'Charm Person', level: 1, themes: ['enchantment'] },
  { name: 'Feather Fall', level: 1, themes: ['utility', 'movement'] },
  { name: 'Chromatic Orb', level: 1, themes: ['fire', 'cold', 'lightning', 'thunder'] },
  { name: 'Ray of Sickness', level: 1, themes: ['poison', 'debuff'] },
  { name: 'Witch Bolt', level: 1, themes: ['lightning'] },
  { name: 'Inflict Wounds', level: 1, themes: ['necrotic'] },
  { name: 'Guiding Bolt', level: 1, themes: ['radiant'] },
  { name: 'Hellish Rebuke', level: 1, themes: ['fire'] },
  { name: 'Armor of Agathys', level: 1, themes: ['cold', 'defense'] },
  { name: 'Disguise Self', level: 1, themes: ['illusion'] },
  { name: 'Silent Image', level: 1, themes: ['illusion'] },
  { name: 'Cause Fear', level: 1, themes: ['enchantment', 'shadow'] },

  // Level 2 Spells
  { name: 'Scorching Ray', level: 2, themes: ['fire'] },
  { name: 'Hold Person', level: 2, themes: ['enchantment'] },
  { name: 'Invisibility', level: 2, themes: ['illusion', 'shadow'] },
  { name: 'Misty Step', level: 2, themes: ['teleportation'] },
  { name: 'Shatter', level: 2, themes: ['thunder'] },
  { name: 'Web', level: 2, themes: ['control'] },
  { name: 'Darkness', level: 2, themes: ['shadow'] },
  { name: 'Lesser Restoration', level: 2, themes: ['healing'] },
  { name: 'Levitate', level: 2, themes: ['movement', 'force'] },
  { name: 'See Invisibility', level: 2, themes: ['utility'] },
  { name: 'Flaming Sphere', level: 2, themes: ['fire'] },
  { name: 'Melf\'s Acid Arrow', level: 2, themes: ['poison'] },
  { name: 'Shadow Blade', level: 2, themes: ['shadow', 'psychic'] },
  { name: 'Spiritual Weapon', level: 2, themes: ['radiant', 'force'] },
  { name: 'Mirror Image', level: 2, themes: ['illusion', 'defense'] },
  { name: 'Blur', level: 2, themes: ['illusion', 'defense'] },
  { name: 'Dragon\'s Breath', level: 2, themes: ['fire', 'cold', 'lightning'] },
  { name: 'Gust of Wind', level: 2, themes: ['thunder', 'movement'] },
  { name: 'Moonbeam', level: 2, themes: ['radiant'] },
  { name: 'Ray of Enfeeblement', level: 2, themes: ['necrotic', 'debuff'] },

  // Level 3 Spells
  { name: 'Fireball', level: 3, themes: ['fire'] },
  { name: 'Lightning Bolt', level: 3, themes: ['lightning'] },
  { name: 'Fly', level: 3, themes: ['movement'] },
  { name: 'Counterspell', level: 3, themes: ['defense', 'force'] },
  { name: 'Dispel Magic', level: 3, themes: ['utility'] },
  { name: 'Haste', level: 3, themes: ['buff'] },
  { name: 'Fear', level: 3, themes: ['enchantment', 'shadow'] },
  { name: 'Slow', level: 3, themes: ['debuff', 'enchantment'] },
  { name: 'Spirit Guardians', level: 3, themes: ['radiant'] },
  { name: 'Call Lightning', level: 3, themes: ['lightning'] },
  { name: 'Vampiric Touch', level: 3, themes: ['necrotic'] },
  { name: 'Thunder Step', level: 3, themes: ['thunder', 'teleportation'] },
  { name: 'Sleet Storm', level: 3, themes: ['cold', 'control'] },
  { name: 'Stinking Cloud', level: 3, themes: ['poison', 'control'] },
  { name: 'Blink', level: 3, themes: ['teleportation'] },
  { name: 'Hypnotic Pattern', level: 3, themes: ['illusion', 'enchantment'] },
  { name: 'Major Image', level: 3, themes: ['illusion'] },
  { name: 'Elemental Weapon', level: 3, themes: ['fire', 'cold', 'lightning', 'thunder'] },
  { name: 'Protection from Energy', level: 3, themes: ['defense'] },
  { name: 'Revivify', level: 3, themes: ['healing'] },

  // Level 4 Spells
  { name: 'Dimension Door', level: 4, themes: ['teleportation'] },
  { name: 'Polymorph', level: 4, themes: ['transmutation'] },
  { name: 'Wall of Fire', level: 4, themes: ['fire'] },
  { name: 'Greater Invisibility', level: 4, themes: ['illusion', 'shadow'] },
  { name: 'Ice Storm', level: 4, themes: ['cold'] },
  { name: 'Banishment', level: 4, themes: ['force', 'teleportation'] },
  { name: 'Confusion', level: 4, themes: ['enchantment'] },
  { name: 'Freedom of Movement', level: 4, themes: ['buff', 'movement'] },
  { name: 'Storm Sphere', level: 4, themes: ['lightning', 'thunder'] },
  { name: 'Vitriolic Sphere', level: 4, themes: ['poison'] },
  { name: 'Blight', level: 4, themes: ['necrotic'] },
  { name: 'Fire Shield', level: 4, themes: ['fire', 'cold', 'defense'] },
  { name: 'Phantasmal Killer', level: 4, themes: ['illusion', 'psychic'] },
  { name: 'Shadow of Moil', level: 4, themes: ['shadow', 'necrotic'] },
  { name: 'Sickening Radiance', level: 4, themes: ['radiant', 'debuff'] },

  // Level 5 Spells
  { name: 'Cone of Cold', level: 5, themes: ['cold'] },
  { name: 'Hold Monster', level: 5, themes: ['enchantment'] },
  { name: 'Wall of Force', level: 5, themes: ['force'] },
  { name: 'Cloudkill', level: 5, themes: ['poison'] },
  { name: 'Flame Strike', level: 5, themes: ['fire', 'radiant'] },
  { name: 'Greater Restoration', level: 5, themes: ['healing'] },
  { name: 'Teleportation Circle', level: 5, themes: ['teleportation'] },
  { name: 'Destructive Wave', level: 5, themes: ['thunder', 'radiant', 'necrotic'] },
  { name: 'Enervation', level: 5, themes: ['necrotic'] },
  { name: 'Synaptic Static', level: 5, themes: ['psychic'] },
  { name: 'Steel Wind Strike', level: 5, themes: ['force', 'teleportation'] },
  { name: 'Dawn', level: 5, themes: ['radiant'] },
  { name: 'Negative Energy Flood', level: 5, themes: ['necrotic'] },
  { name: 'Immolation', level: 5, themes: ['fire'] },
];

// Legacy compatibility - keep the old structure for backwards compatibility
const SPELLS_BY_LEVEL: Record<number, { name: string; theme: string }[]> = {
  1: SPELL_DATABASE.filter(s => s.level === 1).map(s => ({ name: s.name, theme: s.themes[0] })),
  2: SPELL_DATABASE.filter(s => s.level === 2).map(s => ({ name: s.name, theme: s.themes[0] })),
  3: SPELL_DATABASE.filter(s => s.level === 3).map(s => ({ name: s.name, theme: s.themes[0] })),
  4: SPELL_DATABASE.filter(s => s.level === 4).map(s => ({ name: s.name, theme: s.themes[0] })),
  5: SPELL_DATABASE.filter(s => s.level === 5).map(s => ({ name: s.name, theme: s.themes[0] })),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[0];
}

function getSpellsForArchetype(archetype: ItemArchetype, minLevel: number, maxLevel: number): SpellEntry[] {
  return SPELL_DATABASE.filter(spell => {
    if (spell.level < minLevel || spell.level > maxLevel) return false;
    return spell.themes.some(theme => archetype.spellThemes.includes(theme));
  });
}

/**
 * Generate a random "Surprise me" item with high variety and thematic coherence.
 * Uses archetypes to create items with consistent themes.
 * Returns a configuration object that can be applied to form state.
 */
export function generateSurpriseItem(): SurpriseItemConfig {
  // Pick target rarity with ratio Uncommon:Rare:Very Rare:Legendary = 2:3:3:1
  const rarityRoll = Math.random() * 9;
  const targetRarity = rarityRoll < 2 ? 'uncommon' : rarityRoll < 5 ? 'rare' : rarityRoll < 8 ? 'very rare' : 'legendary';

  // Point budgets by rarity (targeting upper half of each tier)
  const pointBudget = targetRarity === 'uncommon' ? 1.4 : targetRarity === 'rare' ? 2.4 : targetRarity === 'very rare' ? 3.8 : 4.5;

  // Select an archetype (weighted random selection)
  const archetype = weightedPick(ITEM_ARCHETYPES);

  // Decide on item category - prefer archetype's preferred categories (70%), but allow any (30%)
  type Category = 'weapon' | 'armor' | 'trinket';
  let category: Category;
  if (Math.random() < 0.7 && archetype.preferredCategories.length > 0) {
    category = pick(archetype.preferredCategories);
  } else {
    const categoryRoll = Math.random();
    if (categoryRoll < 0.33) category = 'weapon';
    else if (categoryRoll < 0.66) category = 'armor';
    else category = 'trinket';
  }

  // Select base item based on category with more interesting distribution
  let baseItemPool: string[];
  switch (category) {
    case 'weapon':
      // Bias towards more iconic weapons
      // 60% martial, 25% ranged, 15% simple
      const weaponRoll = Math.random();
      if (weaponRoll < 0.15) baseItemPool = [...BASE_ITEMS['Melee Weapons (Simple)']];
      else if (weaponRoll < 0.40) baseItemPool = [...BASE_ITEMS['Ranged Weapons']];
      else baseItemPool = [...BASE_ITEMS['Melee Weapons (Martial)']];
      break;
    case 'armor':
      baseItemPool = [...BASE_ITEMS['Armor']];
      break;
    case 'trinket':
      // Bias towards implements for spellcasting archetypes
      if (archetype.spellThemes.length > 0 && Math.random() < 0.6) {
        baseItemPool = [...BASE_ITEMS['Implements']];
      } else {
        baseItemPool = [...BASE_ITEMS['Implements'], ...BASE_ITEMS['Accessories'], 'wondrous item'];
      }
      break;
  }
  const randomBaseItem = pick(baseItemPool);

  const isWeapon = WEAPON_ITEMS.has(randomBaseItem);
  const isArmor = ARMOR_ITEMS.has(randomBaseItem);
  const isImplement = ['rod', 'staff', 'wand'].includes(randomBaseItem);

  // Initialize result object
  const result: SurpriseItemConfig = {
    itemName: '',
    baseItem: randomBaseItem,
    enhancement: 0,
    attunement: false,
    damageBonus: undefined,
    acBonus: 0,
    savingThrowBonus: 0,
    resistances: [],
    conditionImmunities: [],
    spellSaveDCBonus: 0,
    spellAttackBonus: 0,
    abilityScoreSetter: undefined,
    permanentBuffs: {},
    maxCharges: 0,
    chargesPerShortRest: 0,
    chargesPerLongRest: 0,
    abilities: [],
  };

  // Track points spent
  let pointsSpent = 0;

  // Define attribute types
  type MajorAttr = 'enhancement' | 'damage' | 'ac' | 'saves' | 'spells' | 'abilityScore';
  type MinorAttr = 'resistance' | 'conditionImmunity' | 'permanentBuff' | 'spellBonus';

  // Build attribute pools based on category AND archetype
  const possibleMajor: MajorAttr[] = [];
  const possibleMinor: MinorAttr[] = [];

  // Major attributes - influenced by archetype and category
  if (isWeapon) {
    possibleMajor.push('enhancement');
    // Damage bonus more likely if archetype has damage types
    if (archetype.damageTypes.length > 0) {
      possibleMajor.push('damage', 'damage'); // Double weight
    } else {
      possibleMajor.push('damage');
    }
  }
  if (isArmor) {
    possibleMajor.push('enhancement', 'ac');
  }
  if (!isWeapon && !isArmor) {
    possibleMajor.push('ac', 'saves');
  }

  // Spells - more likely for archetypes with spell themes
  if (archetype.spellThemes.length > 0) {
    if (category === 'trinket') {
      possibleMajor.push('spells', 'spells', 'spells'); // Triple weight for spell-focused trinkets
    } else {
      possibleMajor.push('spells', 'spells'); // Double weight
    }
  } else if (category === 'trinket') {
    possibleMajor.push('spells');
  } else if (Math.random() < 0.2) {
    possibleMajor.push('spells');
  }

  // Ability score setters for rare+ items - use archetype's preferred abilities
  if (targetRarity !== 'uncommon' && Math.random() < 0.3 && archetype.abilityScores.length > 0) {
    possibleMajor.push('abilityScore');
  }

  // Minor attributes - influenced by archetype
  if (archetype.resistances.length > 0) {
    possibleMinor.push('resistance', 'resistance'); // Double weight
  } else {
    possibleMinor.push('resistance');
  }
  if (archetype.conditions.length > 0) {
    possibleMinor.push('conditionImmunity', 'conditionImmunity');
  } else {
    possibleMinor.push('conditionImmunity');
  }
  if (archetype.buffs.length > 0) {
    possibleMinor.push('permanentBuff', 'permanentBuff');
  } else {
    possibleMinor.push('permanentBuff');
  }
  if (category === 'trinket' || isImplement) {
    possibleMinor.push('spellBonus');
  }

  // Shuffle and select attributes
  const shuffledMajor = [...new Set(possibleMajor)].sort(() => Math.random() - 0.5);
  const shuffledMinor = [...new Set(possibleMinor)].sort(() => Math.random() - 0.5);

  // Pick number of attributes based on rarity with more variance
  let numMajorTarget: number;
  let numMinorTarget: number;
  if (targetRarity === 'uncommon') {
    numMajorTarget = 1;
    numMinorTarget = Math.random() < 0.5 ? 1 : 0;
  } else if (targetRarity === 'rare') {
    numMajorTarget = Math.random() < 0.4 ? 2 : 1;
    numMinorTarget = Math.random() < 0.6 ? 1 : Math.random() < 0.8 ? 2 : 0;
  } else if (targetRarity === 'very rare') {
    numMajorTarget = Math.random() < 0.6 ? 2 : (Math.random() < 0.8 ? 1 : 3);
    numMinorTarget = Math.random() < 0.5 ? 2 : 1;
  } else {
    // Legendary: 2-3 major, 2-3 minor
    numMajorTarget = Math.random() < 0.5 ? 3 : 2;
    numMinorTarget = Math.random() < 0.5 ? 3 : 2;
  }

  // Apply major attributes using archetype-themed selections
  let majorsApplied = 0;
  for (const attr of shuffledMajor) {
    if (majorsApplied >= numMajorTarget) break;
    if (pointsSpent >= pointBudget - 0.2) break;

    switch (attr) {
      case 'enhancement':
        if (isWeapon || isArmor) {
          let bonus: number;
          if (targetRarity === 'uncommon') bonus = 1;
          else if (targetRarity === 'rare') bonus = Math.random() < 0.7 ? 1 : 2;
          else if (targetRarity === 'very rare') bonus = Math.random() < 0.3 ? 3 : 2;
          else bonus = 3; // Legendary always +3
          const cost = bonus * 1.0;
          if (bonus > 0 && pointsSpent + cost <= pointBudget) {
            result.enhancement = bonus;
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;

      case 'damage':
        if (isWeapon) {
          // Use archetype's damage types for thematic coherence
          const damagePool = archetype.damageTypes.length > 0 ? archetype.damageTypes :
            ['fire', 'cold', 'lightning', 'radiant', 'necrotic', 'force', 'thunder', 'psychic'];
          const dmgType = pick(damagePool) as DamageBonus['type'];

          // Scale dice by rarity with more variety
          let dice = '1d6';
          let cost = 1.0;
          const budgetRemaining = pointBudget - pointsSpent;

          if (targetRarity === 'legendary' && budgetRemaining >= 3.0) {
            const diceRoll = Math.random();
            if (diceRoll < 0.4) { dice = '3d6'; cost = 3.0; }
            else if (diceRoll < 0.7) { dice = '2d8'; cost = 2.2; }
            else { dice = '2d6'; cost = 2.0; }
          } else if ((targetRarity === 'legendary' || targetRarity === 'very rare') && budgetRemaining >= 2.5) {
            const diceRoll = Math.random();
            if (diceRoll < 0.3) { dice = '3d6'; cost = 3.0; }
            else if (diceRoll < 0.6) { dice = '2d6'; cost = 2.0; }
            else { dice = '2d8'; cost = 2.2; }
          } else if ((targetRarity === 'legendary' || targetRarity === 'very rare') && budgetRemaining >= 2.0) {
            dice = Math.random() < 0.5 ? '2d6' : '1d10';
            cost = dice === '2d6' ? 2.0 : 1.3;
          } else if (targetRarity === 'rare' && budgetRemaining >= 1.5) {
            const diceRoll = Math.random();
            if (diceRoll < 0.3) { dice = '1d8'; cost = 1.1; }
            else if (diceRoll < 0.5) { dice = '1d10'; cost = 1.3; }
            else { dice = '1d6'; cost = 1.0; }
          }

          if (pointsSpent + cost <= pointBudget) {
            result.damageBonus = { dice, type: dmgType, frequency: 'per-hit' };
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;

      case 'ac':
        if (!isWeapon) {
          let bonus: number;
          if (targetRarity === 'uncommon') bonus = 1;
          else if (targetRarity === 'rare') bonus = Math.random() < 0.8 ? 1 : 2;
          else if (targetRarity === 'very rare') bonus = Math.random() < 0.4 ? 2 : 1;
          else bonus = 2; // Legendary always +2

          const costPer = isArmor ? 1.0 : 1.5;
          const cost = bonus * costPer;
          if (bonus > 0 && pointsSpent + cost <= pointBudget) {
            result.acBonus = bonus;
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;

      case 'saves':
        {
          let bonus: number;
          if (targetRarity === 'uncommon') bonus = 1;
          else if (targetRarity === 'rare') bonus = Math.random() < 0.7 ? 1 : 2;
          else if (targetRarity === 'very rare') bonus = Math.random() < 0.5 ? 2 : 1;
          else bonus = Math.random() < 0.6 ? 2 : 3; // Legendary: +2 or +3

          const cost = bonus * 1.0;
          if (pointsSpent + cost <= pointBudget) {
            result.savingThrowBonus = bonus;
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;

      case 'spells':
        {
          // Pick spell level based on rarity
          let maxSpellLevel: number;
          let minSpellLevel: number;
          if (targetRarity === 'uncommon') {
            minSpellLevel = 1; maxSpellLevel = 2;
          } else if (targetRarity === 'rare') {
            minSpellLevel = 2; maxSpellLevel = 4;
          } else if (targetRarity === 'very rare') {
            minSpellLevel = 3; maxSpellLevel = 5;
          } else {
            // Legendary: focus on high-level spells
            minSpellLevel = 4; maxSpellLevel = 5;
          }

          // Get themed spells for this archetype
          const themedSpells = getSpellsForArchetype(archetype, minSpellLevel, maxSpellLevel);
          let chosenSpell: SpellEntry;

          if (themedSpells.length > 0 && Math.random() < 0.8) {
            // 80% chance to pick a themed spell
            chosenSpell = pick(themedSpells);
          } else {
            // Fallback to any spell in level range
            const allSpells = SPELL_DATABASE.filter(s => s.level >= minSpellLevel && s.level <= maxSpellLevel);
            chosenSpell = pick(allSpells);
          }

          const spellLevel = chosenSpell.level;

          // Determine charges with more variety
          let maxChargesVal: number;
          let chargesPerLongRestVal: number;

          if (spellLevel <= 2) {
            maxChargesVal = targetRarity === 'uncommon' ? (2 + Math.floor(Math.random() * 2)) :
                           targetRarity === 'rare' ? (4 + Math.floor(Math.random() * 3)) :
                           (6 + Math.floor(Math.random() * 3));
            chargesPerLongRestVal = maxChargesVal;
          } else if (spellLevel <= 3) {
            maxChargesVal = targetRarity === 'rare' ? (3 + Math.floor(Math.random() * 3)) : (5 + Math.floor(Math.random() * 3));
            chargesPerLongRestVal = Math.ceil(maxChargesVal * (0.6 + Math.random() * 0.2));
          } else {
            maxChargesVal = targetRarity === 'rare' ? (2 + Math.floor(Math.random() * 2)) : (3 + Math.floor(Math.random() * 3));
            chargesPerLongRestVal = Math.ceil(maxChargesVal * (0.5 + Math.random() * 0.2));
          }

          // Estimate cost
          const usesPerDay = chargesPerLongRestVal / spellLevel;
          const SPELL_VALUES: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
          const effectiveLevel = SPELL_VALUES[spellLevel] || spellLevel;
          const estimatedCost = effectiveLevel * usesPerDay * 0.2;

          if (pointsSpent + estimatedCost <= pointBudget) {
            result.maxCharges = maxChargesVal;
            result.chargesPerLongRest = chargesPerLongRestVal;
            // 25% chance for short rest recharge
            if (Math.random() < 0.25) {
              result.chargesPerShortRest = Math.max(1, Math.floor(maxChargesVal / (3 + Math.floor(Math.random() * 2))));
            }
            result.abilities = [{
              spell: chosenSpell.name,
              spellLevel,
              chargesPerUse: spellLevel,
              canUpcast: Math.random() < 0.35 && spellLevel >= 1 && spellLevel <= 4 && maxChargesVal >= spellLevel + 1,
            }];
            pointsSpent += estimatedCost;
            majorsApplied++;
          }
        }
        break;

      case 'abilityScore':
        {
          // Use archetype's preferred abilities
          const abilityPool = archetype.abilityScores.length > 0 ? archetype.abilityScores :
            ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
          const ability = pick(abilityPool);

          // More variety in set values
          let setValue: number;
          if (targetRarity === 'rare') {
            setValue = Math.random() < 0.7 ? 19 : 18;
          } else if (targetRarity === 'very rare') {
            setValue = Math.random() < 0.6 ? 21 : (Math.random() < 0.7 ? 19 : 23);
          } else {
            // Legendary: higher ability scores
            setValue = Math.random() < 0.5 ? 23 : 21;
          }

          const cost = setValue <= 18 ? 1.2 : setValue <= 19 ? 1.5 : setValue <= 21 ? 2.5 : 3.5;
          if (pointsSpent + cost <= pointBudget) {
            result.abilityScoreSetter = { ability, setValue };
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;
    }
  }

  // Apply minor attributes using archetype-themed selections
  let minorsApplied = 0;
  for (const attr of shuffledMinor) {
    if (minorsApplied >= numMinorTarget) break;
    if (pointsSpent >= pointBudget) break;

    switch (attr) {
      case 'resistance':
        {
          const cost = 0.5;
          if (pointsSpent + cost <= pointBudget) {
            // Use archetype's resistances for thematic coherence
            const resistancePool = archetype.resistances.length > 0 ? archetype.resistances :
              ['fire', 'cold', 'lightning', 'acid', 'poison', 'thunder', 'necrotic', 'radiant', 'psychic'];
            const resistance = pick(resistancePool);
            result.resistances = [resistance];
            pointsSpent += cost;
            minorsApplied++;
          }
        }
        break;

      case 'conditionImmunity':
        {
          const cost = 0.3;
          if (pointsSpent + cost <= pointBudget) {
            // Use archetype's conditions for thematic coherence
            const conditionPool = archetype.conditions.length > 0 ? archetype.conditions :
              ['frightened', 'charmed', 'poisoned', 'paralyzed', 'stunned'];
            const condition = pick(conditionPool);
            result.conditionImmunities = [condition];
            pointsSpent += cost;
            minorsApplied++;
          }
        }
        break;

      case 'permanentBuff':
        {
          // Use archetype's buffs for thematic coherence
          const buffOptions: { key: keyof PermanentBuffs; cost: number }[] = [];

          // Add archetype-preferred buffs with lower effective cost (they're thematic)
          for (const buff of archetype.buffs) {
            switch (buff) {
              case 'darkvision': buffOptions.push({ key: 'darkvision', cost: 0.2 }); break;
              case 'speedBonus': buffOptions.push({ key: 'speedBonus', cost: 0.3 }); break;
              case 'swimming': buffOptions.push({ key: 'swimming', cost: 0.2 }); break;
              case 'climbBurrow': buffOptions.push({ key: 'climbBurrow', cost: 0.5 }); break;
              case 'flight':
                if (targetRarity !== 'uncommon') {
                  buffOptions.push({ key: 'flight', cost: 1.0 });
                }
                break;
            }
          }

          // If no archetype buffs or they don't fit, add generic options
          if (buffOptions.length === 0) {
            buffOptions.push({ key: 'darkvision', cost: 0.2 });
            buffOptions.push({ key: 'speedBonus', cost: 0.3 });
            buffOptions.push({ key: 'swimming', cost: 0.2 });
            if (targetRarity !== 'uncommon') {
              buffOptions.push({ key: 'climbBurrow', cost: 0.5 });
              buffOptions.push({ key: 'flight', cost: 1.0 });
            }
          }

          const affordableBuffs = buffOptions.filter(b => pointsSpent + b.cost <= pointBudget);
          if (affordableBuffs.length > 0) {
            const buff = pick(affordableBuffs);
            result.permanentBuffs = { [buff.key]: true };
            pointsSpent += buff.cost;
            minorsApplied++;
          }
        }
        break;

      case 'spellBonus':
        {
          let bonus: number;
          if (targetRarity === 'uncommon') bonus = 1;
          else if (targetRarity === 'rare') bonus = Math.random() < 0.7 ? 1 : 2;
          else if (targetRarity === 'very rare') bonus = Math.random() < 0.5 ? 2 : (Math.random() < 0.8 ? 1 : 3);
          else bonus = Math.random() < 0.6 ? 3 : 2; // Legendary: +3 or +2

          const cost = bonus * 0.5;
          if (pointsSpent + cost <= pointBudget) {
            // Slight preference for spell save DC
            if (Math.random() < 0.55) {
              result.spellSaveDCBonus = bonus;
            } else {
              result.spellAttackBonus = bonus;
            }
            pointsSpent += cost;
            minorsApplied++;
          }
        }
        break;
    }
  }

  // Set attunement based on complexity and rarity
  const totalFeatures = majorsApplied + minorsApplied;
  if (targetRarity === 'uncommon') {
    result.attunement = totalFeatures >= 2 || Math.random() < 0.4;
  } else {
    // Rare, Very Rare, Legendary always require attunement
    result.attunement = true;
  }

  // Generate a themed item name that matches both the base item AND the archetype
  result.itemName = generateRandomItemNameForBase(result.baseItem, archetype.theme);

  return result;
}
