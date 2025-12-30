/**
 * URL serialization utilities for shareable item links
 *
 * Encodes item state to a compact base64 URL parameter and decodes it back.
 * Excludes UI state and description (too long for URLs).
 */

import { DamageBonus, ChargedAbility, AbilityScoreSetter, AbilityScoreBonus, PermanentBuffs, WeaponProperty } from '@/types/magic-item';

// The shareable state - excludes UI state and description
export interface ShareableItemState {
  n?: string;  // itemName
  b?: string;  // baseItem
  e?: number;  // enhancement
  es?: boolean; // enhancementSometimes
  d?: {        // damageBonus
    c: number;   // diceCount
    t: string;   // diceType
    dt: string;  // damageType
    cd?: string; // conditional
  };
  ac?: number;  // acBonus
  acs?: boolean; // acBonusSometimes
  st?: number;  // savingThrowBonus
  sts?: boolean; // saveBonusSometimes
  r?: string[]; // resistances
  rs?: boolean; // resistancesSometimes
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
  resistances: string[];
  resistancesSometimes: boolean;
  attunement: boolean;
  abilityScoreSetter: AbilityScoreSetter | undefined;
  abilityScoreBonus: AbilityScoreBonus | undefined;
  permanentBuffs: PermanentBuffs;
  flightEnabled: boolean;
  flySpeed: number;
  flyDuration: number | 'unlimited';
  weaponProperties: WeaponProperty[];
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
  resistances: string[];
  resistancesSometimes: boolean;
  attunement: boolean;
  abilityScoreSetter: AbilityScoreSetter | undefined;
  abilityScoreBonus: AbilityScoreBonus | undefined;
  permanentBuffs: PermanentBuffs;
  flightEnabled: boolean;
  flySpeed: number;
  flyDuration: number | 'unlimited';
  weaponProperties: WeaponProperty[];
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
      c: state.damageBonus.diceCount,
      t: state.damageBonus.diceType,
      dt: state.damageBonus.damageType,
    };
    if (state.damageBonus.conditional) {
      compact.d.cd = state.damageBonus.conditional;
    }
  }

  if (state.acBonus > 0) compact.ac = state.acBonus;
  if (state.acBonusSometimes) compact.acs = true;
  if (state.savingThrowBonus > 0) compact.st = state.savingThrowBonus;
  if (state.saveBonusSometimes) compact.sts = true;
  if (state.resistances.length > 0) compact.r = state.resistances;
  if (state.resistancesSometimes) compact.rs = true;
  if (state.attunement) compact.att = true;

  if (state.abilityScoreSetter) {
    compact.ass = {
      a: state.abilityScoreSetter.ability,
      v: state.abilityScoreSetter.value,
    };
  }

  if (state.abilityScoreBonus) {
    compact.asb = {
      a: state.abilityScoreBonus.ability,
      v: state.abilityScoreBonus.value,
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

  if (state.maxCharges > 0 || state.abilities.length > 0) {
    compact.cp = {
      m: state.maxCharges,
      sr: state.chargesPerShortRest,
      lr: state.chargesPerLongRest,
      ab: state.abilities.map(a => ({
        n: a.name,
        l: a.level,
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
        diceCount: compact.d.c,
        diceType: compact.d.t,
        damageType: compact.d.dt,
        conditional: compact.d.cd,
      } : undefined,
      acBonus: compact.ac || 0,
      acBonusSometimes: compact.acs || false,
      savingThrowBonus: compact.st || 0,
      saveBonusSometimes: compact.sts || false,
      resistances: compact.r || [],
      resistancesSometimes: compact.rs || false,
      attunement: compact.att || false,
      abilityScoreSetter: compact.ass ? {
        ability: compact.ass.a,
        value: compact.ass.v,
      } : undefined,
      abilityScoreBonus: compact.asb ? {
        ability: compact.asb.a,
        value: compact.asb.v,
      } : undefined,
      permanentBuffs: compact.pb || {},
      flightEnabled: !!compact.fl,
      flySpeed: compact.fl?.s || 30,
      flyDuration: compact.fl?.d || 4,
      weaponProperties: compact.wp || [],
      maxCharges: compact.cp?.m || 0,
      chargesPerShortRest: compact.cp?.sr || 0,
      chargesPerLongRest: compact.cp?.lr || 0,
      abilities: (compact.cp?.ab || []).map(a => ({
        name: a.n,
        level: a.l,
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
