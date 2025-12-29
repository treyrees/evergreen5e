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
  'Vicious Weapon',            // +2d6 on nat 20 - we don't track critical-only bonuses
  'Oathbow',                   // +3d6 vs sworn enemy - we mark conditional but undervalues it
  'Nine Lives Stealer',        // Drains life force on nat 20 - instant kill effect on crit
]);

/**
 * Special mechanics: Items with non-numerical benefits our math can't quantify
 * These have unique effects that can't be reduced to combat points
 * Examples: Instant kill, wish spells, spell absorption
 */
export const SPECIAL_MECHANICS = new Set([
  'Vorpal Sword',              // Decapitation on nat 20 (instant kill) - can't model
  'Luck Blade',                // Wish spell (1d4-1 uses) - utility beyond numbers
  'Rod of Absorption',         // Absorbs spells targeting you - defensive utility
  'Boots of Speed',            // Doubles movement + Dex save advantage - mobility value
]);

/**
 * Community consensus: Well-established community notes about balance
 * These tend to be items the community considers stronger than their rarity
 * Sources: EN World, D&D Beyond, Giant in the Playground, Quora discussions
 */
export const COMMUNITY_NOTES = new Set([
  'Broom of Flying',           // Uncommon but should be Rare - unlimited flight, no attunement
  'Winged Boots',              // Uncommon but should be Rare - "greatest uncommon in DMG"
  'Ring of Spell Storing',     // Rare - very powerful, breaks action economy
  'Cloak of Displacement',     // Rare - disadvantage on all attacks is very strong
  'Headband of Intellect',     // Uncommon - INT 19 is massive for non-casters
  'Gauntlets of Ogre Power',   // Uncommon - STR 19 is massive for non-martials
  'Amulet of Health',          // Rare - CON 19 is very strong
  'Wings of Flying',           // Rare but time-limited, inferior to Broom of Flying
  'Trident of Fish Command',   // Uncommon but very niche (only controls fish)
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
} {
  return {
    hasNumerical: hasNumericalEdgeCases(itemName),
    hasSpecial: hasSpecialMechanics(itemName),
    hasCommunity: hasCommunityNotes(itemName),
    numericalIcon: '🔢',  // Numbers for numerical edge cases
    specialIcon: '⭐',    // Star for special mechanics
    communityIcon: '💬', // Speech bubble for community notes
  };
}
