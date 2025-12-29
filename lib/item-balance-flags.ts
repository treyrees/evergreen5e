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
  'Mace of Disruption',        // Save-or-destroy vs undead/fiends under 25 HP

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
  'Cloak of Displacement',     // Disadvantage on attacks (conditional, turns off when hit)

  // Complex stacking or restrictions
  'Staff of Power',            // +2 to attack/damage/AC/saves (spellcaster-only attunement)
  'Defender',                  // Transfer bonus between attack/damage and AC
  'Holy Avenger',              // Aura: advantage on saves vs spells for allies within 10ft

  // Bonus effects beyond base damage
  'Giant Slayer',              // Knockdown effect vs giants
  'Mace of Smiting',           // Extra crit damage + auto-destroy constructs
  'Sword of Sharpness',        // Limb-severing on nat 20
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
  'Wand of Magic Missiles',    // Calc 0.8 pts (Common) but official Uncommon - auto-hit may justify bump
  'Winged Boots',              // Calc 0.8 pts (Common) but official Uncommon - flight value hard to quantify

  // Character-dependent value (stat setters)
  'Headband of Intellect',     // INT 19 - value depends entirely on your starting INT
  'Gauntlets of Ogre Power',   // STR 19 - value depends entirely on your starting STR
  'Amulet of Health',          // CON 19 - value depends entirely on your starting CON
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
  // === SPECIAL MECHANICS (items with overrideBonus) ===

  // Instant-kill effects
  if (itemName === 'Vorpal Sword') {
    return '+3 sword (3.0 pts base). Bonus +1.0 for decapitation on nat 20—instant kill with no save for most creatures.';
  }
  if (itemName === 'Nine Lives Stealer') {
    return '+2 sword (2.0 pts base). Bonus +1.5 for save-or-die on nat 20 vs creatures under 100 HP.';
  }
  if (itemName === 'Mace of Disruption') {
    return '2d6 radiant vs undead/fiends (~1.3 pts base). Bonus +0.7 for save-or-destroy effect vs targets under 25 HP.';
  }

  // Action economy and spell effects
  if (itemName === 'Rod of Absorption') {
    return 'No quantifiable combat stats. Bonus +3.0 for spell absorption—negates spells targeting you and stores energy.';
  }
  if (itemName === 'Ring of Spell Storing') {
    return 'No quantifiable combat stats. Bonus +2.5 for storing up to 5 spell levels—breaks action economy with pre-cast buffs.';
  }

  // Mobility
  if (itemName === 'Boots of Speed') {
    return 'No quantifiable combat stats. Bonus +2.0 for doubled movement speed and disadvantage on opportunity attacks.';
  }
  if (itemName === 'Broom of Flying') {
    return '50 ft fly speed, unlimited duration. With speed+duration model: 0.75 × 2.0 = 1.5 pts (Uncommon).';
  }
  if (itemName === 'Cloak of Invisibility') {
    return 'No quantifiable combat stats. Bonus +4.0 for invisibility (3 charges, 1hr each)—tactical advantage is campaign-defining.';
  }

  // Defensive
  if (itemName === 'Gloves of Missile Snaring') {
    return 'No quantifiable combat stats. Bonus +1.0 for reaction to reduce ranged damage by 1d10+DEX (catch if reduced to 0).';
  }
  if (itemName === 'Shield of the Cavalier') {
    return 'Math captures +2 AC and bonus action bash (3.2 pts). NOT quantified: push 10ft, prone if smaller, and Protective Field. Actual value likely higher.';
  }
  if (itemName === 'Cloak of Displacement') {
    return 'Grants disadvantage on attacks against you—turns off when hit, resets at start of your next turn. Similar to Blur spell but permanent/self-resetting. Override +2.0 targets Rare; effect is hard to quantify but roughly equivalent to +2-3 effective AC with a conditional downside.';
  }

  // Complex effects (negative bonuses for limitations)
  if (itemName === 'Staff of Power') {
    return '+2 enhancement, +2 AC, +2 saves (7.0 pts base). Bonus -3.5 for spellcaster-only attunement. Community consensus: appropriately balanced at Very Rare—class restriction and hand-occupation are key constraints.';
  }
  if (itemName === 'Defender') {
    return '+3 enhancement and +3 AC (7.5 pts base). Bonus -2.25 for transfer limitation—must split the bonus each turn, can\'t have both.';
  }
  if (itemName === 'Holy Avenger') {
    return '+3 sword with 2d10 radiant vs fiends/undead (~5.0 pts base). Bonus +0.5 for 10-ft aura granting advantage on saves vs spells to you and all allies. Paladin-only attunement limits availability but doesn\'t reduce power for paladins. Community consensus: quintessential paladin weapon, appropriately Legendary.';
  }

  // Bonus effects beyond base damage
  if (itemName === 'Giant Slayer') {
    return '+1 weapon with 2d6 conditional vs giants (~1.7 pts base). Bonus +0.35 for DC 15 STR knockdown (prone) vs giants.';
  }
  if (itemName === 'Mace of Smiting') {
    return '+1 weapon with 2d6 conditional vs constructs (~1.7 pts base). Bonus +0.35 for +4d6 on crit and auto-destroy under 25 HP.';
  }
  if (itemName === 'Sword of Sharpness') {
    return 'Modeled as +3 equivalent (3.0 pts base) for +4d6 on crit. Bonus +0.25 for limb-severing on nat 20.';
  }

  // === COMMUNITY NOTES (no override, just explanation) ===

  if (itemName === 'Cloak of Protection') {
    return '+1 AC and +1 all saves = 2.0 pts (Rare). Official: Uncommon. WotC underpriced this—compare to Ring of Protection (identical, but Rare).';
  }
  if (itemName === 'Sun Blade') {
    return 'Our math: ~3.0 pts (Very Rare). Official: Rare. +2 to hit, radiant damage, +1d8 vs undead. Community agrees it punches above its weight.';
  }
  if (itemName === 'Wand of Magic Missiles') {
    return '4× level 1 spell/day = 0.8 pts (Common). Official: Uncommon. Auto-hit reliability (no attack roll, no save) may justify the bump.';
  }
  if (itemName === 'Wings of Flying') {
    return '60 ft fly speed, 1 hour/day. With speed+duration model: 1.0 × 2.0 = 2.0 pts (Rare).';
  }
  if (itemName === 'Vicious Weapon') {
    return '+2d6 on nat 20 only = 0.1 pts (Common). Official: Rare. At 5% crit rate, this averages +0.35 damage/hit—roughly 3× weaker than +1.';
  }
  if (itemName === 'Winged Boots') {
    return '30 ft fly speed, 4 hrs/day = 0.8 pts (Common). Official: Uncommon. Flight is valuable but hard to quantify—our model may undervalue it.';
  }

  // Character-dependent stat setters
  if (itemName === 'Headband of Intellect') {
    return 'Sets INT to 19. Value is entirely character-dependent: amazing if your INT is 8-14, mediocre if 16+, useless if already 19+. Our formula assumes average benefit.';
  }
  if (itemName === 'Gauntlets of Ogre Power') {
    return 'Sets STR to 19. Value is entirely character-dependent: amazing for low-STR casters/rogues, mediocre for fighters who already have 16+ STR. Our formula assumes average benefit.';
  }
  if (itemName === 'Amulet of Health') {
    return 'Sets CON to 19. Value is entirely character-dependent: amazing if your CON is low, but most adventurers prioritize CON already. Our formula assumes average benefit.';
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
