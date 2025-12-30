/**
 * URL serialization utilities for shareable item links
 *
 * Encodes item state to a compact base64 URL parameter and decodes it back.
 * Excludes UI state and description (too long for URLs).
 */

import { DamageBonus, ChargedAbility, AbilityScoreSetter, AbilityScoreBonus, PermanentBuffs, WeaponProperty, ArmorProperty } from '@/types/magic-item';

// The shareable state - excludes UI state and description
export interface ShareableItemState {
  n?: string;  // itemName
  b?: string;  // baseItem
  e?: number;  // enhancement
  es?: boolean; // enhancementSometimes
  d?: {        // damageBonus
    di: string;  // dice (e.g. "1d6")
    t: string;   // type (damage type)
    f?: 'per-hit' | 'per-turn'; // frequency
    c?: boolean; // conditional
    v?: boolean; // vicious
  };
  ac?: number;  // acBonus
  acs?: boolean; // acBonusSometimes
  st?: number;  // savingThrowBonus
  sts?: boolean; // saveBonusSometimes
  sdc?: number; // spellSaveDCBonus
  sab?: number; // spellAttackBonus
  r?: string[]; // resistances
  rs?: boolean; // resistancesSometimes
  di?: string[]; // damageImmunities
  dis?: boolean; // damageImmunitiesSometimes
  ci?: string[]; // conditionImmunities
  cis?: boolean; // conditionImmunitiesSometimes
  att?: boolean; // attunement
  // Ability score setter
  ass?: {
    a: string;   // ability
    v: number;   // value
  };
  // Ability score bonus
  asb?: {
    a: string;   // ability
    v: number;   // value
  };
  // Permanent buffs
  pb?: PermanentBuffs;
  // Flight
  fl?: {
    s: number;           // flySpeed
    d: number | 'unlimited'; // flyDuration
  };
  // Weapon properties
  wp?: WeaponProperty[];
  // Armor properties
  ap?: ArmorProperty[];
  // Charge pool
  cp?: {
    m: number;  // maxCharges
    sr: number; // chargesPerShortRest
    lr: number; // chargesPerLongRest
    ab: Array<{  // abilities
      n: string;   // name
      l: number;   // level
      c: number;   // chargesPerUse
    }>;
  };
}

export interface DecodedItemState {
  itemName: string;
  baseItem: string;
  enhancement: number;
  enhancementSometimes: boolean;
  damageBonus: DamageBonus | undefined;
  acBonus: number;
  acBonusSometimes: boolean;
  savingThrowBonus: number;
  saveBonusSometimes: boolean;
  spellSaveDCBonus: number;
  spellAttackBonus: number;
  resistances: string[];
  resistancesSometimes: boolean;
  damageImmunities: string[];
  damageImmunitiesSometimes: boolean;
  conditionImmunities: string[];
  conditionImmunitiesSometimes: boolean;
  attunement: boolean;
  abilityScoreSetter: AbilityScoreSetter | undefined;
  abilityScoreBonus: AbilityScoreBonus | undefined;
  permanentBuffs: PermanentBuffs;
  flightEnabled: boolean;
  flySpeed: number;
  flyDuration: number | 'unlimited';
  weaponProperties: WeaponProperty[];
  armorProperties: ArmorProperty[];
  maxCharges: number;
  chargesPerShortRest: number;
  chargesPerLongRest: number;
  abilities: ChargedAbility[];
}

/**
 * Encode item state to a URL-safe base64 string
 */
export function encodeItemToUrl(state: {
  itemName: string;
  baseItem: string;
  enhancement: number;
  enhancementSometimes: boolean;
  damageBonus: DamageBonus | undefined;
  acBonus: number;
  acBonusSometimes: boolean;
  savingThrowBonus: number;
  saveBonusSometimes: boolean;
  spellSaveDCBonus: number;
  spellAttackBonus: number;
  resistances: string[];
  resistancesSometimes: boolean;
  damageImmunities: string[];
  damageImmunitiesSometimes: boolean;
  conditionImmunities: string[];
  conditionImmunitiesSometimes: boolean;
  attunement: boolean;
  abilityScoreSetter: AbilityScoreSetter | undefined;
  abilityScoreBonus: AbilityScoreBonus | undefined;
  permanentBuffs: PermanentBuffs;
  flightEnabled: boolean;
  flySpeed: number;
  flyDuration: number | 'unlimited';
  weaponProperties: WeaponProperty[];
  armorProperties: ArmorProperty[];
  maxCharges: number;
  chargesPerShortRest: number;
  chargesPerLongRest: number;
  abilities: ChargedAbility[];
}): string {
  // Build compact representation, only including non-default values
  const compact: ShareableItemState = {};

  if (state.itemName) compact.n = state.itemName;
  if (state.baseItem) compact.b = state.baseItem;
  if (state.enhancement > 0) compact.e = state.enhancement;
  if (state.enhancementSometimes) compact.es = true;

  if (state.damageBonus) {
    compact.d = {
      di: state.damageBonus.dice,
      t: state.damageBonus.type,
    };
    if (state.damageBonus.frequency && state.damageBonus.frequency !== 'per-hit') {
      compact.d.f = state.damageBonus.frequency;
    }
    if (state.damageBonus.conditional) {
      compact.d.c = true;
    }
    if (state.damageBonus.vicious) {
      compact.d.v = true;
    }
  }

  if (state.acBonus > 0) compact.ac = state.acBonus;
  if (state.acBonusSometimes) compact.acs = true;
  if (state.savingThrowBonus > 0) compact.st = state.savingThrowBonus;
  if (state.saveBonusSometimes) compact.sts = true;
  if (state.spellSaveDCBonus > 0) compact.sdc = state.spellSaveDCBonus;
  if (state.spellAttackBonus > 0) compact.sab = state.spellAttackBonus;
  if (state.resistances.length > 0) compact.r = state.resistances;
  if (state.resistancesSometimes) compact.rs = true;
  if (state.damageImmunities.length > 0) compact.di = state.damageImmunities;
  if (state.damageImmunitiesSometimes) compact.dis = true;
  if (state.conditionImmunities.length > 0) compact.ci = state.conditionImmunities;
  if (state.conditionImmunitiesSometimes) compact.cis = true;
  if (state.attunement) compact.att = true;

  if (state.abilityScoreSetter) {
    compact.ass = {
      a: state.abilityScoreSetter.ability,
      v: state.abilityScoreSetter.setValue,
    };
  }

  if (state.abilityScoreBonus) {
    compact.asb = {
      a: state.abilityScoreBonus.ability,
      v: state.abilityScoreBonus.bonus,
    };
  }

  // Only include permanent buffs that are true
  const activePermanentBuffs = Object.entries(state.permanentBuffs)
    .filter(([, v]) => v === true)
    .reduce((acc, [k]) => ({ ...acc, [k]: true }), {} as PermanentBuffs);
  if (Object.keys(activePermanentBuffs).length > 0) {
    compact.pb = activePermanentBuffs;
  }

  if (state.flightEnabled) {
    compact.fl = {
      s: state.flySpeed,
      d: state.flyDuration,
    };
  }

  if (state.weaponProperties.length > 0) {
    compact.wp = state.weaponProperties;
  }

  if (state.armorProperties.length > 0) {
    compact.ap = state.armorProperties;
  }

  if (state.maxCharges > 0 || state.abilities.length > 0) {
    compact.cp = {
      m: state.maxCharges,
      sr: state.chargesPerShortRest,
      lr: state.chargesPerLongRest,
      ab: state.abilities.map(a => ({
        n: a.spell,
        l: a.spellLevel,
        c: a.chargesPerUse,
      })),
    };
  }

  const json = JSON.stringify(compact);
  // Use URL-safe base64 (replace + with -, / with _, remove padding =)
  const base64 = btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64;
}

/**
 * Decode a URL parameter back to item state
 * Returns null if decoding fails
 */
export function decodeItemFromUrl(encoded: string): DecodedItemState | null {
  try {
    // Restore standard base64 from URL-safe version
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = atob(base64);
    const compact: ShareableItemState = JSON.parse(json);

    // Reconstruct full state with defaults
    const state: DecodedItemState = {
      itemName: compact.n || '',
      baseItem: compact.b || '',
      enhancement: compact.e || 0,
      enhancementSometimes: compact.es || false,
      damageBonus: compact.d ? {
        dice: compact.d.di,
        type: compact.d.t,
        frequency: compact.d.f || 'per-hit',
        conditional: compact.d.c || false,
        vicious: compact.d.v || false,
      } : undefined,
      acBonus: compact.ac || 0,
      acBonusSometimes: compact.acs || false,
      savingThrowBonus: compact.st || 0,
      saveBonusSometimes: compact.sts || false,
      spellSaveDCBonus: compact.sdc || 0,
      spellAttackBonus: compact.sab || 0,
      resistances: compact.r || [],
      resistancesSometimes: compact.rs || false,
      damageImmunities: compact.di || [],
      damageImmunitiesSometimes: compact.dis || false,
      conditionImmunities: compact.ci || [],
      conditionImmunitiesSometimes: compact.cis || false,
      attunement: compact.att || false,
      abilityScoreSetter: compact.ass ? {
        ability: compact.ass.a as 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
        setValue: compact.ass.v,
      } : undefined,
      abilityScoreBonus: compact.asb ? {
        ability: compact.asb.a as 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA',
        bonus: compact.asb.v,
      } : undefined,
      permanentBuffs: compact.pb || {},
      flightEnabled: !!compact.fl,
      flySpeed: compact.fl?.s || 30,
      flyDuration: compact.fl?.d || 4,
      weaponProperties: compact.wp || [],
      armorProperties: compact.ap || [],
      maxCharges: compact.cp?.m || 0,
      chargesPerShortRest: compact.cp?.sr || 0,
      chargesPerLongRest: compact.cp?.lr || 0,
      abilities: (compact.cp?.ab || []).map(a => ({
        spell: a.n,
        spellLevel: a.l,
        chargesPerUse: a.c,
      })),
    };

    return state;
  } catch {
    console.error('Failed to decode item from URL');
    return null;
  }
}

/**
 * Generate a full shareable URL for the current item
 */
export function generateShareUrl(state: Parameters<typeof encodeItemToUrl>[0]): string {
  const encoded = encodeItemToUrl(state);
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/calculator`
    : '/calculator';
  return `${baseUrl}?item=${encoded}`;
}
