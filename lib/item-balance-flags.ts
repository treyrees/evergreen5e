/**
 * Three types of item balance warnings:
 * 1. Numerical edge cases - Conditional bonuses we can't track
 * 2. Special mechanics - Non-numerical benefits our math can't quantify
 * 3. Community notes - Well-established consensus (often items stronger than rated)
 */

/**
 * Numerical edge cases: Items numerically stronger than our logic accounts for
 * These have specific conditions that boost numbers beyond what we track YET
 * They're rare/conditional enough to compare at your own discretion only
 * Examples: +3d6 vs sworn enemy, +2d6 on natural 20, instant kill on crit
 * Note: Not all items here have individual warning explainers
 */
export const NUMERICAL_EDGE_CASES = new Set([
  'Vicious Weapon',            // +2d6 on nat 20 - crit-fishing synergy undervalued
  'Oathbow',                   // +3d6 + advantage vs sworn enemy - ignores cover benefit
  'Giant Slayer',              // +2d6 vs giants + prone effect undervalued
  'Mace of Disruption',        // 2d6 radiant vs undead/fiends + destroy effect undervalued
  'Mace of Smiting',           // +1 that becomes +3 vs constructs + crit bonus undervalued
  'Sun Blade',                 // Radiant damage multiplier may overvalue this item
]);

/**
 * Special mechanics: Items with non-numerical benefits our math can't quantify
 * These have unique effects that can't be reduced to combat points
 * Examples: Instant kill, wish spells, spell absorption
 */
export const SPECIAL_MECHANICS = new Set([
  'Vorpal Sword',              // Decapitation on nat 20 (instant kill) - can't model
  'Nine Lives Stealer',        // Save-or-die on nat 20 - can't model
  'Rod of Absorption',         // Absorbs spells targeting you - defensive utility
  'Boots of Speed',            // Doubles movement + Dex save advantage - mobility value
  'Gloves of Missile Snaring', // Catch and deflect ranged attacks - defensive utility
  'Cloak of Invisibility',     // Tactical invisibility - can't fully model
  'Dagger of Venom',           // Poisoned condition value not captured
  'Staff of Power',            // Stacking bonuses + spellcaster attunement overvalued
]);

/**
 * Community consensus: Well-established community notes about balance
 * These tend to be items the community considers stronger OR weaker than their rarity
 * Sources: EN World, D&D Beyond, Giant in the Playground, Quora discussions
 */
export const COMMUNITY_NOTES = new Set([
  'Broom of Flying',           // Uncommon but calculates Rare - unlimited flight undervalued
  'Wings of Flying',           // Rare but calculates Uncommon - limited flight overvalued
  'Cloak of Protection',       // Uncommon but calculates Rare - stacking bonuses overvalued
  'Ring of Spell Storing',     // Breaks action economy - utility beyond numbers
]);

/**
 * Check if an item has numerical edge cases
 */
export function hasNumericalEdgeCases(itemName: string): boolean {
  return NUMERICAL_EDGE_CASES.has(itemName);
}

/**
 * Check if an item has special mechanics
 */
export function hasSpecialMechanics(itemName: string): boolean {
  return SPECIAL_MECHANICS.has(itemName);
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
  // Numerical edge cases
  if (itemName === 'Vicious Weapon') {
    return '+2d6 damage on natural 20 (5% proc rate = ~0.09 pts). Math shows Uncommon but official is Rare. Crit-fishing synergy (Champion, Hexblade) and psychological value not captured.';
  }
  if (itemName === 'Oathbow') {
    return '+3d6 + attack advantage vs sworn enemy calculates as 2.77 pts (Rare) but official is Very Rare. Ignores cover/invisibility benefits not modeled.';
  }
  if (itemName === 'Giant Slayer') {
    return '+1 weapon + 2d6 vs giants calculates as 1.85 pts (Uncommon) but official is Rare. Prone effect on hit and common giant encounters make it stronger.';
  }
  if (itemName === 'Mace of Disruption') {
    return '2d6 radiant vs undead/fiends calculates as 1.1 pts (Uncommon) but official is Rare. Destroy effect on targets with 25 HP or less not modeled.';
  }
  if (itemName === 'Mace of Smiting') {
    return '+1 mace calculates as 1.0 pts (Uncommon) but official is Rare. Becomes +3 vs constructs, extra crit damage, and construct destruction not modeled.';
  }
  if (itemName === 'Sun Blade') {
    return '+2 enhancement + 1d8 radiant calculates as 3.38 pts (Very Rare) but official is Rare. Our radiant ×1.1 multiplier may overvalue this item.';
  }

  // Special mechanics
  if (itemName === 'Vorpal Sword') {
    return 'Decapitation on nat 20 (instant kill effect can\'t be modeled). Override score used.';
  }
  if (itemName === 'Nine Lives Stealer') {
    return 'Drains life force on nat 20 (save-or-die effect can\'t be modeled). Override score used.';
  }
  if (itemName === 'Rod of Absorption') {
    return 'Absorbs spells targeting you (defensive utility not quantified). Override score used.';
  }
  if (itemName === 'Boots of Speed') {
    return 'Doubles movement + Dex save advantage (mobility value not quantified). Override score used.';
  }
  if (itemName === 'Gloves of Missile Snaring') {
    return 'Catch and deflect ranged attacks (defensive utility not quantified). Override score used.';
  }
  if (itemName === 'Cloak of Invisibility') {
    return 'Tactical invisibility with charges (strategic value can\'t be quantified). Override score used.';
  }
  if (itemName === 'Dagger of Venom') {
    return '+1 dagger with poison coating (2d10 + poisoned condition, DC 15, 1/day) calculates as 1.4 pts (Uncommon) but official is Rare. The poisoned condition value not captured.';
  }
  if (itemName === 'Staff of Power') {
    return '+2 to attack/damage/AC/saves calculates as 6.0 pts (Legendary), but official is Very Rare. Stacking bonuses + spellcaster attunement requirement make the official rating appropriate.';
  }

  // Community notes
  if (itemName === 'Broom of Flying') {
    return 'Unlimited flight calculates as 2.0 pts (Rare) but official is Uncommon. Flight without attunement is very powerful.';
  }
  if (itemName === 'Wings of Flying') {
    return 'Limited flight (1 hour/day) calculates as 1.0 pts (Uncommon) but official is Rare. Flight value may be underestimated relative to Fly spell (3rd level).';
  }
  if (itemName === 'Cloak of Protection') {
    return '+1 AC and +1 to all saves calculates as 2.0 pts (Rare), but official is Uncommon. Our math may overvalue stacking bonuses.';
  }
  if (itemName === 'Ring of Spell Storing') {
    return 'Stores up to 5 levels of spells (breaks action economy, utility beyond combat math). Override score used.';
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
