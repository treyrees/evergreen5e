/**
 * Surprise item generator for the calculator page.
 * Generates random magic items with balanced attributes.
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

/**
 * Spell database for random selection (organized by level for appropriate rarity)
 */
const SPELLS_BY_LEVEL: Record<number, { name: string; theme: string }[]> = {
  1: [
    { name: 'Magic Missile', theme: 'force' },
    { name: 'Shield', theme: 'defense' },
    { name: 'Cure Wounds', theme: 'healing' },
    { name: 'Faerie Fire', theme: 'utility' },
    { name: 'Thunderwave', theme: 'thunder' },
    { name: 'Burning Hands', theme: 'fire' },
    { name: 'Detect Magic', theme: 'utility' },
    { name: 'Fog Cloud', theme: 'utility' },
    { name: 'Charm Person', theme: 'enchantment' },
    { name: 'Feather Fall', theme: 'utility' },
  ],
  2: [
    { name: 'Scorching Ray', theme: 'fire' },
    { name: 'Hold Person', theme: 'enchantment' },
    { name: 'Invisibility', theme: 'illusion' },
    { name: 'Misty Step', theme: 'teleportation' },
    { name: 'Shatter', theme: 'thunder' },
    { name: 'Web', theme: 'control' },
    { name: 'Darkness', theme: 'shadow' },
    { name: 'Lesser Restoration', theme: 'healing' },
    { name: 'Levitate', theme: 'utility' },
    { name: 'See Invisibility', theme: 'utility' },
  ],
  3: [
    { name: 'Fireball', theme: 'fire' },
    { name: 'Lightning Bolt', theme: 'lightning' },
    { name: 'Fly', theme: 'movement' },
    { name: 'Counterspell', theme: 'defense' },
    { name: 'Dispel Magic', theme: 'utility' },
    { name: 'Haste', theme: 'buff' },
    { name: 'Fear', theme: 'enchantment' },
    { name: 'Slow', theme: 'debuff' },
    { name: 'Spirit Guardians', theme: 'radiant' },
    { name: 'Call Lightning', theme: 'lightning' },
  ],
  4: [
    { name: 'Dimension Door', theme: 'teleportation' },
    { name: 'Polymorph', theme: 'transmutation' },
    { name: 'Wall of Fire', theme: 'fire' },
    { name: 'Greater Invisibility', theme: 'illusion' },
    { name: 'Ice Storm', theme: 'cold' },
    { name: 'Banishment', theme: 'abjuration' },
    { name: 'Confusion', theme: 'enchantment' },
    { name: 'Freedom of Movement', theme: 'buff' },
  ],
  5: [
    { name: 'Cone of Cold', theme: 'cold' },
    { name: 'Hold Monster', theme: 'enchantment' },
    { name: 'Wall of Force', theme: 'force' },
    { name: 'Cloudkill', theme: 'poison' },
    { name: 'Flame Strike', theme: 'fire' },
    { name: 'Greater Restoration', theme: 'healing' },
    { name: 'Teleportation Circle', theme: 'teleportation' },
  ],
};

/**
 * Generate a random "Surprise me" item with high variety.
 * Returns a configuration object that can be applied to form state.
 */
export function generateSurpriseItem(): SurpriseItemConfig {
  // Pick target rarity: Uncommon 50%, Rare 35%, Very Rare 15%
  const rarityRoll = Math.random();
  const targetRarity = rarityRoll < 0.5 ? 'uncommon' : rarityRoll < 0.85 ? 'rare' : 'very rare';

  // Point budgets to stay under 3.9 (cap at Very Rare, no Legendary)
  const pointBudget = targetRarity === 'uncommon' ? 1.4 : targetRarity === 'rare' ? 2.4 : 3.8;

  // Decide on item archetype first (affects base item selection)
  const archetypeRoll = Math.random();
  type Archetype = 'weapon' | 'armor' | 'spellcaster' | 'utility' | 'hybrid';
  let archetype: Archetype;
  if (archetypeRoll < 0.25) archetype = 'weapon';
  else if (archetypeRoll < 0.40) archetype = 'armor';
  else if (archetypeRoll < 0.60) archetype = 'spellcaster';
  else if (archetypeRoll < 0.80) archetype = 'utility';
  else archetype = 'hybrid';

  // Select base item based on archetype
  let baseItemPool: string[];
  switch (archetype) {
    case 'weapon':
      baseItemPool = [...BASE_ITEMS['Melee Weapons (Simple)'], ...BASE_ITEMS['Melee Weapons (Martial)'], ...BASE_ITEMS['Ranged Weapons']];
      break;
    case 'armor':
      baseItemPool = [...BASE_ITEMS['Armor']];
      break;
    case 'spellcaster':
      baseItemPool = [...BASE_ITEMS['Implements'], ...BASE_ITEMS['Accessories'], 'wondrous item'];
      break;
    case 'utility':
      baseItemPool = [...BASE_ITEMS['Accessories'], ...BASE_ITEMS['Implements'], 'wondrous item'];
      break;
    case 'hybrid':
      baseItemPool = Object.values(BASE_ITEMS).flat();
      break;
  }
  const randomBaseItem = baseItemPool[Math.floor(Math.random() * baseItemPool.length)];

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
  type MinorAttr = 'resistance' | 'conditionImmunity' | 'permanentBuff' | 'spellBonus' | 'advantage';

  // Build attribute pools based on archetype
  const possibleMajor: MajorAttr[] = [];
  const possibleMinor: MinorAttr[] = [];

  // Major attributes
  if (isWeapon) {
    possibleMajor.push('enhancement', 'damage');
  }
  if (isArmor) {
    possibleMajor.push('enhancement', 'ac');
  }
  if (!isWeapon && !isArmor) {
    possibleMajor.push('ac', 'saves');
  }
  // Spells can appear on any item, but more likely on implements/accessories
  if (archetype === 'spellcaster' || archetype === 'hybrid' || isImplement) {
    possibleMajor.push('spells', 'spells'); // Double weight for spell-focused
  } else if (Math.random() < 0.3) {
    possibleMajor.push('spells'); // 30% chance for other archetypes
  }
  // Ability score setters for rare+ items
  if (targetRarity !== 'uncommon' && Math.random() < 0.25) {
    possibleMajor.push('abilityScore');
  }

  // Minor attributes (all items can have these)
  possibleMinor.push('resistance', 'conditionImmunity', 'permanentBuff');
  if (archetype === 'spellcaster' || isImplement) {
    possibleMinor.push('spellBonus');
  }
  if (isWeapon || archetype === 'utility') {
    possibleMinor.push('advantage');
  }

  // Shuffle and select attributes
  const shuffledMajor = [...new Set(possibleMajor)].sort(() => Math.random() - 0.5);
  const shuffledMinor = [...new Set(possibleMinor)].sort(() => Math.random() - 0.5);

  // Pick 1-2 major, 0-2 minor depending on rarity
  const numMajorTarget = targetRarity === 'uncommon' ? 1 : Math.random() < 0.6 ? 1 : 2;
  const numMinorTarget = Math.random() < 0.4 ? 1 : Math.random() < 0.8 ? 2 : 0;

  // Damage types
  const goodDamageTypes = ['fire', 'cold', 'lightning', 'radiant', 'necrotic', 'force', 'thunder', 'psychic'];
  const resistanceTypes = ['fire', 'cold', 'lightning', 'acid', 'poison', 'thunder', 'necrotic', 'radiant', 'psychic'];
  const conditions = ['frightened', 'charmed', 'poisoned', 'paralyzed', 'stunned'];
  const abilities: ('STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA')[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

  // Apply major attributes
  let majorsApplied = 0;
  for (const attr of shuffledMajor) {
    if (majorsApplied >= numMajorTarget) break;
    if (pointsSpent >= pointBudget - 0.3) break; // Leave room for minors

    switch (attr) {
      case 'enhancement':
        if (isWeapon || isArmor) {
          const bonus = targetRarity === 'uncommon' ? 1 : targetRarity === 'rare' ? (Math.random() < 0.7 ? 1 : 2) : 2;
          const cost = bonus * 1.0;
          if (pointsSpent + cost <= pointBudget) {
            result.enhancement = bonus;
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;

      case 'damage':
        if (isWeapon) {
          // Scale dice by rarity and remaining budget
          let dice = '1d6';
          let cost = 1.0;
          if (targetRarity === 'very rare' && pointBudget - pointsSpent >= 2.0) {
            dice = Math.random() < 0.5 ? '2d6' : '1d8';
            cost = dice === '2d6' ? 2.0 : 1.1;
          } else if (targetRarity === 'rare' && Math.random() < 0.3 && pointBudget - pointsSpent >= 1.5) {
            dice = '1d8';
            cost = 1.1;
          }
          if (pointsSpent + cost <= pointBudget) {
            const dmgType = goodDamageTypes[Math.floor(Math.random() * goodDamageTypes.length)];
            result.damageBonus = { dice, type: dmgType as DamageBonus['type'], frequency: 'per-hit' };
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;

      case 'ac':
        if (!isWeapon) {
          const bonus = targetRarity === 'uncommon' ? 1 : targetRarity === 'rare' ? 1 : (Math.random() < 0.5 ? 1 : 2);
          // AC on non-armor is 1.5 pts per +1, on armor is 1.0
          const costPer = isArmor ? 1.0 : 1.5;
          const cost = bonus * costPer;
          if (pointsSpent + cost <= pointBudget) {
            result.acBonus = bonus;
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;

      case 'saves':
        {
          const bonus = targetRarity === 'uncommon' ? 1 : Math.random() < 0.7 ? 1 : 2;
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
          } else {
            minSpellLevel = 3; maxSpellLevel = 5;
          }
          const spellLevel = minSpellLevel + Math.floor(Math.random() * (maxSpellLevel - minSpellLevel + 1));
          const spellPool = SPELLS_BY_LEVEL[spellLevel] || SPELLS_BY_LEVEL[3];
          const spell = spellPool[Math.floor(Math.random() * spellPool.length)];

          // Determine charges based on spell level and rarity
          let maxChargesVal: number;
          let chargesPerLongRestVal: number;
          if (spellLevel <= 2) {
            maxChargesVal = targetRarity === 'uncommon' ? 3 : targetRarity === 'rare' ? 5 : 7;
            chargesPerLongRestVal = maxChargesVal;
          } else if (spellLevel <= 3) {
            maxChargesVal = targetRarity === 'uncommon' ? 3 : targetRarity === 'rare' ? 5 : 7;
            chargesPerLongRestVal = Math.ceil(maxChargesVal * 0.7);
          } else {
            maxChargesVal = targetRarity === 'rare' ? 3 : 5;
            chargesPerLongRestVal = Math.ceil(maxChargesVal * 0.6);
          }

          // Estimate cost
          const usesPerDay = chargesPerLongRestVal / spellLevel;
          const SPELL_VALUES: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
          const effectiveLevel = SPELL_VALUES[spellLevel] || spellLevel;
          const estimatedCost = effectiveLevel * usesPerDay * 0.2;

          if (pointsSpent + estimatedCost <= pointBudget) {
            result.maxCharges = maxChargesVal;
            result.chargesPerLongRest = chargesPerLongRestVal;
            // Small chance for short rest recharge too
            if (Math.random() < 0.2) {
              result.chargesPerShortRest = Math.floor(maxChargesVal / 3);
            }
            result.abilities = [{
              spell: spell.name,
              spellLevel,
              chargesPerUse: spellLevel,
              canUpcast: Math.random() < 0.3 && spellLevel >= 1 && maxChargesVal >= spellLevel + 1,
            }];
            pointsSpent += estimatedCost;
            majorsApplied++;
          }
        }
        break;

      case 'abilityScore':
        {
          // Pick an ability and a value based on rarity
          const ability = abilities[Math.floor(Math.random() * abilities.length)];
          const setValue = targetRarity === 'rare' ? 19 : 21; // 19 for rare, 21 for very rare
          const cost = setValue === 19 ? 1.5 : 2.5;
          if (pointsSpent + cost <= pointBudget) {
            result.abilityScoreSetter = { ability, setValue };
            pointsSpent += cost;
            majorsApplied++;
          }
        }
        break;
    }
  }

  // Apply minor attributes
  let minorsApplied = 0;
  for (const attr of shuffledMinor) {
    if (minorsApplied >= numMinorTarget) break;
    if (pointsSpent >= pointBudget) break;

    switch (attr) {
      case 'resistance':
        {
          const cost = 0.5;
          if (pointsSpent + cost <= pointBudget) {
            const resistance = resistanceTypes[Math.floor(Math.random() * resistanceTypes.length)];
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
            const condition = conditions[Math.floor(Math.random() * conditions.length)];
            result.conditionImmunities = [condition];
            pointsSpent += cost;
            minorsApplied++;
          }
        }
        break;

      case 'permanentBuff':
        {
          // Pick a permanent buff
          const buffOptions: { key: keyof PermanentBuffs; cost: number }[] = [
            { key: 'darkvision', cost: 0.2 },
            { key: 'speedBonus', cost: 0.3 },
            { key: 'swimming', cost: 0.2 },
            { key: 'climbBurrow', cost: 0.5 },
          ];
          // Flight only for rare+ due to high value
          if (targetRarity !== 'uncommon') {
            buffOptions.push({ key: 'flight', cost: 1.0 });
          }
          const buff = buffOptions[Math.floor(Math.random() * buffOptions.length)];
          if (pointsSpent + buff.cost <= pointBudget) {
            result.permanentBuffs = { [buff.key]: true };
            pointsSpent += buff.cost;
            minorsApplied++;
          }
        }
        break;

      case 'spellBonus':
        {
          // +1 or +2 to spell save DC or spell attack
          const bonus = targetRarity === 'uncommon' ? 1 : Math.random() < 0.7 ? 1 : 2;
          const cost = bonus * 0.5;
          if (pointsSpent + cost <= pointBudget) {
            if (Math.random() < 0.5) {
              result.spellSaveDCBonus = bonus;
            } else {
              result.spellAttackBonus = bonus;
            }
            pointsSpent += cost;
            minorsApplied++;
          }
        }
        break;

      case 'advantage':
        // Advantage on specific rolls (not implemented in state, skip for now)
        break;
    }
  }

  // Set attunement: always for rare+ or items with 2+ features, sometimes for uncommon
  const totalFeatures = majorsApplied + minorsApplied;
  if (targetRarity !== 'uncommon' || totalFeatures >= 2) {
    result.attunement = true;
  } else {
    result.attunement = Math.random() < 0.4;
  }

  // Generate a random item name that matches the base item type
  result.itemName = generateRandomItemNameForBase(result.baseItem);

  return result;
}
