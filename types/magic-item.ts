export interface DamageBonus {
  dice: string; // "1d6", "2d6", etc.
  type: string; // "fire", "cold", "radiant", etc.
  frequency?: 'per-hit' | 'per-turn'; // per-hit (default) or once per turn
  conditional?: boolean; // true if only works vs specific creatures (dragons, giants, etc.)
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

export interface Flight {
  duration: 'unlimited' | 'limited';
  hoursPerDay?: number; // if limited
  requiresAction?: boolean; // bonus action to activate
}

export interface CombatFeatures {
  enhancement: number; // 0, 1, 2, 3
  damageBonus?: DamageBonus;
  acBonus?: number;
  savingThrowBonus?: number;
  charges?: SpellCharge[]; // Legacy format for existing SRD items
  chargePool?: ChargePool; // New intuitive format for user items
  resistances?: string[]; // Damage types resisted: "fire", "cold", "all", etc.
  abilityScoreSetter?: AbilityScoreSetter; // Sets ability score to fixed value (e.g., Gauntlets of Ogre Power)
  flight?: Flight; // Grants flight (e.g., Broom of Flying, Winged Boots)
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
  description?: string; // Explains unmodeled mechanics that affect item power
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
