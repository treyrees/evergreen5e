// Conditional damage type - determines multiplier based on how often condition triggers
export type ConditionalType =
  | 'creature-common'  // Undead, fiends, humanoids - frequent encounters (0.6×)
  | 'creature-rare'    // Giants, dragons, constructs - less common (0.4×)
  | 'sworn-enemy'      // Single declared target - Oathbow style (0.6×)
  | 'environmental';   // "In darkness", "underwater", "against surprised" (0.25×)

export interface DamageBonus {
  dice: string; // "1d6", "2d6", etc.
  type: string; // "fire", "cold", "radiant", etc.
  frequency?: 'per-hit' | 'per-turn'; // per-hit (default) or once per turn
  conditional?: boolean; // DEPRECATED: use conditionalType instead
  conditionalType?: ConditionalType; // Specific condition category for accurate multiplier
  vicious?: boolean; // true if damage only applies on natural 20 (critical hits)
}

export interface SpellCharge {
  spell: string;
  spellLevel: number;
  usesPerDay: number;
  recharge: 'dawn' | 'short rest' | 'long rest';
}

export interface ChargedAbility {
  spell: string;
  spellLevel: number;
  chargesPerUse: number; // How many charges this ability consumes (default 1)
}

export interface ChargePool {
  maxCharges: number; // Total charges the item holds
  chargesPerShortRest: number; // Charges regained on short rest
  chargesPerLongRest: number; // Charges regained on long rest
  abilities: ChargedAbility[]; // Abilities that consume charges
}

export interface AbilityScoreSetter {
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  setValue: number; // 19, 21, 23, etc.
}

export interface AbilityScoreBonus {
  ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
  bonus: number; // +2, +4, +6, etc.
}

export interface Flight {
  duration?: 'unlimited' | 'limited'; // deprecated: use flyDuration instead
  hoursPerDay?: number; // deprecated: use flyDuration instead
  flySpeed?: number; // fly speed in feet (30, 50, 60, etc.)
  flyDuration?: number | 'unlimited'; // hours per day, or 'unlimited' for permanent
  requiresAction?: boolean; // bonus action to activate
}

// Permanent buffs - always-on passive benefits
export interface PermanentBuffs {
  flight?: boolean;           // Grants permanent flight (e.g., Wings of Flying)
  darkvision?: boolean;       // Grants darkvision 60 ft (e.g., Goggles of Night)
  blindsight?: boolean;       // Grants blindsight 30 ft (e.g., Robe of Eyes partial)
  speedBonus?: boolean;       // +10 ft movement speed (e.g., Boots of Striding)
  tremorsense?: boolean;      // Grants tremorsense 30 ft (e.g., rare earth-themed items)
  climbBurrow?: boolean;      // Grants climb or burrow speed (e.g., Slippers of Spider Climbing)
  truesight?: boolean;        // Grants truesight 60 ft (sees through illusions, invisibility, shapechangers, ethereal)
  seeInvisibility?: boolean;  // Can see invisible creatures and objects (weaker than truesight)
  swimming?: boolean;         // Grants swimming speed equal to walking speed (e.g., Cloak of the Manta Ray)
}

// Reaction-based AC bonus (e.g., Quarterstaff of the Acrobat's Attack Deflection)
export interface ReactionAC {
  bonus: number; // AC bonus when used (e.g., +5)
  usesPerShortRest?: number; // Times usable per short rest (if limited)
  usesPerLongRest?: number; // Times usable per long rest (if limited)
  unlimited?: boolean; // If true, can be used every reaction
}

// Bonus action damage (e.g., Shield of the Cavalier's Forceful Bash)
export interface BonusActionDamage {
  dice: string; // "2d6", etc.
  flatBonus?: number; // Fixed bonus like +2
  type: string; // Damage type
}

// Condition infliction on attacks (e.g., Energy Bow's Restraint)
export interface ConditionInfliction {
  condition: string; // "restrained", "prone", "frightened", etc.
  save: string; // "STR", "DEX", "CON", etc.
  dc: number; // Save DC
}

// Advantage types for checks and saves
export type AdvantageType =
  | 'initiative' // Advantage on Initiative rolls
  | 'perception' // Advantage on Perception checks
  | 'acrobatics' // Advantage on Acrobatics checks
  | 'stealth' // Advantage on Stealth checks
  | 'attack' // Advantage on attack rolls
  | 'saves' // Advantage on all saving throws
  | 'dex-saves' // Advantage on DEX saves
  | 'str-saves' // Advantage on STR saves
  | 'con-saves'; // Advantage on CON saves

// Weapon properties that can be added to magic weapons
// These represent properties not normally on the base weapon type
export type WeaponProperty =
  | 'finesse'         // Use DEX or STR for attack/damage rolls
  | 'heavy-two-handed' // Heavy and/or Two-Handed (combined negative property)
  | 'light'           // Enables two-weapon fighting
  | 'reach'           // +5 feet reach on attacks and opportunity attacks
  | 'thrown'          // Can throw for ranged attack
  | 'versatile';      // Can use with one or two hands

export interface CombatFeatures {
  enhancement: number; // 0, 1, 2, 3
  enhancementMultiplier?: number; // 0.5 for "Sometimes" active bonuses
  damageBonus?: DamageBonus;
  acBonus?: number;
  acBonusMultiplier?: number; // 0.5 for "Sometimes" active bonuses
  savingThrowBonus?: number;
  savingThrowBonusMultiplier?: number; // 0.5 for "Sometimes" active bonuses
  spellSaveDCBonus?: number; // Bonus to spell save DC (e.g., Robe of the Archmagi +2)
  spellAttackBonus?: number; // Bonus to spell attack rolls (e.g., Wand of the War Mage +1/+2/+3)
  charges?: SpellCharge[]; // Legacy format for existing SRD items
  chargePool?: ChargePool; // New intuitive format for user items
  resistances?: string[]; // Damage types resisted: "fire", "cold", "all", etc.
  resistancesMultiplier?: number; // 0.5 for "Sometimes" active resistances
  damageImmunities?: string[]; // Damage types immune to: "fire", "poison", etc.
  conditionImmunities?: string[]; // Conditions immune to: "charmed", "frightened", "poisoned", etc.
  abilityScoreSetter?: AbilityScoreSetter; // Sets ability score to fixed value (e.g., Gauntlets of Ogre Power set STR to 19)
  abilityScoreBonus?: AbilityScoreBonus; // Adds bonus to ability score (e.g., Headband of Intellect +2)
  flight?: Flight; // Grants flight (e.g., Broom of Flying, Winged Boots) - LEGACY: use permanentBuffs.flight instead
  permanentBuffs?: PermanentBuffs; // Always-on passive benefits (flight, senses, speed)

  // New SRD 5.2.1 mechanics
  advantage?: AdvantageType[]; // Advantage on specific checks/saves (e.g., Sentinel Shield: initiative, perception)
  reactionAC?: ReactionAC; // Reaction-based AC bonus (e.g., Quarterstaff of the Acrobat: +5 AC)
  bonusActionDamage?: BonusActionDamage; // Damage as bonus action (e.g., Shield of the Cavalier bash)
  conditionInfliction?: ConditionInfliction; // Inflict conditions on attacks (e.g., Energy Bow restraint)
  damageTypeOverride?: string; // Override weapon's damage type (e.g., Energy Bow: force instead of piercing)
  handsFreeDef?: boolean; // Animated Shield: provides defense without using a hand

  // Weapon properties (for adding properties not normally on the base weapon)
  weaponProperties?: WeaponProperty[]; // Added properties like finesse, reach, etc.
}

export interface RibbonFeatures {
  skills?: string[];
  mobilitySenses?: string[];
  social?: string[];
  exploration?: string[];
  utilitySpells?: string[];
  cosmetic?: string[];
}

export interface MagicItem {
  name: string;
  baseItem: string; // "longsword", "shield", etc.
  combat: CombatFeatures;
  ribbons?: RibbonFeatures;
  attunement: boolean;
  rarity?: string; // For SRD items
  manualRarity?: boolean; // If true, use official rarity instead of calculating
  overrideBonus?: number; // Points ADDED to calculated score for special mechanics we can't model (can be negative for limitations)
  description?: string; // Explains unmodeled mechanics that affect item power
  dndbeyondSlug?: string; // D&D Beyond URL slug, e.g., "4774-sun-blade" for https://www.dndbeyond.com/magic-items/4774-sun-blade
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
