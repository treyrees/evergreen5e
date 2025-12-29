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
  // Note: Luck Blade now calculates correctly using level 9 spell scaling for Wish

  // Tactical mobility and positioning
  'Boots of Speed',            // Doubled movement + disadvantage on opportunity attacks
  'Cloak of Invisibility',     // Tactical invisibility

  // Defensive special mechanics
  'Gloves of Missile Snaring', // Deflect ranged attacks (reaction-based)
  'Shield of the Cavalier',    // Push/prone + Protective Field not quantified

  // Complex stacking or restrictions
  'Staff of Power',            // +2 to attack/damage/AC/saves (spellcaster-only attunement)
]);

/**
 * Numerical edge cases: Conditional bonuses dependent on setting/campaign
 * These items can be quantified, but their value varies wildly based on how often
 * the condition triggers in your specific campaign
 *
 * NOTE: Most items previously here now calculate correctly:
 * - Oathbow → sworn-enemy (0.6×)
 * - Giant Slayer, Dragon Slayer, Mace of Smiting → creature-rare (0.4×)
 * - Mace of Disruption → creature-common (0.6×)
 * - Dagger of Venom, Javelin of Lightning → spell level adjusted
 * - Vicious Weapon → vicious checkbox (×0.05 for 5% crit proc)
 */
export const NUMERICAL_EDGE_CASES = new Set<string>([
  // Currently empty - all items now calculate correctly with conditionalType or vicious flag
]);

/**
 * Community notes: Items where official rarity seems misaligned with power level
 * These use overrideScore or are known balance oddities in official 5e
 */
export const COMMUNITY_NOTES = new Set([
  // Official seems too LOW (item is stronger than rarity suggests)
  'Cloak of Protection',       // Calc 2.0 pts (Rare) but official Uncommon
  'Sun Blade',                 // Calc 3.0+ pts (Very Rare) but official Rare - community agrees it's powerful

  // Official seems too HIGH (item is weaker than rarity suggests)
  'Vicious Weapon',            // Calc 0.1 pts (Common) but official Rare - 5% proc is ~3x weaker than +1
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
  // Luck Blade now calculates correctly using level 9 spell value for Wish

  // Mobility
  if (itemName === 'Boots of Speed') {
    return 'Click heels to double speed for 10 min. Opportunity attacks have disadvantage. Mobility is hard to price.';
  }
  if (itemName === 'Broom of Flying') {
    return '50 ft fly speed, unlimited duration. With speed+duration model: 0.75 × 2.0 = 1.5 pts (Uncommon).';
  }
  if (itemName === 'Cloak of Invisibility') {
    return 'Tactical invisibility (3 charges, 1hr each). Invisibility advantage on attacks/stealth is campaign-defining.';
  }

  // Defensive
  if (itemName === 'Gloves of Missile Snaring') {
    return 'Reaction to reduce ranged weapon damage by 1d10+DEX. Situational but can completely negate hits.';
  }
  if (itemName === 'Shield of the Cavalier') {
    return 'Math captures +2 AC and bonus action bash (3.2 pts). NOT quantified: push 10ft, prone if smaller, and Protective Field (Otiluke\'s-style emanation). Actual value likely higher than calculated.';
  }

  // Complex effects
  if (itemName === 'Staff of Power') {
    return '+2 to attack/damage/AC/saves is 6.0 pts (Legendary calc) but official Very Rare. Spellcaster-only attunement limits audience significantly.';
  }

  // === COMMUNITY NOTES ===

  if (itemName === 'Cloak of Protection') {
    return '+1 AC and +1 all saves = 2.0 pts (Rare). Official: Uncommon. WotC underpriced this—compare to Ring of Protection (identical, but Rare).';
  }
  if (itemName === 'Sun Blade') {
    return 'Official: Rare. Our math: ~3.0 pts (Very Rare). +2 to hit, 1d8 radiant, +1d8 vs undead, finesse, and creates sunlight. The community widely agrees the Sun Blade punches above its weight class.';
  }
  if (itemName === 'Wings of Flying') {
    return '60 ft fly speed, 1 hour/day. With speed+duration model: 1.0 × 2.0 = 2.0 pts (Rare).';
  }
  if (itemName === 'Vicious Weapon') {
    return '+2d6 on nat 20 only = 0.1 pts (Common). Official: Rare. At 5% crit rate, this averages +0.35 damage/hit—roughly 3× weaker than a +1 weapon.';
  }

  return '';
}

/**
 * Get a thematic emoji for an item based on its name
 */
export function getItemEmoji(itemName: string): string {
  const name = itemName.toLowerCase();

  // Specific items first
  if (name.includes('vorpal')) return '💀';
  if (name.includes('sun blade')) return '☀️';
  if (name.includes('flame tongue')) return '🔥';
  if (name.includes('frost brand')) return '❄️';
  if (name.includes('dragon slayer')) return '🐉';
  if (name.includes('giant slayer')) return '🗻';
  if (name.includes('nine lives')) return '🐱';
  if (name.includes('luck blade')) return '🍀';
  if (name.includes('holy avenger')) return '✝️';
  if (name.includes('oathbow')) return '🎯';
  if (name.includes('venom')) return '🐍';
  if (name.includes('lightning')) return '⚡';
  if (name.includes('thunder')) return '🌩️';
  if (name.includes('warning')) return '👁️';
  if (name.includes('defender')) return '🛡️';
  if (name.includes('dancing')) return '💃';
  if (name.includes('sharpness')) return '✂️';
  if (name.includes('wounding')) return '🩸';
  if (name.includes('life stealing') || name.includes('life-stealing')) return '💀';
  if (name.includes('disruption')) return '💥';
  if (name.includes('smiting')) return '⚡';
  if (name.includes('terror')) return '😱';

  // Armor and protection
  if (name.includes('adamantine')) return '⚙️';
  if (name.includes('mithral')) return '✨';
  if (name.includes('plate')) return '🛡️';
  if (name.includes('shield')) return '🛡️';
  if (name.includes('armor')) return '🛡️';

  // Cloaks and wearables
  if (name.includes('cloak')) return '🧥';
  if (name.includes('boots')) return '👢';
  if (name.includes('gloves') || name.includes('gauntlets')) return '🧤';
  if (name.includes('helm') || name.includes('helmet')) return '⛑️';
  if (name.includes('ring')) return '💍';
  if (name.includes('amulet') || name.includes('necklace') || name.includes('periapt')) return '📿';
  if (name.includes('belt') || name.includes('girdle')) return '🎗️';
  if (name.includes('bracers')) return '💪';
  if (name.includes('wings')) return '🪽';
  if (name.includes('flying') || name.includes('broom')) return '🧹';

  // Weapons by type
  if (name.includes('bow') || name.includes('arrow')) return '🏹';
  if (name.includes('sword') || name.includes('blade') || name.includes('scimitar')) return '⚔️';
  if (name.includes('axe')) return '🪓';
  if (name.includes('hammer') || name.includes('maul') || name.includes('mace')) return '🔨';
  if (name.includes('dagger')) return '🗡️';
  if (name.includes('staff')) return '🪄';
  if (name.includes('wand')) return '🪄';
  if (name.includes('rod')) return '🪄';
  if (name.includes('spear') || name.includes('javelin') || name.includes('trident')) return '🔱';
  if (name.includes('crossbow')) return '🎯';
  if (name.includes('whip')) return '〰️';

  // Magic items
  if (name.includes('potion')) return '🧪';
  if (name.includes('scroll')) return '📜';
  if (name.includes('tome') || name.includes('book') || name.includes('manual')) return '📖';
  if (name.includes('bag')) return '👝';
  if (name.includes('carpet')) return '🪔';
  if (name.includes('rope')) return '🪢';
  if (name.includes('lantern') || name.includes('lamp')) return '🏮';
  if (name.includes('mirror')) return '🪞';
  if (name.includes('horn')) return '📯';
  if (name.includes('stone')) return '💎';
  if (name.includes('orb') || name.includes('crystal')) return '🔮';
  if (name.includes('ioun')) return '🌟';

  // Materials/elements
  if (name.includes('fire') || name.includes('flame')) return '🔥';
  if (name.includes('cold') || name.includes('frost') || name.includes('ice')) return '❄️';
  if (name.includes('poison')) return '☠️';
  if (name.includes('force')) return '💫';
  if (name.includes('radiant') || name.includes('light')) return '✨';
  if (name.includes('necrotic')) return '💀';

  // Creatures
  if (name.includes('demon') || name.includes('devil')) return '😈';
  if (name.includes('undead') || name.includes('vampire')) return '🧛';
  if (name.includes('elemental')) return '🌀';

  // Default based on general weapon category
  if (name.includes('weapon')) return '⚔️';

  // Fallback
  return '✨';
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
