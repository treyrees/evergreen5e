/**
 * Three types of item balance warnings:
 * 1. Special mechanics - Non-numerical benefits (flight, invisibility, instant kill)
 * 2. Numerical edge cases - Conditional bonuses dependent on setting/campaign
 * 3. Community notes - Override used but value suggests underpowered for tier
 */

/**
 * Special mechanics: Items with non-numerical benefits our math can't quantify
 * Examples: Flight, invisibility, instant kill, spell absorption, action economy
 */
export const SPECIAL_MECHANICS = new Set([
  'Vorpal Sword',              // Instant kill on nat 20
  'Nine Lives Stealer',        // Save-or-die on nat 20
  'Rod of Absorption',         // Absorbs spells targeting you
  'Boots of Speed',            // Doubled movement + advantage
  'Gloves of Missile Snaring', // Deflect ranged attacks
  'Cloak of Invisibility',     // Tactical invisibility
  'Ring of Spell Storing',     // Breaks action economy
  'Broom of Flying',           // Unlimited flight
  'Staff of Power',            // Complex stacking bonuses
  'Sun Blade',                 // Finesse longsword + radiant
  'Cloak of Protection',       // Stacking AC + all saves
]);

/**
 * Numerical edge cases: Conditional bonuses dependent on setting/campaign
 * Examples: +damage vs specific creatures, crit-only effects, 1/day abilities
 */
export const NUMERICAL_EDGE_CASES = new Set([
  'Vicious Weapon',            // +2d6 on nat 20 only
  'Oathbow',                   // +3d6 vs sworn enemy only
  'Giant Slayer',              // +2d6 vs giants only + prone
  'Mace of Disruption',        // 2d6 vs undead/fiends only + destroy
  'Mace of Smiting',           // +3 vs constructs only + crit bonus
  'Dagger of Venom',           // 1/day poison + condition
]);

/**
 * Community notes: Items where our value is lower than book rarity
 * Community consensus suggests these items are underpowered for their tier
 */
export const COMMUNITY_NOTES = new Set([
  'Wings of Flying',           // Calc 1.0 (Uncommon) but official Rare - limited flight weak for tier
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
  // Special mechanics
  if (itemName === 'Vorpal Sword') {
    return 'Decapitation on nat 20 (instant kill). Override score used.';
  }
  if (itemName === 'Nine Lives Stealer') {
    return 'Drains life force on nat 20 (save-or-die). Override score used.';
  }
  if (itemName === 'Rod of Absorption') {
    return 'Absorbs spells targeting you. Override score used.';
  }
  if (itemName === 'Boots of Speed') {
    return 'Doubles movement + Dex save advantage. Override score used.';
  }
  if (itemName === 'Gloves of Missile Snaring') {
    return 'Catch and deflect ranged attacks. Override score used.';
  }
  if (itemName === 'Cloak of Invisibility') {
    return 'Tactical invisibility with charges. Override score used.';
  }
  if (itemName === 'Ring of Spell Storing') {
    return 'Stores up to 5 spell levels (breaks action economy). Override score used.';
  }
  if (itemName === 'Broom of Flying') {
    return 'Unlimited flight calculates as 2.0 pts (Rare) but official is Uncommon. Flight is hard to quantify.';
  }
  if (itemName === 'Staff of Power') {
    return '+2 to attack/damage/AC/saves calculates as 6.0 pts (Legendary), but official is Very Rare. Spellcaster attunement limits value.';
  }
  if (itemName === 'Sun Blade') {
    return '+2 finesse longsword + 1d8 radiant calculates as 3.38 pts (Very Rare) but official is Rare. Finesse + radiant hard to value.';
  }
  if (itemName === 'Cloak of Protection') {
    return '+1 AC and +1 to all saves calculates as 2.0 pts (Rare), but official is Uncommon. Stacking bonuses hard to value.';
  }

  // Numerical edge cases
  if (itemName === 'Vicious Weapon') {
    return '+2d6 on natural 20 only (5% proc). Calc: 0.09 pts (Uncommon), official: Rare. Value depends on crit-fishing builds.';
  }
  if (itemName === 'Oathbow') {
    return '+3d6 + advantage vs sworn enemy. Calc: 2.77 pts (Rare), official: Very Rare. Value depends on campaign.';
  }
  if (itemName === 'Giant Slayer') {
    return '+1 weapon + 2d6 vs giants + prone. Calc: 1.85 pts (Uncommon), official: Rare. Value depends on giant encounters.';
  }
  if (itemName === 'Mace of Disruption') {
    return '2d6 radiant vs undead/fiends + destroy. Calc: 1.1 pts (Uncommon), official: Rare. Value depends on undead campaign.';
  }
  if (itemName === 'Mace of Smiting') {
    return '+1 mace, +3 vs constructs + crit bonus. Calc: 1.0 pts (Uncommon), official: Rare. Value depends on construct encounters.';
  }
  if (itemName === 'Dagger of Venom') {
    return '+1 dagger + 2d10 poison + poisoned (1/day). Calc: 1.4 pts (Uncommon), official: Rare. Situational use.';
  }

  // Community notes
  if (itemName === 'Wings of Flying') {
    return 'Limited flight (1 hr/day). Calc: 1.0 pts (Uncommon), official: Rare. Community considers this weak for Rare tier.';
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
