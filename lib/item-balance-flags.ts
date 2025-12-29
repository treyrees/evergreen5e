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
  'Dragon Slayer',             // +3d6 vs dragons - conditional damage undervalued
  'Giant Slayer',              // +2d6 vs giants - conditional damage undervalued
  'Mace of Disruption',        // +2d6 radiant vs undead/fiends - conditional damage undervalued
  'Mace of Smiting',           // +2 enhancement + crit bonus vs constructs - conditional effects
  'Sun Blade',                 // Radiant damage multiplier may overvalue this item
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
  'Wand of Fireballs',         // Spell charges not valued in our math
  'Wand of Lightning Bolts',   // Spell charges not valued in our math
  'Wand of Magic Missiles',    // Spell charges not valued in our math
  'Javelin of Lightning',      // Single-use spell charge not valued
  'Dagger of Venom',           // Poison charge not valued properly
  'Gloves of Missile Snaring', // Defensive utility not quantified
  'Animated Shield',           // Special activation mechanic
  'Staff of Power',            // Overvalued - powerful but scored too high
  'Energy Bow',                // Force damage + restraint arrow - special abilities
  'Quarterstaff of the Acrobat', // +5 AC reaction (1/rest) not fully valued
  'Sentinel Shield',           // Advantage on Initiative not quantified
  'Shield of the Cavalier',    // Force bash damage + protective field not quantified
  'Cloak of Invisibility',     // Invisibility charges - tactical advantage
]);

/**
 * Community consensus: Well-established community notes about balance
 * These tend to be items the community considers stronger OR weaker than their rarity
 * Sources: EN World, D&D Beyond, Giant in the Playground, Quora discussions
 */
export const COMMUNITY_NOTES = new Set([
  'Broom of Flying',           // Uncommon but should be Rare - unlimited flight, no attunement
  'Winged Boots',              // Uncommon but should be Rare - "greatest uncommon in DMG"
  'Ring of Spell Storing',     // Rare - very powerful, breaks action economy
  'Cloak of Displacement',     // Rare - disadvantage on all attacks is very strong
  'Wings of Flying',           // Rare but time-limited, inferior to Broom of Flying
  'Trident of Fish Command',   // Uncommon but very niche (only controls fish)
  'Armor of Resistance',       // Rare - single resistance undervalued by our math
  'Frost Brand',               // Very Rare - fire resistance + damage undervalued
  'Cloak of Protection',       // Uncommon - AC + saves bonus undervalued
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
    return '+2d6 damage on natural 20 (5% proc rate = ~0.35 damage/attack, now quantified)';
  }
  if (itemName === 'Oathbow') {
    return '+3d6 vs sworn enemy (conditional damage undervalued despite frequency)';
  }
  if (itemName === 'Nine Lives Stealer') {
    return 'Drains life force on nat 20 (instant kill effect on crit not fully weighted)';
  }
  if (itemName === 'Dragon Slayer') {
    return '+3d6 vs dragons (conditional damage heavily discounted at ×0.25, but dragons are common high-CR enemies)';
  }
  if (itemName === 'Giant Slayer') {
    return '+2d6 vs giants (conditional damage heavily discounted at ×0.25, but giants are common enemies)';
  }
  if (itemName === 'Mace of Disruption') {
    return '+2d6 radiant vs undead/fiends (conditional damage + radiant type undervalued for common enemy types)';
  }
  if (itemName === 'Mace of Smiting') {
    return '+2 enhancement and +2d6 crit damage vs constructs (conditional bonuses not fully valued)';
  }
  if (itemName === 'Sun Blade') {
    return '+2 enhancement + 1d8 radiant (our radiant ×1.1 multiplier may overvalue this to 3.38 pts, pushing it to Very Rare when official is Rare)';
  }

  // Special mechanics
  if (itemName === 'Vorpal Sword') {
    return 'Decapitation on nat 20 (instant kill effect can\'t be modeled)';
  }
  if (itemName === 'Luck Blade') {
    return 'Grants Wish spell 1d4-1 times (utility beyond combat math)';
  }
  if (itemName === 'Rod of Absorption') {
    return 'Absorbs spells targeting you (defensive utility not quantified)';
  }
  if (itemName === 'Boots of Speed') {
    return 'Doubles movement + Dex save advantage (mobility value not quantified)';
  }
  if (itemName === 'Wand of Fireballs') {
    return 'Casts Fireball (3rd level spell, 4 uses/day) - spell charges not valued in our combat math';
  }
  if (itemName === 'Wand of Lightning Bolts') {
    return 'Casts Lightning Bolt (3rd level spell, 4 uses/day) - spell charges not valued in our combat math';
  }
  if (itemName === 'Wand of Magic Missiles') {
    return 'Casts Magic Missile (1st level spell, 4 uses/day) - spell charges not valued in our combat math';
  }
  if (itemName === 'Javelin of Lightning') {
    return 'Single-use Lightning Bolt effect (4d6 damage, DC 13) - spell charge not valued in our math';
  }
  if (itemName === 'Dagger of Venom') {
    return 'Poison coating (2d10, DC 15, 1/day) - charge-based damage not properly valued';
  }
  if (itemName === 'Gloves of Missile Snaring') {
    return 'Catch and deflect ranged attacks (defensive utility not quantified in our math)';
  }
  if (itemName === 'Animated Shield') {
    return 'Bonus action to float and protect you (hands-free AC bonus mechanic not fully valued)';
  }
  if (itemName === 'Staff of Power') {
    return '+2 to attack/damage/AC/saves scores as 6.0 (Legendary tier), but official is Very Rare - our math may overvalue stacking bonuses';
  }
  if (itemName === 'Energy Bow') {
    return '+1 bow that deals Force damage instead of Piercing, with Arrow of Restraint (DC 15 STR save) - force damage type and restraint ability add tactical value beyond +1 enhancement';
  }
  if (itemName === 'Quarterstaff of the Acrobat') {
    return '+2 weapon with Attack Deflection (+5 AC as reaction, 1/short rest) - the occasional defensive boost adds value beyond our +2 enhancement calculation';
  }
  if (itemName === 'Sentinel Shield') {
    return 'Shield with advantage on Initiative rolls and Perception checks - combat initiative advantage not quantified in our math';
  }
  if (itemName === 'Shield of the Cavalier') {
    return '+2 AC shield (total +4) with Forceful Bash (2d6+2+STR force damage) and Protective Field - offensive capabilities beyond standard shield not quantified';
  }
  if (itemName === 'Cloak of Invisibility') {
    return 'Legendary cloak with 3 charges for Invisibility (1 hour each, regain 1d3/day) - tactical invisibility advantage estimated at 4.0 pts';
  }

  // Community notes
  if (itemName === 'Broom of Flying') {
    return 'Uncommon but widely considered Rare-tier (unlimited flight, no attunement)';
  }
  if (itemName === 'Winged Boots') {
    return 'Uncommon but widely considered Rare-tier ("greatest uncommon in DMG")';
  }
  if (itemName === 'Ring of Spell Storing') {
    return 'Very powerful for Rare tier (breaks action economy)';
  }
  if (itemName === 'Cloak of Displacement') {
    return 'Very strong for Rare tier (disadvantage on all attacks against you)';
  }
  if (itemName === 'Wings of Flying') {
    return 'Weak for Rare tier (time-limited, inferior to Broom of Flying)';
  }
  if (itemName === 'Trident of Fish Command') {
    return 'Weak for Uncommon (very niche - only controls fish)';
  }
  if (itemName === 'Armor of Resistance') {
    return 'Single damage resistance valued at 1.5 pts (Uncommon), but official is Rare - resistances may be undervalued';
  }
  if (itemName === 'Frost Brand') {
    return '1d6 cold damage + fire resistance valued at 2.5 pts (Rare), but official is Very Rare - resistance + damage combo undervalued';
  }
  if (itemName === 'Cloak of Protection') {
    return '+1 AC and +1 to all saves valued at 2.0 pts (Rare), but official is Uncommon - our math may overvalue stacking bonuses';
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
