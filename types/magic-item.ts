export interface DamageBonus {
  dice: string; // "1d6", "2d6", etc.
  type: string; // "fire", "cold", "radiant", etc.
  conditional?: boolean; // true if only works vs specific creatures (dragons, giants, etc.)
}

export interface SpellCharge {
  spell: string;
  spellLevel: number;
  usesPerDay: number;
  recharge: 'dawn' | 'short rest' | 'long rest';
}

export interface CombatFeatures {
  enhancement: number; // 0, 1, 2, 3
  damageBonus?: DamageBonus;
  acBonus?: number;
  savingThrowBonus?: number;
  charges?: SpellCharge[];
  resistances?: string[]; // Damage types resisted: "fire", "cold", "all", etc.
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
}

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary';
