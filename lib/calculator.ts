import { CombatFeatures, Rarity, MagicItem } from '@/types/magic-item';
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

  // Weak types (more resistances/immunities)
  'necrotic': 0.9,   // Some resistances
  'poison': 0.7,     // Very commonly resisted/immune
  'bludgeoning': 0.85,  // Non-magical physical
  'piercing': 0.85,
  'slashing': 0.85,
};

function getDiceValue(diceString: string): number {
  const match = diceString.match(/^(\d+)d(\d+)$/);
  if (!match) return 0;

  const numDice = parseInt(match[1]);
  const dieType = `d${match[2]}`;
  const baseValue = DIE_TYPE_VALUES[dieType] || 1.0;

  return numDice * baseValue;
}

// Legacy lookup for backward compatibility
const DICE_VALUES: Record<string, number> = {
  '1d4': getDiceValue('1d4'),
  '1d6': getDiceValue('1d6'),
  '1d8': getDiceValue('1d8'),
  '1d10': getDiceValue('1d10'),
  '2d6': getDiceValue('2d6'),
  '3d6': getDiceValue('3d6'),
  '2d8': getDiceValue('2d8'),
  '3d8': getDiceValue('3d8'),
  '4d6': getDiceValue('4d6'),
};

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
 * Get the score for an item, using overrideScore if available
 */
export function getItemScore(item: Partial<MagicItem>): number {
  if (item.overrideScore !== undefined) {
    return item.overrideScore;
  }
  return item.combat ? calculateCombatScore(item.combat) : 0;
}

/**
 * Calculate combat power score from combat features
 */
export function calculateCombatScore(combat: CombatFeatures): number {
  let score = 0;

  // Enhancement bonus
  score += combat.enhancement;

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

    // Conditional damage (only works vs specific creatures)
    // Increased from 0.25 to 0.5 because dragons, giants, undead, fiends are common enemies
    if (combat.damageBonus.conditional) {
      diceValue *= 0.5;
    }

    score += diceValue;
  }

  // AC bonus
  if (combat.acBonus) {
    score += combat.acBonus;
  }

  // Saving throw bonus
  if (combat.savingThrowBonus) {
    score += combat.savingThrowBonus;
  }

  // Ability score setter - scales with the value it sets to
  // Reduced baseline from 2.5 to 1.5 to match official rarities (Gauntlets, Headband = Uncommon)
  if (combat.abilityScoreSetter) {
    const setValue = combat.abilityScoreSetter.setValue;
    if (setValue >= 25) score += 4.0;      // +7 modifier (epic)
    else if (setValue >= 23) score += 3.5; // +6 modifier (very powerful)
    else if (setValue >= 21) score += 3.0; // +5 modifier (powerful)
    else score += 1.5;                      // 19 or lower (+4 modifier, baseline)
  }

  // Ability score bonus - adds to existing score
  // +2 ability = +1 modifier (affects multiple rolls) ≈ 0.75 pts per +1 ability
  if (combat.abilityScoreBonus) {
    score += combat.abilityScoreBonus.bonus * 0.75;
  }

  // Flight - one of the most powerful abilities in D&D
  if (combat.flight) {
    if (combat.flight.duration === 'unlimited') {
      // Unlimited flight is extremely powerful (Broom of Flying should be Rare)
      score += 2.0;
    } else if (combat.flight.hoursPerDay && combat.flight.hoursPerDay >= 4) {
      // 4+ hours per day is still very strong (Winged Boots)
      score += 1.5;
    } else {
      // Limited flight (1-2 hours/day like Wings of Flying)
      score += 1.0;
    }
  }

  // Damage resistances - each resistance is worth 2.0 points
  // Increased from 1.5 to 2.0 to better match official rarities (Armor of Resistance, Frost Brand)
  if (combat.resistances && combat.resistances.length > 0) {
    score += combat.resistances.length * 2.0;
  }

  // Spell charges (legacy format)
  if (combat.charges && combat.charges.length > 0) {
    for (const charge of combat.charges) {
      // Normalize "dawn" to "long rest"
      const normalizedRecharge = charge.recharge === 'dawn'
        ? 'long rest'
        : charge.recharge;
      const multiplier = RECHARGE_MULTIPLIERS[normalizedRecharge] || 0.5;
      score += charge.spellLevel * charge.usesPerDay * multiplier;
    }
  }

  // Charge pool (new intuitive format)
  if (combat.chargePool && combat.chargePool.abilities.length > 0) {
    // Calculate sustainable daily charges (what you can expect to use each day on average)
    // Assumes 2 short rests per adventuring day (standard D&D assumption)
    // Note: maxCharges is just the cap, not additional daily charges
    const dailyRecharge =
      combat.chargePool.chargesPerLongRest +
      (combat.chargePool.chargesPerShortRest * 2);

    // Use the lower of daily recharge or max charges as the sustainable daily budget
    // (If you regain more than max, you're capped; if less, you use what you regain)
    const sustainableDailyCharges = Math.min(
      dailyRecharge > 0 ? dailyRecharge : combat.chargePool.maxCharges,
      combat.chargePool.maxCharges
    );

    // Calculate score for each ability
    for (const ability of combat.chargePool.abilities) {
      if (ability.chargesPerUse > 0) {
        const effectiveUses = sustainableDailyCharges / ability.chargesPerUse;
        // Multiplier tuned to balance charge-based items appropriately
        const multiplier = 0.15;
        score += ability.spellLevel * effectiveUses * multiplier;
      }
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

  const userScore = calculateCombatScore(userItem.combat);
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
  const anchorScore = calculateCombatScore(anchor.combat);
  const scoreDiff = userScore - anchorScore;
  const comparison = compareToAnchor(userItem, anchor, scoreDiff);

  return { anchor, anchorScore, comparison };
}

/**
 * Find top N anchor items for comparison
 * Prioritizes based on: broad category (weapon/armor/trinket), attunement, and score proximity
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

  const userScore = calculateCombatScore(userItem.combat);
  const allItems = srdItems as MagicItem[];
  const userBroadCategory = userItem.baseItem ? getBroadCategory(userItem.baseItem) : 'trinket';
  const userAttunement = userItem.attunement || false;

  // Separate named items from generic +X items
  const namedItems = allItems.filter(item => !isGenericItem(item));
  const genericItems = allItems.filter(item => isGenericItem(item));

  // Collect all candidates with their scores and priority level
  const candidates: Array<{
    item: MagicItem;
    score: number;
    scoreDiff: number;
    priority: number;
  }> = [];

  // Process generic items first - exact score matches get highest priority
  genericItems.forEach((item) => {
    const score = getItemScore(item);
    const scoreDiff = Math.abs(score - userScore);
    const itemBroadCategory = getBroadCategory(item.baseItem);
    const sameBroadCategory = itemBroadCategory === userBroadCategory;

    let priority: number;

    // Exact score match gets top priority (perfect +1/+2/+3 match)
    if (scoreDiff < 0.1 && sameBroadCategory) {
      priority = 1;
    } else if (sameBroadCategory) {
      priority = 6;
    } else {
      priority = 7;
    }

    candidates.push({
      item,
      score,
      scoreDiff,
      priority,
    });
  });

  // Process all named items and assign priorities
  namedItems.forEach((item) => {
    const itemBroadCategory = getBroadCategory(item.baseItem);
    const itemAttunement = item.attunement || false;
    let sameBroadCategory = itemBroadCategory === userBroadCategory;

    // Special case: implements can also match weapons
    const userCategory = getItemCategory(userItem.baseItem || '');
    if (userCategory === 'implement' && itemBroadCategory === 'weapon') {
      sameBroadCategory = true;
    }

    const sameAttunement = itemAttunement === userAttunement;
    const exactMatch = item.baseItem === userItem.baseItem;

    let priority: number;

    if (sameBroadCategory && sameAttunement && exactMatch) {
      priority = 2; // Same category, same attunement, exact base item match
    } else if (sameBroadCategory && sameAttunement) {
      priority = 3; // Same category, same attunement
    } else if (sameBroadCategory) {
      priority = 4; // Same category, different attunement
    } else if (sameAttunement) {
      priority = 5; // Different category, same attunement
    } else {
      priority = 8; // Different category, different attunement
    }

    const score = getItemScore(item);
    candidates.push({
      item,
      score,
      scoreDiff: Math.abs(score - userScore),
      priority,
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
    const itemScore = calculateCombatScore(item.combat);
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
 */
function compareToAnchor(
  userItem: Partial<MagicItem>,
  anchor: MagicItem,
  scoreDiff: number
): AnchorComparison {
  const details: string[] = [];
  const userCombat = userItem.combat!;
  const anchorCombat = anchor.combat;

  // Enhancement comparison
  const userEnh = userCombat.enhancement || 0;
  const anchorEnh = anchorCombat.enhancement || 0;
  if (userEnh !== anchorEnh) {
    if (userEnh > anchorEnh) {
      details.push(`+${userEnh - anchorEnh} higher enhancement`);
    } else {
      details.push(`+${anchorEnh - userEnh} lower enhancement`);
    }
  }

  // Damage comparison
  const userDmg = userCombat.damageBonus?.dice;
  const anchorDmg = anchorCombat.damageBonus?.dice;
  const userFreq = userCombat.damageBonus?.frequency || 'per-hit';
  const anchorFreq = anchorCombat.damageBonus?.frequency || 'per-hit';

  if (userDmg && !anchorDmg) {
    const freqText = userFreq === 'per-turn' ? ' per turn' : '';
    details.push(`has ${userDmg}${freqText} damage (anchor has none)`);
  } else if (!userDmg && anchorDmg) {
    const freqText = anchorFreq === 'per-turn' ? ' per turn' : '';
    details.push(`no damage bonus (anchor has ${anchorDmg}${freqText})`);
  } else if (userDmg && anchorDmg) {
    const userDmgValue = getDiceValue(userDmg);
    const anchorDmgValue = getDiceValue(anchorDmg);
    const userFreqText = userFreq === 'per-turn' ? ' per turn' : '';
    const anchorFreqText = anchorFreq === 'per-turn' ? ' per turn' : '';

    if (userDmg !== anchorDmg || userFreq !== anchorFreq) {
      details.push(`${userDmg}${userFreqText} vs anchor's ${anchorDmg}${anchorFreqText} damage`);
    }
  }

  // AC bonus comparison
  const userAC = userCombat.acBonus || 0;
  const anchorAC = anchorCombat.acBonus || 0;
  if (userAC !== anchorAC) {
    if (userAC > anchorAC) {
      details.push(`+${userAC - anchorAC} higher AC bonus`);
    } else {
      details.push(`+${anchorAC - userAC} lower AC bonus`);
    }
  }

  // Resistances comparison
  const userResistances = userCombat.resistances?.length || 0;
  const anchorResistances = anchorCombat.resistances?.length || 0;
  if (userResistances !== anchorResistances) {
    if (userResistances > anchorResistances) {
      details.push(`${userResistances} resistances (anchor has ${anchorResistances})`);
    } else {
      details.push(`${userResistances} resistances (anchor has ${anchorResistances})`);
    }
  }

  // Spell charges comparison (legacy format)
  const userCharges = userCombat.charges?.length || 0;
  const anchorCharges = anchorCombat.charges?.length || 0;
  if (userCharges !== anchorCharges) {
    if (userCharges > anchorCharges) {
      details.push(`${userCharges} spell charges (anchor has ${anchorCharges})`);
    } else {
      details.push(`${userCharges} spell charges (anchor has ${anchorCharges})`);
    }
  }

  // Charge pool comparison (new format)
  const userPool = userCombat.chargePool;
  const anchorPool = anchorCombat.chargePool;

  if (userPool && userPool.abilities.length > 0) {
    // Calculate sustainable daily charges (same logic as scoring)
    const userDailyRecharge = userPool.chargesPerLongRest + (userPool.chargesPerShortRest * 2);
    const userDailyCharges = Math.min(
      userDailyRecharge > 0 ? userDailyRecharge : userPool.maxCharges,
      userPool.maxCharges
    );

    // Describe each ability and its contribution
    for (const ability of userPool.abilities) {
      const usesPerDay = Math.floor(userDailyCharges / ability.chargesPerUse);
      const spellLevelText = ability.spellLevel === 0 ? 'cantrip' : `level ${ability.spellLevel}`;

      if (anchorPool && anchorPool.abilities.length > 0) {
        // Compare to anchor's abilities
        details.push(`${ability.spell} (${spellLevelText}, ~${usesPerDay}×/day)`);
      } else {
        // Anchor has no charge pool
        details.push(`has ${ability.spell} (${spellLevelText}, ~${usesPerDay}×/day, anchor has none)`);
      }
    }

    // Add charge pool summary
    if (!anchorPool || anchorPool.abilities.length === 0) {
      if (userDailyRecharge > 0) {
        details.push(`${userPool.maxCharges} max charges, ${userDailyRecharge}/day sustainable (anchor has no charges)`);
      } else {
        details.push(`${userPool.maxCharges} charges total (anchor has no charges)`);
      }
    } else {
      const anchorDailyRecharge = anchorPool.chargesPerLongRest + (anchorPool.chargesPerShortRest * 2);
      const anchorDailyCharges = Math.min(
        anchorDailyRecharge > 0 ? anchorDailyRecharge : anchorPool.maxCharges,
        anchorPool.maxCharges
      );
      if (userDailyCharges !== anchorDailyCharges) {
        details.push(`~${userDailyCharges} sustainable charges/day vs anchor's ~${anchorDailyCharges}`);
      }
    }
  } else if (anchorPool && anchorPool.abilities.length > 0) {
    // User has no charge pool but anchor does
    const anchorDailyRecharge = anchorPool.chargesPerLongRest + (anchorPool.chargesPerShortRest * 2);
    const anchorDailyCharges = Math.min(
      anchorDailyRecharge > 0 ? anchorDailyRecharge : anchorPool.maxCharges,
      anchorPool.maxCharges
    );
    details.push(`no spell abilities (anchor has ~${anchorDailyCharges} sustainable charges/day)`);
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
  const combatScore = item.combat ? calculateCombatScore(item.combat) : 0;
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
  let suggestedRarity = combatRarity;
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
