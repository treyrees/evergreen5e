import { CombatFeatures, Rarity, MagicItem, PermanentBuffs, WeaponProperty } from '@/types/magic-item';
import srdItems from '@/data/srd-items.json';

// Calculate dice value dynamically based on number and type
// Base values per die type (relative to d6 = 1.0)
const DIE_TYPE_VALUES: Record<string, number> = {
  'd4': 0.5,    // 2.5 avg vs 3.5 for d6
  'd6': 1.0,    // baseline
  'd8': 1.25,   // 4.5 avg vs 3.5 for d6
  'd10': 1.5,   // 5.5 avg vs 3.5 for d6
  'd12': 1.75,  // 6.5 avg vs 3.5 for d6
  'd20': 2.5,   // 10.5 avg (rarely used for damage, but supported)
};

// Damage type multipliers based on resistance/immunity prevalence in 5e
// Note: Physical damage from magic items is magical, bypassing "resistance to non-magical attacks"
const DAMAGE_TYPE_MULTIPLIERS: Record<string, number> = {
  // Strong types (fewer resistances/immunities)
  'force': 1.2,      // Almost nothing resists force
  'psychic': 1.15,   // Very few resistances
  'radiant': 1.1,    // Fewer resistances, strong vs undead

  // Neutral types (baseline - most common damage types)
  'fire': 1.0,       // Baseline despite common resistance
  'cold': 1.0,
  'lightning': 1.0,
  'thunder': 1.0,
  'acid': 1.0,
  'bludgeoning': 1.0,  // Magic weapon damage bypasses non-magical resistance
  'piercing': 1.0,
  'slashing': 1.0,

  // Weak types (more resistances/immunities)
  'necrotic': 0.9,   // Some resistances
  'poison': 0.7,     // Very commonly resisted/immune
};

function getDiceValue(diceString: string): number {
  const match = diceString.match(/^(\d+)d(\d+)$/);
  if (!match) return 0;

  const numDice = parseInt(match[1]);
  const dieType = `d${match[2]}`;
  const baseValue = DIE_TYPE_VALUES[dieType] || 1.0;

  return numDice * baseValue;
}

// Recharge frequency multipliers
// These represent the value of spell abilities based on how often they recharge
// Tuned so Wand of Fireballs (Lv3 × 4 uses) = 2.4 pts (Rare tier)
const RECHARGE_MULTIPLIERS: Record<string, number> = {
  'dawn': 0.10,  // Lower because wands/staves don't fully recharge (typically 1d6+1)
  'long rest': 0.20,  // Reduced from 0.25 to fix wand overvaluation
  'short rest': 0.4,
};

// Item categories for better anchor matching
const ITEM_CATEGORIES: Record<string, string> = {
  // Melee weapons - Simple
  'club': 'melee-weapon',
  'dagger': 'melee-weapon',
  'greatclub': 'melee-weapon',
  'handaxe': 'melee-weapon',
  'javelin': 'melee-weapon',
  'mace': 'melee-weapon',
  'quarterstaff': 'melee-weapon',
  'spear': 'melee-weapon',

  // Melee weapons - Martial
  'battleaxe': 'melee-weapon',
  'flail': 'melee-weapon',
  'glaive': 'melee-weapon',
  'greataxe': 'melee-weapon',
  'greatsword': 'melee-weapon',
  'halberd': 'melee-weapon',
  'lance': 'melee-weapon',
  'longsword': 'melee-weapon',
  'maul': 'melee-weapon',
  'morningstar': 'melee-weapon',
  'pike': 'melee-weapon',
  'rapier': 'melee-weapon',
  'scimitar': 'melee-weapon',
  'shortsword': 'melee-weapon',
  'trident': 'melee-weapon',
  'warhammer': 'melee-weapon',
  'whip': 'melee-weapon',

  // Ranged weapons
  'crossbow (hand)': 'ranged-weapon',
  'crossbow (heavy)': 'ranged-weapon',
  'crossbow (light)': 'ranged-weapon',
  'longbow': 'ranged-weapon',
  'shortbow': 'ranged-weapon',

  // Defensive gear
  'shield': 'defensive',
  'armor (light)': 'defensive',
  'armor (medium)': 'defensive',
  'armor (heavy)': 'defensive',

  // Magic implements
  'staff': 'implement',
  'wand': 'implement',
  'rod': 'implement',

  // Accessories
  'ring': 'accessory',
  'amulet': 'accessory',
  'cloak': 'accessory',
  'boots': 'accessory',
  'gloves': 'accessory',
};

/**
 * Get item category for matching purposes
 */
function getItemCategory(baseItem: string): string {
  return ITEM_CATEGORIES[baseItem] || 'other';
}

/**
 * Get broad category for matching purposes
 * Returns: 'weapon', 'armor', or 'trinket'
 */
function getBroadCategory(baseItem: string): 'weapon' | 'armor' | 'trinket' {
  const category = getItemCategory(baseItem);

  if (category === 'melee-weapon' || category === 'ranged-weapon') {
    return 'weapon';
  }

  if (category === 'defensive') {
    return 'armor';
  }

  // Everything else (implements, accessories, other) is a trinket
  return 'trinket';
}

/**
 * Check if an item is a generic +X item (used as fallback only)
 */
function isGenericItem(item: MagicItem): boolean {
  const genericPatterns = [
    /^\+\d+ Weapon$/,
    /^\+\d+ Armor$/,
    /^\+\d+ Shield$/,
    /^\+\d+ Crossbow$/,
    /^\+\d+ Bow$/,
  ];
  return genericPatterns.some(pattern => pattern.test(item.name));
}

/**
 * Check if a user item is "simple" - only has +N enhancement (weapons) or +N AC (armor/shields)
 * with no attunement and no other combat features. Simple in, simple out.
 */
function isSimpleItem(userItem: Partial<MagicItem>): { isSimple: boolean; enhancementLevel: number; type: 'weapon' | 'armor' | 'shield' | null } {
  if (!userItem.combat) return { isSimple: false, enhancementLevel: 0, type: null };
  if (userItem.attunement) return { isSimple: false, enhancementLevel: 0, type: null };

  const combat = userItem.combat;
  const broadCategory = userItem.baseItem ? getBroadCategory(userItem.baseItem) : 'trinket';

  // Check for any "extra" features that make it not simple
  const hasExtraFeatures =
    combat.damageBonus !== undefined ||
    combat.resistances !== undefined ||
    combat.charges !== undefined ||
    combat.chargePool !== undefined ||
    combat.abilityScoreSetter !== undefined ||
    combat.abilityScoreBonus !== undefined ||
    combat.flight !== undefined ||
    combat.permanentBuffs !== undefined ||
    combat.advantage !== undefined ||
    combat.reactionAC !== undefined ||
    combat.bonusActionDamage !== undefined ||
    combat.conditionInfliction !== undefined;

  if (hasExtraFeatures) return { isSimple: false, enhancementLevel: 0, type: null };

  // For weapons: only enhancement bonus
  if (broadCategory === 'weapon') {
    const enhancement = combat.enhancement || 0;
    if (enhancement >= 1 && enhancement <= 3 && !combat.acBonus && !combat.savingThrowBonus) {
      return { isSimple: true, enhancementLevel: enhancement, type: 'weapon' };
    }
  }

  // For armor: only AC bonus (no enhancement on armor)
  if (broadCategory === 'armor') {
    const acBonus = combat.acBonus || 0;
    const isShield = userItem.baseItem === 'shield';
    if (acBonus >= 1 && acBonus <= 3 && !combat.enhancement && !combat.savingThrowBonus) {
      return { isSimple: true, enhancementLevel: acBonus, type: isShield ? 'shield' : 'armor' };
    }
  }

  return { isSimple: false, enhancementLevel: 0, type: null };
}

/**
 * Get the score for an item, adding overrideBonus for special mechanics
 */
export function getItemScore(item: Partial<MagicItem>): number {
  const baseScore = item.combat ? calculateCombatScore(item.combat, item.baseItem) : 0;
  const bonus = item.overrideBonus ?? 0;
  return baseScore + bonus;
}

/**
 * Calculate combat power score from combat features
 * @param combat - The combat features to score
 * @param baseItem - Optional base item type (used for AC stacking calculations)
 */
export function calculateCombatScore(combat: CombatFeatures, baseItem?: string): number {
  let score = 0;

  // Determine if this is an armor/shield item (AC doesn't stack) or other (AC stacks)
  // AC on non-armor items is more valuable because it stacks with armor+shield
  const isArmorOrShield = baseItem && ['armor (light)', 'armor (medium)', 'armor (heavy)', 'shield'].includes(baseItem);
  const acStackingMultiplier = isArmorOrShield ? 1.0 : 1.5;

  // Enhancement bonus (with optional "Sometimes" multiplier)
  const enhancementMultiplier = combat.enhancementMultiplier ?? 1.0;
  score += combat.enhancement * enhancementMultiplier;

  // Damage bonus
  if (combat.damageBonus?.dice) {
    let diceValue = getDiceValue(combat.damageBonus.dice);

    // Damage type multiplier
    // Some damage types are more valuable due to fewer resistances/immunities
    const damageType = combat.damageBonus.type.toLowerCase();
    const typeMultiplier = DAMAGE_TYPE_MULTIPLIERS[damageType] || 1.0;
    diceValue *= typeMultiplier;

    // Vicious (critical-only damage): only applies on natural 20 (5% of attacks)
    // Average 2d6 = 7 damage, so expected value = 0.05 × 7 = 0.35
    // We round to 0.5 to account for psychological impact and crit synergy
    if (combat.damageBonus.vicious) {
      diceValue *= 0.05; // Only applies 5% of the time
    }
    // Frequency multiplier (if not vicious)
    // - per-hit (default): 1.0 - applies to every attack
    // - per-turn: 0.4 - only applies once per turn (even with multiple attacks)
    else {
      const frequency = combat.damageBonus.frequency || 'per-hit';
      if (frequency === 'per-turn') {
        diceValue *= 0.4;
      }
    }

    // Conditional damage - multiplier based on condition type
    // More specific types allow better balance tuning
    if (combat.damageBonus.conditionalType) {
      const conditionalMultipliers: Record<string, number> = {
        'creature-common': 0.6,   // Undead, fiends, humanoids - frequent
        'creature-rare': 0.4,     // Giants, dragons, constructs - less common
        'sworn-enemy': 0.6,       // Single declared target (Oathbow) - always active in combat
        'environmental': 0.25,    // "In darkness", "underwater", situational
      };
      diceValue *= conditionalMultipliers[combat.damageBonus.conditionalType] || 0.5;
    } else if (combat.damageBonus.conditional) {
      // Legacy fallback for items without specific type
      diceValue *= 0.5;
    }

    score += diceValue;
  }

  // AC bonus (with optional "Sometimes" multiplier)
  // AC on non-armor items (weapons, rings, cloaks) is worth more because it stacks with armor
  // This reflects bounded accuracy - stacking AC from multiple sources breaks encounter math
  if (combat.acBonus) {
    const acMultiplier = combat.acBonusMultiplier ?? 1.0;
    score += combat.acBonus * acMultiplier * acStackingMultiplier;
  }

  // Saving throw bonus (with optional "Sometimes" multiplier)
  if (combat.savingThrowBonus) {
    const saveMultiplier = combat.savingThrowBonusMultiplier ?? 1.0;
    score += combat.savingThrowBonus * saveMultiplier;
  }

  // Spell save DC bonus - powerful for spellcasters
  // +2 to DC means ~10% higher success rate on spells, affects all save-based spells
  // Valued at 1.0 pts per +1 (same as enhancement - both affect "hit rate" equivalently)
  if (combat.spellSaveDCBonus) {
    score += combat.spellSaveDCBonus * 1.0;
  }

  // Spell attack bonus - valuable for attack roll spells
  // Less impactful than spell save DC since fewer spells use attack rolls
  // Wand of the War Mage (+1/+2/+3) is Uncommon/Rare/Very Rare - but also ignores cover
  // Estimate at 0.75 pts per +1 (lower than enhancement since spell-attack only)
  if (combat.spellAttackBonus) {
    score += combat.spellAttackBonus * 0.75;
  }

  // Ability score setter - scales with value AND ability type
  // Different abilities have different combat value:
  // - CON: HP, concentration saves, common saves → 2.0 pts (Amulet of Health = Rare)
  // - DEX: AC, initiative, very common saves → 1.75 pts
  // - STR: Melee damage, athletics, less common saves → 1.5 pts (Gauntlets = Uncommon)
  // - WIS: Common saves, Perception → 1.5 pts
  // - INT: Uncommon saves, Investigation → 1.0 pts (Headband = Uncommon)
  // - CHA: Social, some saves → 1.0 pts
  if (combat.abilityScoreSetter) {
    const setValue = combat.abilityScoreSetter.setValue;
    const ability = combat.abilityScoreSetter.ability?.toUpperCase() || 'STR';

    // Base value depends on the target value
    let baseValue: number;
    if (setValue >= 25) baseValue = 4.0;      // +7 modifier (epic)
    else if (setValue >= 23) baseValue = 3.5; // +6 modifier (very powerful)
    else if (setValue >= 21) baseValue = 3.0; // +5 modifier (powerful)
    else if (setValue >= 20) baseValue = 2.0; // +5 modifier (strong)
    else baseValue = 1.5;                      // 19 or lower (+4 modifier, baseline)

    // Ability type multiplier (applied to base value of 1.5, scales with higher values)
    const abilityMultipliers: Record<string, number> = {
      'CON': 1.34,  // 1.5 × 1.34 = 2.01 (Rare tier for Amulet of Health)
      'DEX': 1.17,  // 1.5 × 1.17 = 1.75
      'STR': 1.0,   // 1.5 × 1.0 = 1.5 (baseline for Gauntlets)
      'WIS': 1.0,   // 1.5 × 1.0 = 1.5
      'INT': 1.0,   // 1.5 × 1.0 = 1.5 (Headband = Uncommon works)
      'CHA': 1.0,   // 1.5 × 1.0 = 1.5
    };

    const multiplier = abilityMultipliers[ability] || 1.0;
    score += baseValue * multiplier;
  }

  // Ability score bonus - adds to existing score
  // +2 ability = +1 modifier (affects multiple rolls) ≈ 0.75 pts per +1 ability
  if (combat.abilityScoreBonus) {
    score += combat.abilityScoreBonus.bonus * 0.75;
  }

  // Flight - one of the most powerful abilities in D&D
  // Additive model: speed is the primary driver, duration adds a small bonus
  // Speed matters most because 60 ft outpaces most creatures; 30 ft still grants vertical mobility
  // Duration has diminishing returns: 4+ hours covers a full adventuring day
  //
  // Calibrated to SRD:
  // - Wings of Flying (60 ft, 1 hr): 2.0 + 0.0 = 2.0 pts (Rare) ✓
  // - Broom of Flying (50 ft, unlimited): 1.0 + 0.1 = 1.1 pts (Uncommon) ✓
  // - Winged Boots (30 ft, 4 hrs): 0.75 + 0.25 = 1.0 pts (Uncommon) ✓
  if (combat.flight) {
    // New format with flySpeed and flyDuration
    if (combat.flight.flySpeed !== undefined || combat.flight.flyDuration !== undefined) {
      const flySpeed = combat.flight.flySpeed || 30; // Default to 30 ft
      const flyDuration = combat.flight.flyDuration; // hours or 'unlimited'

      // Speed is the primary value driver
      // 60 ft is exceptional (matches adult dragons), 30 ft is still very useful
      let speedScore: number;
      if (flySpeed >= 60) speedScore = 2.0;
      else if (flySpeed >= 50) speedScore = 1.0;
      else if (flySpeed >= 40) speedScore = 0.85;
      else speedScore = 0.75; // 30 ft or less

      // Duration bonus (additive) - diminishing returns after 4 hours
      // 1 hour is tactical (enough for combat), unlimited is marginally better
      let durationBonus: number;
      if (flyDuration === 'unlimited') {
        durationBonus = 0.1; // Marginally better than 4+ hours for adventuring convenience
      } else if (typeof flyDuration === 'number') {
        if (flyDuration >= 4) durationBonus = 0.25; // Full adventuring day coverage
        else if (flyDuration >= 2) durationBonus = 0.15;
        else durationBonus = 0.0; // 1 hour - tactical, no bonus
      } else {
        durationBonus = 0.0; // Default to tactical (1 hour equivalent)
      }

      score += speedScore + durationBonus;
    }
    // Legacy format support (deprecated)
    else if (combat.flight.duration === 'unlimited') {
      score += 1.5; // Reduced from 2.0 to better match Broom of Flying = Uncommon
    } else if (combat.flight.hoursPerDay && combat.flight.hoursPerDay >= 4) {
      score += 1.0; // Winged Boots = Uncommon
    } else {
      score += 1.0; // Limited flight baseline
    }
  }

  // Permanent Buffs - always-on passive benefits (new simplified format)
  // These are permanent effects with no duration tracking
  if (combat.permanentBuffs) {
    const PERMANENT_BUFF_VALUES: Record<keyof PermanentBuffs, number> = {
      flight: 2.0,          // Permanent flight is extremely powerful - tactical dominance
      darkvision: 0.25,     // Useful but many races have it; like Goggles of Night (Uncommon)
      blindsight: 0.75,     // Rare and powerful - see invisible, through illusions
      speedBonus: 0.5,      // +10 ft movement is always useful; like Boots of Striding
      tremorsense: 0.5,     // Detect invisible/hidden creatures through ground vibration
      climbBurrow: 0.5,     // Climb/burrow speed is useful for mobility; like Slippers of Spider Climbing
      truesight: 1.5,       // Sees through all illusions, invisibility, shapechangers, into ethereal - premium sense
      seeInvisibility: 0.75, // Detects invisible creatures - valuable but less than truesight
      swimming: 0.5,        // Swimming speed equal to walking - like Cloak of the Manta Ray
    };

    for (const [buff, enabled] of Object.entries(combat.permanentBuffs)) {
      if (enabled && buff in PERMANENT_BUFF_VALUES) {
        score += PERMANENT_BUFF_VALUES[buff as keyof PermanentBuffs];
      }
    }
  }

  // Damage resistances - value varies by damage type based on monster damage frequency
  // Higher values for common damage types (fire, poison), lower for rare (force, radiant)
  // Physical types (bludgeoning/piercing/slashing) are individually worth less since you need all 3
  // to be fully protected from physical attacks - combined they'd total 3.75 pts (Very Rare equivalent)
  if (combat.resistances && combat.resistances.length > 0) {
    const resistMultiplier = combat.resistancesMultiplier ?? 1.0;
    const DAMAGE_RESISTANCE_VALUES: Record<string, number> = {
      // Very common damage sources - single category covers all fire/poison/cold
      'fire': 2.25,         // Dragons, elementals, traps, spells - extremely common
      'poison': 2.0,        // Many monsters deal poison, often with condition
      'cold': 2.0,          // Dragons (white/silver), winter creatures, spells
      // Moderately common damage sources
      'necrotic': 1.75,     // Undead are common enemies
      'lightning': 1.75,    // Blue dragons, storm creatures
      'acid': 1.5,          // Black dragons, oozes - less common
      // Physical types - worth less individually since you need all 3 for full protection
      // Combined (all physical) = 3.75 pts ≈ Very Rare
      'bludgeoning': 1.25,  // Clubs, fists, tails, constrict, falling
      'piercing': 1.25,     // Bites, claws, arrows, spears
      'slashing': 1.25,     // Swords, axes, some claws
      // Rare damage sources - fewer monsters deal these
      'thunder': 1.25,      // Rarely dealt by monsters
      'psychic': 1.0,       // Mind flayers, intellect devourers
      'radiant': 0.75,      // Almost no monsters deal radiant damage
      'force': 0.5,         // Nothing deals force damage to players
    };

    for (const resistance of combat.resistances) {
      const resistanceLower = resistance.toLowerCase();
      score += (DAMAGE_RESISTANCE_VALUES[resistanceLower] ?? 1.5) * resistMultiplier;
    }
  }

  // Damage immunities - roughly 1.5-2× resistance values since you take 0 instead of half
  // Higher values for common damage types, lower for rare types
  // Physical types individually worth less (need all 3 for full protection)
  if (combat.damageImmunities && combat.damageImmunities.length > 0) {
    const immunityMultiplier = combat.damageImmunitiesMultiplier ?? 1.0;
    const DAMAGE_IMMUNITY_VALUES: Record<string, number> = {
      // Very common damage sources - immunity is extremely valuable
      'fire': 4.0,        // Dragons, elementals, spells - never worry about fireballs
      'poison': 4.0,      // Many monsters + often blocks poisoned condition too
      'cold': 3.5,        // Dragons, winter environments, ice spells
      // Moderately common damage sources
      'necrotic': 3.0,    // Undead deal this frequently
      'lightning': 3.0,   // Blue dragons, storm creatures
      'acid': 2.5,        // Black dragons, oozes - less common
      // Physical types - worth less individually (need all 3 for full protection)
      // Combined (all physical) = 6.75 pts ≈ Legendary+ equivalent
      'bludgeoning': 2.25, // Clubs, fists, tails, constrict
      'piercing': 2.25,    // Bites, claws, arrows
      'slashing': 2.25,    // Swords, axes, some claws
      // Rare damage sources - immunity less impactful
      'thunder': 2.0,      // Rarely needed
      'psychic': 1.75,     // Mind flayers, few others
      'radiant': 1.25,     // Few monsters deal radiant
      'force': 0.75,       // Almost never relevant defensively
    };

    for (const immunity of combat.damageImmunities) {
      const immunityLower = immunity.toLowerCase();
      score += (DAMAGE_IMMUNITY_VALUES[immunityLower] ?? 2.5) * immunityMultiplier;
    }
  }

  // Condition immunities - varies by condition severity (with optional "Sometimes" multiplier)
  // Some conditions are devastating (paralyzed, stunned), others are minor (prone)
  // Values calibrated to match item rarity for condition-focused items
  if (combat.conditionImmunities && combat.conditionImmunities.length > 0) {
    const conditionMultiplier = combat.conditionImmunitiesMultiplier ?? 1.0;
    const CONDITION_IMMUNITY_VALUES: Record<string, number> = {
      'paralyzed': 1.5,    // Devastating - can't act, auto-crit
      'stunned': 1.25,     // Very bad - can't act, advantage against
      'petrified': 1.25,   // Very bad - essentially dead
      'incapacitated': 1.0, // Bad - can't take actions
      'unconscious': 1.0,  // Bad - but usually from 0 HP anyway
      'charmed': 0.75,     // Common and dangerous - dominated by enemies
      'frightened': 0.75,  // Common - disadvantage and can't approach
      'restrained': 0.75,  // Bad - speed 0, advantage against you
      'poisoned': 0.5,     // Common condition, disadvantage on attacks/checks
      'blinded': 0.5,      // Bad but situational
      'deafened': 0.25,    // Minor - mostly ribbon
      'grappled': 0.25,    // Minor - speed 0 but can still act
      'prone': 0.25,       // Minor - half movement to stand
      'exhaustion': 1.0,   // Cumulative and dangerous
    };

    for (const condition of combat.conditionImmunities) {
      const conditionLower = condition.toLowerCase();
      score += (CONDITION_IMMUNITY_VALUES[conditionLower] ?? 0.5) * conditionMultiplier;
    }
  }

  // Spell charges (legacy format)
  // High-level spells (6+) scale non-linearly because they're campaign-defining
  if (combat.charges && combat.charges.length > 0) {
    // Effective spell level values - high level spells are exponentially more valuable
    // Calibrated so Wish (9th, ~1 use) contributes ~2.5 pts toward Legendary
    const SPELL_LEVEL_VALUES: Record<number, number> = {
      0: 0.1,   // Cantrips
      1: 1,     // Magic Missile, Shield
      2: 2,     // Scorching Ray, Hold Person
      3: 3,     // Fireball, Lightning Bolt
      4: 4,     // Polymorph, Wall of Fire
      5: 5,     // Cone of Cold, Hold Monster
      6: 7,     // Chain Lightning, Disintegrate (1.17× level)
      7: 10,    // Finger of Death, Plane Shift (1.43× level)
      8: 14,    // Dominate Monster, Power Word Stun (1.75× level)
      9: 20,    // Wish, Meteor Swarm (2.22× level) - campaign-defining
    };

    for (const charge of combat.charges) {
      const normalizedRecharge = charge.recharge === 'dawn'
        ? 'long rest'
        : charge.recharge;
      const multiplier = RECHARGE_MULTIPLIERS[normalizedRecharge] || 0.5;
      const effectiveLevel = SPELL_LEVEL_VALUES[charge.spellLevel] ?? charge.spellLevel;
      score += effectiveLevel * charge.usesPerDay * multiplier;
    }
  }

  // === NEW SRD 5.2.1 MECHANICS ===

  // Advantage on checks/saves
  // Values calibrated so Sentinel Shield (initiative + perception) = ~1.0 (Uncommon)
  if (combat.advantage && combat.advantage.length > 0) {
    const ADVANTAGE_VALUES: Record<string, number> = {
      'initiative': 0.75,    // Very valuable - going first in combat
      'attack': 1.5,         // Extremely valuable - affects every attack
      'saves': 1.5,          // Very valuable - affects all saves
      'dex-saves': 0.5,      // Common save type
      'str-saves': 0.25,     // Less common
      'con-saves': 0.5,      // Common for concentration
      'perception': 0.25,    // Mostly utility
      'stealth': 0.25,       // Situational
      'acrobatics': 0.25,    // Situational
    };
    for (const adv of combat.advantage) {
      score += ADVANTAGE_VALUES[adv] || 0.25;
    }
  }

  // Reaction AC bonus (e.g., Quarterstaff of the Acrobat: +5 AC as reaction)
  // Limited uses make this less valuable than constant AC
  if (combat.reactionAC) {
    const { bonus, usesPerShortRest = 0, usesPerLongRest = 0, unlimited = false } = combat.reactionAC;
    if (unlimited) {
      // Unlimited reaction AC is very powerful but still only once per round
      score += bonus * 0.5; // Half value of constant AC
    } else {
      // Limited uses: assume 2 short rests per day, calculate daily uses
      const dailyUses = usesPerLongRest + (usesPerShortRest * 3); // long rest + 2 short + start of day
      // Each use is worth bonus × probability it matters
      // Estimate 4 combats per day, ~5 rounds each = 20 potential uses
      // Limited uses / 20 potential × bonus
      const useRate = Math.min(1, dailyUses / 10); // Cap at 100%
      score += bonus * 0.3 * useRate * dailyUses;
    }
  }

  // Bonus action damage (e.g., Shield of the Cavalier bash)
  // Once per Attack action, so once per turn
  if (combat.bonusActionDamage) {
    let bashValue = getDiceValue(combat.bonusActionDamage.dice);
    const typeMultiplier = DAMAGE_TYPE_MULTIPLIERS[combat.bonusActionDamage.type?.toLowerCase() || 'bludgeoning'] || 1.0;
    bashValue *= typeMultiplier;
    // Flat bonus adds to average damage
    if (combat.bonusActionDamage.flatBonus) {
      bashValue += combat.bonusActionDamage.flatBonus * 0.3; // Flat damage is less variable
    }
    // Bonus action competes with other bonus actions, discount by 60%
    score += bashValue * 0.4;
  }

  // Condition infliction (e.g., Energy Bow restrain)
  // Restrained is very powerful, but requires save
  if (combat.conditionInfliction) {
    const CONDITION_VALUES: Record<string, number> = {
      'restrained': 1.5,     // Very powerful - advantage on attacks, disadvantage on DEX saves
      'prone': 0.5,          // Moderate - advantage in melee, disadvantage at range
      'frightened': 1.0,     // Good - disadvantage on attacks and abilities
      'paralyzed': 2.0,      // Extremely powerful - auto-crits
      'stunned': 1.5,        // Very powerful - can't act
      'blinded': 1.0,        // Good - disadvantage on attacks
      'poisoned': 0.75,      // Moderate - disadvantage on attacks and abilities
    };
    const baseValue = CONDITION_VALUES[combat.conditionInfliction.condition] || 0.5;
    // Higher DC = more reliable, scale slightly
    const dcModifier = (combat.conditionInfliction.dc - 10) * 0.05;
    score += baseValue * (1 + dcModifier);
  }

  // Damage type override (e.g., Energy Bow: force instead of piercing)
  // Force damage is rarely resisted, small bonus
  if (combat.damageTypeOverride) {
    const typeMultiplier = DAMAGE_TYPE_MULTIPLIERS[combat.damageTypeOverride.toLowerCase()] || 1.0;
    const baseDamageTypeMultiplier = DAMAGE_TYPE_MULTIPLIERS['piercing'] || 0.85;
    // Add the difference as a small bonus (assumes base weapon does ~5 avg damage)
    const typeUpgrade = (typeMultiplier - baseDamageTypeMultiplier) * 1.0;
    if (typeUpgrade > 0) {
      score += typeUpgrade;
    }
  }

  // Hands-free defense (Animated Shield)
  // Allows two-handed weapon + shield, or dual-wield + shield
  // Very Rare item, so should contribute significantly
  if (combat.handsFreeDef) {
    score += 3.0; // Equivalent to having +2 AC while wielding a greatsword
  }

  // Charge pool (new intuitive format)
  if (combat.chargePool && combat.chargePool.abilities.length > 0) {
    // Effective spell level values - high level spells are exponentially more valuable
    // Same scale as legacy charges format for consistency
    // Calibrated so Wish (9th, ~1 use) contributes ~4.0 pts toward Legendary
    const CHARGE_POOL_SPELL_VALUES: Record<number, number> = {
      0: 0.1,   // Cantrips
      1: 1,     // Magic Missile, Shield
      2: 2,     // Scorching Ray, Hold Person
      3: 3,     // Fireball, Lightning Bolt
      4: 4,     // Polymorph, Wall of Fire
      5: 5,     // Cone of Cold, Hold Monster
      6: 7,     // Chain Lightning, Disintegrate (1.17× level)
      7: 10,    // Finger of Death, Plane Shift (1.43× level)
      8: 14,    // Dominate Monster, Power Word Stun (1.75× level)
      9: 20,    // Wish, Meteor Swarm (2.22× level) - campaign-defining
    };

    // Calculate sustainable daily charges (what you can expect to use each day on average)
    // Assumes 2 short rests per adventuring day (standard D&D assumption)
    const dailyRecharge =
      combat.chargePool.chargesPerLongRest +
      (combat.chargePool.chargesPerShortRest * 2);

    // Calculate score for each ability
    for (const ability of combat.chargePool.abilities) {
      if (ability.chargesPerUse > 0) {
        // Burst potential: you can nova ALL charges in a single fight
        const burstUses = combat.chargePool.maxCharges / ability.chargesPerUse;

        // Sustained uses: what you get back per day
        // If no recharge specified (0/0), assume conservative 1 charge/day
        // This encourages users to fill in actual recharge rates
        const sustainedUses = dailyRecharge > 0
          ? Math.min(dailyRecharge, combat.chargePool.maxCharges) / ability.chargesPerUse
          : 1 / ability.chargesPerUse;

        // Blend burst and sustained: burst matters more for powerful spells
        // Level 3 spell: ~45% burst weight (8 Fireballs in a boss fight is huge)
        // Level 1 spell: ~15% burst weight (less impactful nova)
        const burstWeight = Math.min(0.5, ability.spellLevel * 0.15);
        const effectiveUses = sustainedUses * (1 - burstWeight) + burstUses * burstWeight;

        // Use effective spell level (high-level spells scale non-linearly)
        const effectiveLevel = CHARGE_POOL_SPELL_VALUES[ability.spellLevel] ?? ability.spellLevel;

        // Multiplier tuned to balance charge-based items appropriately
        // Calibrated so Wand of Fireballs (level 3, ~4 uses/day) ≈ 2.4 pts
        const multiplier = 0.20;
        score += effectiveLevel * effectiveUses * multiplier;
      }
    }
  }

  // Weapon properties (added properties not normally on the base weapon)
  // These represent properties that enhance a weapon's versatility or combat value
  // Values are relatively small since these are situational benefits
  if (combat.weaponProperties && combat.weaponProperties.length > 0) {
    const WEAPON_PROPERTY_VALUES: Record<WeaponProperty, number> = {
      'finesse': 0.25,          // Use DEX or STR - flexibility for multi-stat builds
      'heavy-two-handed': -0.15, // Heavy and/or Two-Handed - combined negative property
      'light': 0.2,             // Enables two-weapon fighting
      'reach': 0.25,            // +5 feet reach - tactical positioning advantage
      'thrown': 0.1,            // Can throw for ranged attack - minor versatility
      'versatile': 0.15,        // One or two hands - flexibility in usage
    };

    for (const prop of combat.weaponProperties) {
      score += WEAPON_PROPERTY_VALUES[prop] || 0;
    }
  }

  return score;
}

/**
 * Convert combat score to rarity
 * Note: Items with any combat features but score < 1 get bumped to Uncommon
 * This prevents utility items from being rated as Common when they have features
 */
export function scoreToRarity(score: number, hasCombatFeatures: boolean = false): Rarity {
  // Minimum floor: items with features should be at least Uncommon
  if (hasCombatFeatures && score > 0 && score < 1) {
    return 'Uncommon';
  }

  if (score < 1) return 'Common';
  if (score < 2) return 'Uncommon';
  if (score < 3) return 'Rare';
  if (score < 4) return 'Very Rare';
  return 'Legendary';
}

/**
 * Calculate how many tiers apart two rarities are
 */
function getRarityTierDifference(rarity1: string, rarity2: string): number {
  const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];
  const idx1 = rarityOrder.findIndex(r => r.toLowerCase() === rarity1.toLowerCase());
  const idx2 = rarityOrder.findIndex(r => r.toLowerCase() === rarity2.toLowerCase());
  return Math.abs(idx1 - idx2);
}

/**
 * Comparison result between user item and anchor
 */
export interface AnchorComparison {
  type: 'stronger' | 'weaker' | 'equal';
  scoreDifference: number;
  details: string[];
}

/**
 * Find anchor item - the baseline SRD item for balancing reference
 * Prioritizes based on: broad category (weapon/armor/trinket), attunement, and score proximity
 */
export function findAnchorItem(
  userItem: Partial<MagicItem>
): {
  anchor: MagicItem | null;
  anchorScore: number;
  comparison: AnchorComparison | null;
} {
  if (!userItem.combat) {
    return { anchor: null, anchorScore: 0, comparison: null };
  }

  const userScore = calculateCombatScore(userItem.combat, userItem.baseItem);
  const allItems = srdItems as MagicItem[];
  const userBroadCategory = userItem.baseItem ? getBroadCategory(userItem.baseItem) : 'trinket';
  const userAttunement = userItem.attunement || false;

  // Separate named items from generic +X items
  const namedItems = allItems.filter(item => !isGenericItem(item));
  const genericItems = allItems.filter(item => isGenericItem(item));

  let anchor: MagicItem | null = null;

  // Priority 1: Same broad category + same attunement
  anchor = findClosestInCandidates(
    namedItems.filter((item) => {
      const itemBroadCategory = getBroadCategory(item.baseItem);
      const itemAttunement = item.attunement || false;
      return itemBroadCategory === userBroadCategory && itemAttunement === userAttunement;
    }),
    userScore
  );

  // Priority 2: Same broad category (any attunement)
  if (!anchor) {
    anchor = findClosestInCandidates(
      namedItems.filter((item) => getBroadCategory(item.baseItem) === userBroadCategory),
      userScore
    );
  }

  // Priority 3: Same attunement (any category)
  if (!anchor) {
    anchor = findClosestInCandidates(
      namedItems.filter((item) => (item.attunement || false) === userAttunement),
      userScore
    );
  }

  // Priority 4: Any named item
  if (!anchor) {
    anchor = findClosestInCandidates(namedItems, userScore);
  }

  // Priority 5: Generic items (fallback)
  if (!anchor) {
    anchor = findClosestInCandidates(genericItems, userScore);
  }

  if (!anchor) {
    return { anchor: null, anchorScore: 0, comparison: null };
  }

  // Calculate detailed comparison
  const anchorScore = calculateCombatScore(anchor.combat, anchor.baseItem);
  const scoreDiff = userScore - anchorScore;
  const comparison = compareToAnchor(userItem, anchor, scoreDiff);

  return { anchor, anchorScore, comparison };
}

/**
 * Get the rarity tier index (0=Common, 1=Uncommon, 2=Rare, 3=Very Rare, 4=Legendary)
 */
function getRarityTierIndex(rarity: string): number {
  const rarityOrder = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
  return rarityOrder.indexOf(rarity.toLowerCase());
}

/**
 * Find top N anchor items for comparison
 *
 * Priority order (most important first):
 * 1. Same rarity (HARD RULE: never show items 2+ rarities apart)
 * 2. Same general class (weapon/armor/trinket)
 * 3. Same attunement requirement
 *
 * Within same priority, prefer items with closer scores.
 */
export function findTopAnchorItems(
  userItem: Partial<MagicItem>,
  count: number = 3
): Array<{
  anchor: MagicItem;
  anchorScore: number;
  comparison: AnchorComparison;
}> {
  if (!userItem.combat) {
    return [];
  }

  const userScore = calculateCombatScore(userItem.combat, userItem.baseItem);
  const allItems = srdItems as MagicItem[];
  const userBroadCategory = userItem.baseItem ? getBroadCategory(userItem.baseItem) : 'trinket';
  const userAttunement = userItem.attunement || false;
  const userRarity = getSuggestedRarity({ combat: userItem.combat, baseItem: userItem.baseItem }).suggestedRarity;
  const userRarityTier = getRarityTierIndex(userRarity);

  // Check if this is a "simple" item (only +N enhancement/AC, no attunement)
  const simpleCheck = isSimpleItem(userItem);

  // Collect all candidates with their scores and priority level
  const candidates: Array<{
    item: MagicItem;
    score: number;
    scoreDiff: number;
    priority: number;
    rarityDiff: number;
  }> = [];

  // Process all items
  allItems.forEach((item) => {
    const itemRarity = item.rarity || 'common';
    const itemRarityTier = getRarityTierIndex(itemRarity);
    const rarityDiff = Math.abs(itemRarityTier - userRarityTier);

    // HARD RULE: Never show items 2+ rarities apart
    if (rarityDiff >= 2) {
      return; // Skip this item entirely
    }

    const itemBroadCategory = getBroadCategory(item.baseItem);
    const itemAttunement = item.attunement || false;
    const isGeneric = isGenericItem(item);

    let sameBroadCategory = itemBroadCategory === userBroadCategory;
    // Special case: implements can also match weapons
    const userCategory = getItemCategory(userItem.baseItem || '');
    if (userCategory === 'implement' && itemBroadCategory === 'weapon') {
      sameBroadCategory = true;
    }

    const sameAttunement = itemAttunement === userAttunement;
    const score = getItemScore(item);
    const scoreDiff = Math.abs(score - userScore);

    // Priority system: lower is better
    // Each criterion adds to priority if NOT matched
    // Priority 0-7 = same rarity, Priority 8-15 = 1 rarity apart
    let priority = 0;

    // Rarity difference is the primary factor (0 or 1 tier difference only)
    priority += rarityDiff * 8;

    // Same broad category is next most important
    if (!sameBroadCategory) {
      priority += 4;
    }

    // Same attunement is third priority
    if (!sameAttunement) {
      priority += 2;
    }

    // Prefer named items over generic items (slight preference)
    if (isGeneric) {
      priority += 1;
    }

    // SIMPLE IN, SIMPLE OUT: If user made a simple +N item, the matching generic is #1
    if (simpleCheck.isSimple && sameBroadCategory && isGeneric) {
      const expectedGenericName = `+${simpleCheck.enhancementLevel} ${
        simpleCheck.type === 'weapon' ? 'Weapon' :
        simpleCheck.type === 'shield' ? 'Shield' : 'Armor'
      }`;
      if (item.name === expectedGenericName) {
        priority = 0; // Highest priority - this IS what they're making
      }
    }

    candidates.push({
      item,
      score,
      scoreDiff,
      priority,
      rarityDiff,
    });
  });

  // Sort candidates: first by priority (lower is better), then by score difference (smaller is better)
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.scoreDiff - b.scoreDiff;
  });

  // Take top items
  const topCandidates = candidates.slice(0, count);

  // Convert to final format with comparisons
  return topCandidates.map((candidate) => {
    const scoreDiff = userScore - candidate.score;
    const comparison = compareToAnchor(userItem, candidate.item, scoreDiff);
    return {
      anchor: candidate.item,
      anchorScore: candidate.score,
      comparison,
    };
  });
}

/**
 * Find the closest item by combat score within a set of candidates
 */
function findClosestInCandidates(
  candidates: MagicItem[],
  targetScore: number
): MagicItem | null {
  if (candidates.length === 0) return null;

  let closest: MagicItem | null = null;
  let smallestDiff = Infinity;

  for (const item of candidates) {
    const itemScore = calculateCombatScore(item.combat, item.baseItem);
    const diff = Math.abs(itemScore - targetScore);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = item;
    }
  }

  return closest;
}

/**
 * Compare user item to anchor item and generate educational details
 * Priority order optimized for showing the most meaningful differences:
 * 1. Enhancement - fundamental weapon/armor differentiator
 * 2. Damage bonus - highly impactful, easy to understand
 * 3. Saving throw bonus - often overlooked but worth 1.0 pts per +1
 * 4. AC bonus - important defensive stat
 * 5. Resistances & Immunities - defensive capabilities
 * 6. Condition immunities - common on defensive items
 * 7. Flight - defining feature when present
 * 8. Spell abilities - charge pools and legacy charges
 */
function compareToAnchor(
  userItem: Partial<MagicItem>,
  anchor: MagicItem,
  scoreDiff: number
): AnchorComparison {
  const details: string[] = [];
  const userCombat = userItem.combat!;
  const anchorCombat = anchor.combat;

  // Priority 1: Enhancement comparison
  const userEnh = userCombat.enhancement || 0;
  const anchorEnh = anchorCombat.enhancement || 0;
  if (userEnh !== anchorEnh) {
    if (userEnh > anchorEnh) {
      details.push(`+${userEnh - anchorEnh} higher enhancement`);
    } else {
      details.push(`+${anchorEnh - userEnh} lower enhancement`);
    }
  }

  // Priority 2: Damage comparison
  const userDmg = userCombat.damageBonus?.dice;
  const anchorDmg = anchorCombat.damageBonus?.dice;
  const userFreq = userCombat.damageBonus?.frequency || 'per-hit';
  const anchorFreq = anchorCombat.damageBonus?.frequency || 'per-hit';

  if (userDmg && !anchorDmg) {
    const freqText = userFreq === 'per-turn' ? ' per turn' : '';
    details.push(`has ${userDmg}${freqText} damage (reference has none)`);
  } else if (!userDmg && anchorDmg) {
    const freqText = anchorFreq === 'per-turn' ? ' per turn' : '';
    details.push(`no damage bonus (reference has ${anchorDmg}${freqText})`);
  } else if (userDmg && anchorDmg) {
    const userFreqText = userFreq === 'per-turn' ? ' per turn' : '';
    const anchorFreqText = anchorFreq === 'per-turn' ? ' per turn' : '';

    if (userDmg !== anchorDmg || userFreq !== anchorFreq) {
      details.push(`${userDmg}${userFreqText} vs reference's ${anchorDmg}${anchorFreqText} damage`);
    }
  }

  // Priority 3: Saving throw bonus comparison (often overlooked, worth 1.0 pts per +1)
  const userSaves = userCombat.savingThrowBonus || 0;
  const anchorSaves = anchorCombat.savingThrowBonus || 0;
  if (userSaves !== anchorSaves) {
    if (userSaves > anchorSaves) {
      if (anchorSaves === 0) {
        details.push(`+${userSaves} to saves (reference has none)`);
      } else {
        details.push(`+${userSaves - anchorSaves} higher save bonus`);
      }
    } else {
      if (userSaves === 0) {
        details.push(`no save bonus (reference has +${anchorSaves})`);
      } else {
        details.push(`+${anchorSaves - userSaves} lower save bonus`);
      }
    }
  }

  // Priority 4: AC bonus comparison
  const userAC = userCombat.acBonus || 0;
  const anchorAC = anchorCombat.acBonus || 0;
  if (userAC !== anchorAC) {
    if (userAC > anchorAC) {
      details.push(`+${userAC - anchorAC} higher AC bonus`);
    } else {
      details.push(`+${anchorAC - userAC} lower AC bonus`);
    }
  }

  // Priority 5: Resistances & Immunities comparison (expanded)
  const userResistances = userCombat.resistances?.length || 0;
  const anchorResistances = anchorCombat.resistances?.length || 0;
  const userImmunities = userCombat.damageImmunities?.length || 0;
  const anchorImmunities = anchorCombat.damageImmunities?.length || 0;

  // Show immunities first (more valuable)
  if (userImmunities !== anchorImmunities) {
    if (userImmunities > 0 && anchorImmunities === 0) {
      details.push(`${userImmunities} damage ${userImmunities === 1 ? 'immunity' : 'immunities'} (reference has none)`);
    } else if (userImmunities === 0 && anchorImmunities > 0) {
      details.push(`no immunities (reference has ${anchorImmunities})`);
    } else {
      details.push(`${userImmunities} vs ${anchorImmunities} damage immunities`);
    }
  }

  // Then resistances
  if (userResistances !== anchorResistances) {
    if (userResistances > 0 && anchorResistances === 0) {
      details.push(`${userResistances} ${userResistances === 1 ? 'resistance' : 'resistances'} (reference has none)`);
    } else if (userResistances === 0 && anchorResistances > 0) {
      details.push(`no resistances (reference has ${anchorResistances})`);
    } else {
      details.push(`${userResistances} vs ${anchorResistances} resistances`);
    }
  }

  // Priority 6: Condition immunities comparison
  const userConditions = userCombat.conditionImmunities?.length || 0;
  const anchorConditions = anchorCombat.conditionImmunities?.length || 0;
  if (userConditions !== anchorConditions) {
    if (userConditions > 0 && anchorConditions === 0) {
      details.push(`${userConditions} condition ${userConditions === 1 ? 'immunity' : 'immunities'} (reference has none)`);
    } else if (userConditions === 0 && anchorConditions > 0) {
      details.push(`no condition immunities (reference has ${anchorConditions})`);
    } else {
      details.push(`${userConditions} vs ${anchorConditions} condition immunities`);
    }
  }

  // Priority 7: Flight comparison (defining feature when present)
  const userHasFlight = userCombat.flight || userCombat.permanentBuffs?.flight;
  const anchorHasFlight = anchorCombat.flight || anchorCombat.permanentBuffs?.flight;
  if (userHasFlight && !anchorHasFlight) {
    const speed = userCombat.flight?.flySpeed || 30;
    details.push(`grants ${speed} ft flight (reference has none)`);
  } else if (!userHasFlight && anchorHasFlight) {
    const speed = anchorCombat.flight?.flySpeed || 30;
    details.push(`no flight (reference has ${speed} ft)`);
  } else if (userHasFlight && anchorHasFlight) {
    const userSpeed = userCombat.flight?.flySpeed || 30;
    const anchorSpeed = anchorCombat.flight?.flySpeed || 30;
    if (userSpeed !== anchorSpeed) {
      details.push(`${userSpeed} ft fly speed vs reference's ${anchorSpeed} ft`);
    }
  }

  // Priority 8: Spell abilities comparison (consolidated charge pool + legacy)
  const userPool = userCombat.chargePool;
  const anchorPool = anchorCombat.chargePool;
  const userLegacyCharges = userCombat.charges?.length || 0;
  const anchorLegacyCharges = anchorCombat.charges?.length || 0;

  // Determine max spell level for each (from either format)
  const userMaxLevel = userPool && userPool.abilities.length > 0
    ? Math.max(...userPool.abilities.map(a => a.spellLevel))
    : userLegacyCharges > 0
      ? Math.max(...userCombat.charges!.map(c => c.spellLevel))
      : 0;
  const anchorMaxLevel = anchorPool && anchorPool.abilities.length > 0
    ? Math.max(...anchorPool.abilities.map(a => a.spellLevel))
    : anchorLegacyCharges > 0
      ? Math.max(...anchorCombat.charges!.map(c => c.spellLevel))
      : 0;

  const userHasSpells = (userPool && userPool.abilities.length > 0) || userLegacyCharges > 0;
  const anchorHasSpells = (anchorPool && anchorPool.abilities.length > 0) || anchorLegacyCharges > 0;

  if (userHasSpells && !anchorHasSpells) {
    const levelText = userMaxLevel === 0 ? 'cantrip' : `level ${userMaxLevel}`;
    details.push(`has spell abilities (${levelText})`);
  } else if (!userHasSpells && anchorHasSpells) {
    const levelText = anchorMaxLevel === 0 ? 'cantrip' : `level ${anchorMaxLevel}`;
    details.push(`no spell abilities (reference has ${levelText})`);
  } else if (userHasSpells && anchorHasSpells && userMaxLevel !== anchorMaxLevel) {
    details.push(`spells up to level ${userMaxLevel} vs reference's level ${anchorMaxLevel}`);
  }

  // Determine type
  let type: 'stronger' | 'weaker' | 'equal' = 'equal';
  if (scoreDiff > 0.25) {
    type = 'stronger';
  } else if (scoreDiff < -0.25) {
    type = 'weaker';
  }

  return {
    type,
    scoreDifference: scoreDiff,
    details: details.length > 0 ? details : ['Similar combat power'],
  };
}

/**
 * Count total ribbon features
 */
export function countRibbons(ribbons?: MagicItem['ribbons']): number {
  if (!ribbons) return 0;

  let count = 0;
  Object.values(ribbons).forEach((category) => {
    if (Array.isArray(category)) {
      count += category.length;
    }
  });

  return count;
}

/**
 * Get suggested rarity with ribbons consideration and anchor reference
 */
export function getSuggestedRarity(item: Partial<MagicItem>): {
  combatRarity: Rarity;
  combatScore: number;
  ribbonCount: number;
  suggestedRarity: Rarity;
  explanation: string;
  anchorItem: MagicItem | null;
  anchorScore: number;
  anchorComparison: AnchorComparison | null;
  anchorIsUnbalanced: boolean;
} {
  // Include overrideBonus in the score calculation
  const baseScore = item.combat ? calculateCombatScore(item.combat, item.baseItem) : 0;
  const combatScore = baseScore + (item.overrideBonus ?? 0);
  const hasCombatFeatures = combatScore > 0;
  const combatRarity = scoreToRarity(combatScore, hasCombatFeatures);
  const ribbonCount = countRibbons(item.ribbons);

  // Get anchor item for reference
  const { anchor, anchorScore, comparison } = findAnchorItem(item);

  // Check if anchor item's stated rarity is significantly off from calculated
  // Only flag items that are 2+ tiers away (e.g., Uncommon item calculated as Very Rare)
  // This accounts for special abilities and ribbons we don't measure in combat score
  let anchorIsUnbalanced = false;
  if (anchor && anchor.rarity) {
    const anchorHasFeatures = anchorScore > 0;
    const anchorCalculatedRarity = scoreToRarity(anchorScore, anchorHasFeatures);
    const tierDiff = getRarityTierDifference(anchorCalculatedRarity, anchor.rarity);
    anchorIsUnbalanced = tierDiff >= 2;
  }

  // For now, ribbons don't affect rarity (as we're not implementing them yet)
  // But we'll return the structure for future use
  const suggestedRarity = combatRarity;
  let explanation = `Based on ${combatScore.toFixed(1)} combat points, this item is ${combatRarity}.`;

  if (anchor && comparison) {
    const userItemName = item.name || 'Your item';
    const anchorName = anchor.name;

    if (comparison.type === 'equal') {
      explanation += ` ${userItemName} matches the power level of ${anchorName} (${anchor.rarity}).`;
    } else if (comparison.type === 'stronger') {
      explanation += ` ${userItemName} is ${comparison.scoreDifference.toFixed(1)} points stronger than ${anchorName} (${anchor.rarity}).`;
    } else {
      explanation += ` ${userItemName} is ${Math.abs(comparison.scoreDifference).toFixed(1)} points weaker than ${anchorName} (${anchor.rarity}).`;
    }

    // Warn if anchor item appears unbalanced
    if (anchorIsUnbalanced) {
      const anchorHasFeatures = anchorScore > 0;
      const anchorCalculatedRarity = scoreToRarity(anchorScore, anchorHasFeatures);
      explanation += ` ⚠️ Note: ${anchorName} appears unbalanced—its stated rarity (${anchor.rarity}) doesn't match our formula (${anchorCalculatedRarity} for ${anchorScore.toFixed(1)} points). Consider this when balancing.`;
    }
  }

  if (ribbonCount > 0) {
    explanation += ` It also has ${ribbonCount} ribbon feature(s), which may increase rarity by 0-1 tier depending on their utility.`;
  }

  return {
    combatScore,
    combatRarity,
    ribbonCount,
    suggestedRarity,
    explanation,
    anchorItem: anchor,
    anchorScore,
    anchorComparison: comparison,
    anchorIsUnbalanced,
  };
}
