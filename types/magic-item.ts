export interface DamageBonus {
  dice: string; // "1d6", "2d6", etc.
  type: string; // "fire", "cold", "radiant", etc.
  frequency?: 'per-hit' | 'per-turn'; // per-hit (default) or once per turn
  conditional?: boolean; // true if only works vs specific creatures (dragons, giants, etc.)
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
  duration: 'unlimited' | 'limited';
  hoursPerDay?: number; // if limited
  requiresAction?: boolean; // bonus action to activate
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

export interface CombatFeatures {
  enhancement: number; // 0, 1, 2, 3
  damageBonus?: DamageBonus;
  acBonus?: number;
  savingThrowBonus?: number;
  charges?: SpellCharge[]; // Legacy format for existing SRD items
  chargePool?: ChargePool; // New intuitive format for user items
  resistances?: string[]; // Damage types resisted: "fire", "cold", "all", etc.
  abilityScoreSetter?: AbilityScoreSetter; // Sets ability score to fixed value (e.g., Gauntlets of Ogre Power set STR to 19)
  abilityScoreBonus?: AbilityScoreBonus; // Adds bonus to ability score (e.g., Headband of Intellect +2)
  flight?: Flight; // Grants flight (e.g., Broom of Flying, Winged Boots)

  // New SRD 5.2.1 mechanics
  advantage?: AdvantageType[]; // Advantage on specific checks/saves (e.g., Sentinel Shield: initiative, perception)
  reactionAC?: ReactionAC; // Reaction-based AC bonus (e.g., Quarterstaff of the Acrobat: +5 AC)
  bonusActionDamage?: BonusActionDamage; // Damage as bonus action (e.g., Shield of the Cavalier bash)
  conditionInfliction?: ConditionInfliction; // Inflict conditions on attacks (e.g., Energy Bow restraint)
  damageTypeOverride?: string; // Override weapon's damage type (e.g., Energy Bow: force instead of piercing)
  handsFreeDef?: boolean; // Animated Shield: provides defense without using a hand
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
  overrideScore?: number; // Manual point value for items with special effects we can't model
  description?: string; // Explains unmodeled mechanics that affect item power
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
