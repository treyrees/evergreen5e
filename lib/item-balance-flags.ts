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
  'Luck Blade',                // Wish spell - campaign-defining, calculates as ~6.0 pts

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

  // Flat bonuses or non-quantifiable perks
  'Bracers of Archery',        // Flat +2 damage to bows (not dice-based)
  'Cape of the Mountebank',    // Level 4 spell for non-casters, no attunement
  'Dwarven Plate',             // Forced movement immunity
  'Plate Armor of Etherealness', // Plate-wearer access to high-level spell
  'Armor of Invulnerability',  // Temporary immunity to nonmagical damage
  'Bracers of Defense',        // AC stacking restriction (no armor)
  'Brooch of Shielding',       // Magic Missile immunity
  'Circlet of Blasting',       // Scorching Ray value bump
  'Cloak of Arachnida',        // Ceiling walking and web immunity
  'Mace of Terror',            // Fear effect (crowd control)

  // Niche spell effects (too situational to fully model)
  'Trident of Fish Command',   // Dominate Beast on swimming creatures only

  // Unique targeting mechanics
  'Oathbow',                   // Sworn enemy mechanic with advantage
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
 * - Vicious Weapon → 2024 SRD: now hits every time (no longer crit-only)
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
  'Cloak of Protection',       // Calc 2.5 pts (Rare) but official Uncommon

  // Official seems too HIGH (item is weaker than rarity suggests)
  'Wand of Magic Missiles',    // Calc 0.8 pts (Common) but official Uncommon - auto-hit may justify bump

  // Character-dependent value (stat setters)
  'Headband of Intellect',     // INT 19 - value depends entirely on your starting INT
  'Gauntlets of Ogre Power',   // STR 19 - value depends entirely on your starting STR
  'Amulet of Health',          // CON 19 - value depends entirely on your starting CON
  'Belt of Hill Giant Strength',   // STR 21 - value depends on your starting STR
  'Belt of Frost Giant Strength',  // STR 23 - value depends on your starting STR
  'Belt of Stone Giant Strength',  // STR 23 - value depends on your starting STR
  'Belt of Fire Giant Strength',   // STR 25 - value depends on your starting STR
  'Belt of Cloud Giant Strength',  // STR 27 - value depends on your starting STR
  'Belt of Storm Giant Strength',  // STR 29 - value depends on your starting STR

  // Campaign-dependent value (damage type choice)
  'Armor of Resistance',       // Value ranges 0.5-2.25 pts depending on damage type picked
  'Ring of Resistance',        // Same as Armor of Resistance - value depends on damage type
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
    return '+3 sword (3.0 pts base). Bonus +1.0 for decapitation on nat 20; instant kill with no save for most creatures.';
  }
  if (itemName === 'Nine Lives Stealer') {
    return '+2 sword (2.0 pts base). Bonus +1.5 for save-or-die on nat 20 vs creatures under 100 HP.';
  }
  if (itemName === 'Mace of Disruption') {
    return '2d6 radiant vs undead/fiends (~1.3 pts base). Bonus +0.7 for save-or-destroy effect vs targets under 25 HP.';
  }

  // Action economy and spell effects
  if (itemName === 'Rod of Absorption') {
    return 'No quantifiable combat stats. Bonus +3.0 for spell absorption, which negates spells targeting you and stores energy.';
  }
  if (itemName === 'Ring of Spell Storing') {
    return 'No quantifiable combat stats. Bonus +2.5 for storing up to 5 spell levels, breaking action economy with pre-cast buffs.';
  }
  if (itemName === 'Luck Blade') {
    return '+1 sword with +1 saves (2.0 pts base). Wish 1/day calculates as 4.0 pts using level 9 spell scaling (20 effective value × 0.20 long rest multiplier). Total ~6.0 pts, at the high end of Legendary, campaign-defining.';
  }

  // Mobility
  if (itemName === 'Boots of Speed') {
    return 'No quantifiable combat stats. Bonus +2.0 for doubled movement speed and disadvantage on opportunity attacks.';
  }
  if (itemName === 'Broom of Flying') {
    return '50 ft fly speed, unlimited duration. Additive model: 1.0 (speed) + 0.1 (duration) = 1.1 pts (Uncommon).';
  }
  if (itemName === 'Cloak of Invisibility') {
    return 'No quantifiable combat stats. Bonus +4.0 for invisibility (3 charges, 1hr each); tactical advantage is campaign-defining.';
  }

  // Defensive
  if (itemName === 'Gloves of Missile Snaring') {
    return 'No quantifiable combat stats. Bonus +1.0 for reaction to reduce ranged damage by 1d10+DEX (catch if reduced to 0).';
  }
  if (itemName === 'Shield of the Cavalier') {
    return 'Math captures +2 AC and bonus action bash (3.2 pts). NOT quantified: push 10ft, prone if smaller, and Protective Field. Actual value likely higher.';
  }
  if (itemName === 'Cloak of Displacement') {
    return 'Grants disadvantage on attacks against you; turns off when hit, resets at start of your next turn. Similar to Blur spell but permanent/self-resetting. Override +2.0 targets Rare; effect is hard to quantify but roughly equivalent to +2-3 effective AC with a conditional downside.';
  }

  // Complex effects (negative bonuses for limitations)
  if (itemName === 'Staff of Power') {
    return '+2 enhancement, +2 AC, +2 saves (7.0 pts base). Bonus -3.5 for spellcaster-only attunement. Community consensus: appropriately balanced at Very Rare; class restriction and hand-occupation are key constraints.';
  }
  if (itemName === 'Defender') {
    return '+3 enhancement and +3 AC (7.5 pts base). Bonus -2.25 for transfer limitation: must split the bonus each turn, can\'t have both.';
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

  // Flat bonuses or non-quantifiable perks
  if (itemName === 'Bracers of Archery') {
    return 'Flat +2 damage bonus to longbow/shortbow attacks. Bonus +1.0 models this as roughly equivalent to +1 enhancement for damage only (no attack roll bonus).';
  }
  if (itemName === 'Cape of the Mountebank') {
    return 'Dimension Door (level 4) 1/day = 0.8 pts. Bonus +1.2 for no attunement on a level 4 spell usable by any character, giving martial classes 500ft teleportation without burning an attunement slot. Smoke cloud at departure point is a bonus.';
  }
  if (itemName === 'Dwarven Plate') {
    return '+2 AC plate armor (2.0 pts). Bonus +1.0 for reaction to reduce forced ground movement by up to 10 feet, mitigating positioning control from Thunderwave, Repelling Blast, and similar effects.';
  }
  if (itemName === 'Plate Armor of Etherealness') {
    return 'Etherealness (level 7) 1/day (~2.0 pts base). Bonus +2.0 for giving plate-wearers (typically non-casters) access to a powerful 7th-level spell that normally requires caster class and high-level slots.';
  }
  if (itemName === 'Armor of Invulnerability') {
    return 'Resistance to nonmagical B/P/S (3.75 pts). Bonus +0.5 for 10-minute immunity to nonmagical damage (1/day), providing complete invulnerability to most physical attacks.';
  }
  if (itemName === 'Bracers of Defense') {
    return '+2 AC (stacking, so 3.0 pts base). Bonus -0.5 for restriction: only works when wearing no armor and not using a shield. Limits to unarmored builds (monks, bladesinger, barbarian).';
  }
  if (itemName === 'Brooch of Shielding') {
    return 'Force resistance (~0.5 pts). Bonus +0.5 for complete immunity to Magic Missile, guaranteeing safety from an auto-hit spell that can break concentration.';
  }
  if (itemName === 'Circlet of Blasting') {
    return 'Scorching Ray (level 2) 1/day calculates as 0.4 pts. Bonus +0.6 for reliable multi-target damage (3 rays × 2d6) with no attunement required.';
  }
  if (itemName === 'Cloak of Arachnida') {
    return 'Poison resistance (2.0 pts) + climb speed (0.5 pts) + Web 1/day (0.4 pts) = 2.9 pts. Bonus +0.2 for ceiling walking (like Spider Climb spell) and web immunity.';
  }
  if (itemName === 'Mace of Terror') {
    return 'No base enhancement. Bonus +2.0 for fear aura (3 charges, DC 15 WIS); frightened condition is powerful crowd control that denies enemy actions and forces disadvantage.';
  }

  // Niche spell effects
  if (itemName === 'Trident of Fish Command') {
    return '+1 trident (1.0 pts base). Bonus +0.25 for 3 charges of Dominate Beast, restricted to beasts with a swimming speed. The low bonus reflects how rarely most campaigns encounter aquatic beasts; in a seafaring campaign, this item is significantly stronger.';
  }

  // Unique targeting mechanics
  if (itemName === 'Oathbow') {
    return '3d6 piercing (3.0 pts) × sworn-enemy (0.6×) = 1.8 pts + advantage on attacks (1.5 pts) = 3.3 pts (Very Rare). Sworn enemy: declare one target per long rest; bonus damage and advantage apply to all attacks against that target until it dies.';
  }

  // === COMMUNITY NOTES (no override, just explanation) ===

  if (itemName === 'Cloak of Protection') {
    return '+1 AC and +1 all saves = 2.5 pts (Rare). Official: Uncommon. WotC underpriced this; compare to Ring of Protection (identical, but Rare).';
  }
  if (itemName === 'Wand of Magic Missiles') {
    return '4× level 1 spell/day = 0.8 pts (Common). Official: Uncommon. Auto-hit reliability (no attack roll, no save) may justify the bump.';
  }
  if (itemName === 'Wings of Flying') {
    return '60 ft fly speed, 1 hour/day. Additive model: 2.0 (speed) + 0.0 (duration) = 2.0 pts (Rare).';
  }
  if (itemName === 'Winged Boots') {
    return '30 ft fly speed, 4 hrs/day. Additive model: 0.75 (speed) + 0.25 (duration) = 1.0 pts (Uncommon).';
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

  // Character-dependent stat setters (Belt variants)
  if (itemName === 'Belt of Hill Giant Strength') {
    return 'Sets STR to 21 (+5 mod). Value is character-dependent: amazing for low-STR casters/rogues, less impactful for martial characters who may already have 18+ STR.';
  }
  if (itemName === 'Belt of Frost Giant Strength' || itemName === 'Belt of Stone Giant Strength') {
    return 'Sets STR to 23 (+6 mod). Value is character-dependent: guarantees exceptional strength regardless of starting score, but martial characters with high STR get less relative benefit.';
  }
  if (itemName === 'Belt of Fire Giant Strength') {
    return 'Sets STR to 25 (+7 mod). Value is character-dependent: exceeds normal maximum (20), so universally powerful but still more impactful for low-STR characters.';
  }
  if (itemName === 'Belt of Cloud Giant Strength') {
    return 'Sets STR to 27 (+8 mod). Value is character-dependent: far exceeds normal maximum, but even fighters benefit from the +8 modifier for attacks and damage.';
  }
  if (itemName === 'Belt of Storm Giant Strength') {
    return 'Sets STR to 29 (+9 mod). Value is character-dependent: near-maximum possible strength (+9 mod). At this level, everyone benefits massively regardless of starting STR.';
  }

  // Campaign-dependent damage type choice
  if (itemName === 'Armor of Resistance') {
    return 'Value depends entirely on which damage type you pick and your campaign. Fire resistance = 2.25 pts (Rare), poison/cold = 2.0 pts, acid = 1.5 pts, radiant = 0.75 pts (Uncommon), force = 0.5 pts (Common). Pick fire/poison/cold for max value; force/radiant are poor choices unless your DM loves beholders or angels.';
  }
  if (itemName === 'Ring of Resistance') {
    return 'Same mechanics as Armor of Resistance; value depends entirely on damage type chosen. Fire/poison/cold = max value; force/radiant = minimal value. Attunement required.';
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
