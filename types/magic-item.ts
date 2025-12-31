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
  canUpcast?: boolean; // If true, can spend additional charges to upcast (+1 level per charge)
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
// Individual saves sum to 5.0 pts (Very Rare); select all 6 for "all saves"
export type AdvantageType =
  | 'initiative'      // Advantage on Initiative rolls (0.75 pts)
  | 'attack'          // Advantage on attack rolls with this weapon (1.0 pts)
  // Individual saves (sum to 5.0 pts when all selected)
  | 'dex-saves'       // Advantage on DEX saves (1.25 pts)
  | 'wis-saves'       // Advantage on WIS saves (1.10 pts)
  | 'con-saves'       // Advantage on CON saves (1.00 pts)
  | 'str-saves'       // Advantage on STR saves (0.65 pts)
  | 'cha-saves'       // Advantage on CHA saves (0.60 pts)
  | 'int-saves'       // Advantage on INT saves (0.40 pts)
  // Skills
  | 'perception'      // Advantage on Perception checks (0.25 pts)
  | 'stealth';        // Advantage on Stealth checks (0.25 pts)

// Weapon properties that can be added to magic weapons
// These represent properties not normally on the base weapon type
export type WeaponProperty =
  | 'finesse'         // Use DEX or STR for attack/damage rolls
  | 'heavy-two-handed' // Heavy and/or Two-Handed (combined negative property)
  | 'light'           // Enables two-weapon fighting
  | 'reach'           // +5 feet reach on attacks and opportunity attacks
  | 'thrown'          // Can throw for ranged attack
  | 'versatile';      // Can use with one or two hands

// Armor properties that can be added to magic armor
// Based on SRD 2024 and common 5e conventions
export type ArmorProperty =
  | 'fortified'       // Critical hits become normal hits (Adamantine Armor)
  | 'spiked'          // Deal 1d4 piercing to creatures grappling you
  | 'buoyant'         // No swimming penalty, can float
  | 'swift-donning'   // Don or doff as an action (like Mithral)
  | 'comfortable'     // Can sleep in armor without penalty
  | 'noisy';          // Disadvantage on Stealth (negative property)

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
  damageImmunitiesMultiplier?: number; // 0.5 for "Sometimes" active immunities
  conditionImmunities?: string[]; // Conditions immune to: "charmed", "frightened", "poisoned", etc.
  conditionImmunitiesMultiplier?: number; // 0.5 for "Sometimes" active immunities
  abilityScoreSetter?: AbilityScoreSetter; // Sets ability score to fixed value (e.g., Gauntlets of Ogre Power set STR to 19)
  abilityScoreBonus?: AbilityScoreBonus; // Adds bonus to ability score (e.g., Headband of Intellect +2)
  flight?: Flight; // Grants flight (e.g., Broom of Flying, Winged Boots) - LEGACY: use permanentBuffs.flight instead
  permanentBuffs?: PermanentBuffs; // Always-on passive benefits (flight, senses, speed)

  // New SRD 5.2.1 mechanics
  advantage?: AdvantageType[]; // Advantage on specific checks/saves (e.g., Sentinel Shield: initiative, perception)
  advantageMultiplier?: number; // 0.5 for "Sometimes" active advantages
  reactionAC?: ReactionAC; // Reaction-based AC bonus (e.g., Quarterstaff of the Acrobat: +5 AC)
  bonusActionDamage?: BonusActionDamage; // Damage as bonus action (e.g., Shield of the Cavalier bash)
  conditionInfliction?: ConditionInfliction; // Inflict conditions on attacks (e.g., Energy Bow restraint)
  damageTypeOverride?: string; // Override weapon's damage type (e.g., Energy Bow: force instead of piercing)
  handsFreeDef?: boolean; // Animated Shield: provides defense without using a hand

  // Weapon properties (for adding properties not normally on the base weapon)
  weaponProperties?: WeaponProperty[]; // Added properties like finesse, reach, etc.

  // Armor properties (for adding properties to armor/shields)
  armorProperties?: ArmorProperty[]; // Added properties like fortified, spiked, etc.
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

// ============================================
// Community Item Types (for user submissions)
// ============================================

// Curated emoji set for creator profiles (fantasy-themed)
export const CREATOR_EMOJIS = [
  // Weapons
  '⚔️', '🗡️', '🏹', '🔱', '🪓', '🛡️',
  // Magic
  '✨', '🔮', '💫', '⚡', '🔥', '❄️', '💀', '👁️',
  // Creatures
  '🐉', '🦅', '🐺', '🦇', '🕷️', '🐍', '🦎', '🐙',
  // Nature
  '🌙', '☀️', '🌊', '🍃', '🌲', '💎', '🌸', '🍄',
  // Misc
  '👑', '🎭', '📜', '🗝️', '⚰️', '🏰', '🎲', '🧙',
] as const;

export type CreatorEmoji = typeof CREATOR_EMOJIS[number];

// Curated accent color palette (fantasy-themed)
export const ACCENT_COLORS = {
  crimson: '#DC2626',
  amber: '#D97706',
  gold: '#CA8A04',
  emerald: '#059669',
  sapphire: '#2563EB',
  amethyst: '#7C3AED',
  silver: '#94A3B8',
  obsidian: '#334155',
} as const;

export type AccentColor = keyof typeof ACCENT_COLORS;

// Creator profile for community submissions
export interface CreatorProfile {
  id: string;
  displayName: string;
  emoji: CreatorEmoji;
  accentColor: AccentColor;
}

// Status of a community submission
export type SubmissionStatus = 'pending' | 'graduated';

// Community item extends MagicItem with submission metadata
export interface CommunityItem extends MagicItem {
  id: string;
  score: number; // Pre-calculated combat score
  suggestedRarity: Rarity;

  // Creator info (denormalized for display)
  creatorId: string;
  creatorDisplayName: string;
  creatorEmoji: CreatorEmoji;
  creatorAccentColor: AccentColor;

  // Voting & status
  upvotes: number;
  status: SubmissionStatus;

  // Timestamps
  createdAt: string; // ISO date string
  graduatedAt?: string; // ISO date string, set when status changes to 'graduated'
}

// Vote record
export interface Vote {
  id: string;
  voterId: string; // who voted
  submissionId: string; // which item
  vote: 'up' | 'pass';
  createdAt: string; // ISO date string
}

// User profile with ticket tracking
export interface UserProfile extends CreatorProfile {
  email: string;
  tickets: number;
  totalVotes: number; // Track votes to award free tickets (15 votes = 1 ticket)
  createdAt: string; // ISO date string
}
