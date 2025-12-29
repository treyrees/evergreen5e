/**
 * Lists of items flagged for balance issues
 * - Mathematical mismatches: Items where calculated rarity differs significantly from stated rarity
 * - Community mismatches: Items identified by D&D community as unbalanced for their rarity
 */

/**
 * Mathematical mismatches: Items in SRD where our calculation differs by 2+ tiers
 * These are items where the combat math doesn't match the stated rarity
 * Updated with new features: abilityScoreSetter, flight, and manual overrides
 * Current accuracy: 46.5% exact matches, 4.7% off by 2+ tiers (2 items out of 43)
 */
export const MATHEMATICAL_MISMATCHES = new Set([
  'Vicious Weapon',            // Rare → Common (0 pts) - nat 20 only damage not valued
  'Boots of Speed',            // Rare → Common (0 pts) - utility item, doubles speed
]);

/**
 * Community mismatches: Items identified by D&D community as poorly balanced
 * Sources:
 * - EN World forums: "Magic items are not particularly consistent in their Power vs Rarity"
 * - D&D Beyond discussions on flying item balance
 * - Quora discussions on overpowered/underpowered items for rarity
 * - Giant in the Playground "Sane Magic Item Prices" discussions
 */
export const COMMUNITY_MISMATCHES = new Set([
  // Overpowered for rarity
  'Broom of Flying',           // Uncommon, should be Rare - unlimited flight, no attunement
  'Winged Boots',              // Uncommon, should be Rare - "greatest uncommon item in DMG"
  'Ring of Spell Storing',     // Rare - considered very powerful, breaks action economy
  'Cloak of Displacement',     // Rare - disadvantage on all attacks is very strong
  'Headband of Intellect',     // Uncommon - sets INT to 19, massive for non-casters
  'Gauntlets of Ogre Power',   // Uncommon - sets STR to 19, massive for non-martials
  'Amulet of Health',          // Rare - sets CON to 19, but also flagged mathematically

  // Underpowered for rarity (or has special mechanics not captured in math)
  'Vorpal Sword',              // Legendary - decapitation ability not modeled, shows as Very Rare
  'Luck Blade',                // Legendary - Wish spell not modeled, shows as Uncommon
  'Rod of Absorption',         // Very Rare - spell absorption not modeled, shows as Common
  'Wings of Flying',           // Rare - time limited, inferior to Broom of Flying
  'Trident of Fish Command',   // Uncommon - very niche, only controls fish
]);

/**
 * Check if an item has a mathematical mismatch (our formula vs stated rarity)
 */
export function hasMathematicalMismatch(itemName: string): boolean {
  return MATHEMATICAL_MISMATCHES.has(itemName);
}

/**
 * Check if an item has a community-identified mismatch
 */
export function hasCommunityMismatch(itemName: string): boolean {
  return COMMUNITY_MISMATCHES.has(itemName);
}

/**
 * Get warning indicator for an item
 * Returns object with warning type and display info
 */
export function getWarningIndicator(itemName: string): {
  hasMath: boolean;
  hasCommunity: boolean;
  mathIcon: string;
  communityIcon: string;
} {
  return {
    hasMath: hasMathematicalMismatch(itemName),
    hasCommunity: hasCommunityMismatch(itemName),
    mathIcon: '🔷', // Teal diamond for mathematical mismatch
    communityIcon: '🟠', // Amber circle for community mismatch
  };
}
