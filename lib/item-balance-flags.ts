/**
 * Three types of item balance warnings:
 * 1. Special mechanics - Non-numerical benefits (flight, invisibility, instant kill, action economy)
 * 2. Numerical edge cases - Conditional bonuses dependent on setting/campaign frequency
 * 3. Community notes - Items where official rarity doesn't match calculated value (over/underpowered)
 */

/**
 * Special mechanics: Items with non-numerical benefits our math can't quantify
 * Examples: Flight, invisibility, instant kill, spell absorption, action economy, special restrictions
 */
export const SPECIAL_MECHANICS = new Set([
  // Instant-kill or save-or-die effects
  'Vorpal Sword',              // Decapitation on nat 20
  'Nine Lives Stealer',        // Save-or-die on nat 20

  // Spell absorption/storage/action economy
  'Rod of Absorption',         // Absorbs spells targeting you
  'Ring of Spell Storing',     // Stores 5 spell levels (breaks action economy)
  'Luck Blade',                // Can cast Wish (ultimate spell)

  // Tactical mobility and positioning
  'Boots of Speed',            // Doubled movement + disadvantage on opportunity attacks
  'Broom of Flying',           // Unlimited flight (official Uncommon but calc says Rare)
  'Cloak of Invisibility',     // Tactical invisibility

  // Defensive special mechanics
  'Gloves of Missile Snaring', // Deflect ranged attacks (reaction-based)
  'Cloak of Protection',       // +1 AC and +1 all saves stacks with everything

  // Complex stacking or restrictions
  'Staff of Power',            // +2 to attack/damage/AC/saves (spellcaster-only attunement)
  'Sun Blade',                 // Finesse property on longsword + radiant damage type
]);

/**
 * Numerical edge cases: Conditional bonuses dependent on setting/campaign
 * These items can be quantified, but their value varies wildly based on how often
 * the condition triggers in your specific campaign
 */
export const NUMERICAL_EDGE_CASES = new Set([
  // Critical-only effects (5% base proc rate, higher with crit-fishing builds)
  'Vicious Weapon',            // +2d6 on nat 20 only

  // Creature-type conditional damage
  'Oathbow',                   // +3d6 + advantage vs sworn enemy only
  'Giant Slayer',              // +2d6 vs giants only + prone
  'Dragon Slayer',             // +3d6 vs dragons only
  'Mace of Disruption',        // 2d6 radiant vs undead/fiends + possible destruction
  'Mace of Smiting',           // +3 vs constructs only + extra crit damage

  // Limited use abilities
  'Dagger of Venom',           // 2d10 poison + condition, but only 1/day
  'Javelin of Lightning',      // 4d6 line damage, but only 1/day
]);

/**
 * Community notes: Items where official rarity seems misaligned with power level
 * These use overrideScore or are known balance oddities in official 5e
 */
export const COMMUNITY_NOTES = new Set([
  // Official seems too LOW (item is stronger than rarity suggests)
  // (none currently - most "underpriced" items have Special Mechanics flags)

  // Official seems too HIGH (item is weaker than rarity suggests)
  'Wings of Flying',           // Calc 1.0 pts (Uncommon) but official Rare - limited 1hr flight is weak
]);

/**
 * Check if an item has special mechanics
 */
export function hasSpecialMechanics(itemName: string): boolean {
  return SPECIAL_MECHANICS.has(itemName);
}

/**
 * Check if an item has numerical edge cases
 */
export function hasNumericalEdgeCases(itemName: string): boolean {
  return NUMERICAL_EDGE_CASES.has(itemName);
}

/**
 * Check if an item has community notes
 */
export function hasCommunityNotes(itemName: string): boolean {
  return COMMUNITY_NOTES.has(itemName);
}

/**
 * Get explanation for why an item is flagged
 */
export function getItemExplanation(itemName: string): string {
  // === SPECIAL MECHANICS ===

  // Instant-kill effects
  if (itemName === 'Vorpal Sword') {
    return 'Decapitates on nat 20 (instant kill, no save for most creatures). Power level is campaign-defining.';
  }
  if (itemName === 'Nine Lives Stealer') {
    return 'Drains life force on nat 20 vs <100 HP (DC 15 CON or die). Save-or-die adds ~1.5 pts beyond +2.';
  }

  // Action economy and spell effects
  if (itemName === 'Rod of Absorption') {
    return 'Absorbs spells targeting you, negating effects. Defensive utility is extremely campaign-dependent.';
  }
  if (itemName === 'Ring of Spell Storing') {
    return 'Stores up to 5 spell levels. Breaks action economy by allowing pre-cast buffs or extra spell slots.';
  }
  if (itemName === 'Luck Blade') {
    return 'Can cast Wish (1d4-1 times). The Wish spell alone makes this Legendary regardless of +1 bonus.';
  }

  // Mobility
  if (itemName === 'Boots of Speed') {
    return 'Click heels to double speed for 10 min. Opportunity attacks have disadvantage. Mobility is hard to price.';
  }
  if (itemName === 'Broom of Flying') {
    return 'Unlimited flight calculates as 2.0 pts (Rare) but official is Uncommon. No attunement makes it accessible.';
  }
  if (itemName === 'Cloak of Invisibility') {
    return 'Tactical invisibility (3 charges, 1hr each). Invisibility advantage on attacks/stealth is campaign-defining.';
  }

  // Defensive
  if (itemName === 'Gloves of Missile Snaring') {
    return 'Reaction to reduce ranged weapon damage by 1d10+DEX. Situational but can completely negate hits.';
  }
  if (itemName === 'Cloak of Protection') {
    return '+1 AC and +1 all saves is 2.0 pts (Rare calc) but official Uncommon. Stacks with everything unlike most AC.';
  }

  // Complex effects
  if (itemName === 'Staff of Power') {
    return '+2 to attack/damage/AC/saves is 6.0 pts (Legendary calc) but official Very Rare. Spellcaster-only attunement limits audience significantly.';
  }
  if (itemName === 'Sun Blade') {
    return '+2 sword with 1d8 radiant is 3.25 pts (VR calc) but official Rare. Finesse on longsword has hidden build value.';
  }

  // === NUMERICAL EDGE CASES ===

  if (itemName === 'Vicious Weapon') {
    return '+2d6 on natural 20 only (5% proc). Value ranges from ~0.1 pts (normal) to ~1.0+ pts (crit-fishing Champion).';
  }
  if (itemName === 'Oathbow') {
    return '+3d6 + advantage vs sworn enemy (1 target/dawn). Calc: 2.0 pts (Rare), official: Very Rare. Value depends on campaign pacing.';
  }
  if (itemName === 'Giant Slayer') {
    return '+1 weapon + 2d6 vs giants + prone. Calc: 2.0 pts (Rare), matches official. Value depends on giant frequency.';
  }
  if (itemName === 'Dragon Slayer') {
    return '+1 weapon + 3d6 vs dragons. Calc: 2.5 pts (Rare), matches official. Value depends on dragon frequency.';
  }
  if (itemName === 'Mace of Disruption') {
    return '2d6 radiant vs undead/fiends + possible destruction. Calc: 1.0 pts (Uncommon), official Rare. Undead campaign = much higher.';
  }
  if (itemName === 'Mace of Smiting') {
    return '+1 mace, +3 vs constructs + crit bonus. Calc: 1.0 pts (Uncommon), official Rare. Construct campaign = higher value.';
  }
  if (itemName === 'Dagger of Venom') {
    return '+1 dagger + 2d10 poison + poisoned (1/day). The once-per-day limit makes daily value low despite burst potential.';
  }
  if (itemName === 'Javelin of Lightning') {
    return '4d6 lightning line (1/day recharge at dawn). Calc: 0.6 pts, official Uncommon. Single daily use limits value.';
  }

  // === COMMUNITY NOTES ===

  if (itemName === 'Wings of Flying') {
    return 'Limited flight (1 hr/day). Calc: 1.0 pts (Uncommon), official: Rare. Community consensus: weak for Rare tier.';
  }

  return '';
}

/**
 * Get warning indicators for an item
 * Returns object with all three warning types and display info
 */
export function getWarningIndicator(itemName: string): {
  hasNumerical: boolean;
  hasSpecial: boolean;
  hasCommunity: boolean;
  numericalIcon: string;
  specialIcon: string;
  communityIcon: string;
  explanation: string;
} {
  return {
    hasNumerical: hasNumericalEdgeCases(itemName),
    hasSpecial: hasSpecialMechanics(itemName),
    hasCommunity: hasCommunityNotes(itemName),
    numericalIcon: '🔢',  // Numbers for numerical edge cases
    specialIcon: '⭐',    // Star for special mechanics
    communityIcon: '💬', // Speech bubble for community notes
    explanation: getItemExplanation(itemName),
  };
}
