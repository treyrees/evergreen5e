import { CombatFeatures, Rarity, MagicItem } from '@/types/magic-item';
import srdItems from '@/data/srd-items.json';

// Dice value mapping
const DICE_VALUES: Record<string, number> = {
  '1d4': 0.5,
  '1d6': 1,
  '1d8': 1.25,
  '1d10': 1.5,
  '2d6': 2,
  '3d6': 3,
  '2d8': 2.5,
  '3d8': 3.75,
  '4d6': 4,
};

// Recharge frequency multipliers
// Note: These are significantly lower than you might expect because many charged items
// have limited total charges that don't fully recharge daily (e.g., wands with 7 charges
// that regain 1d6+1 per dawn). This accounts for average sustainable daily use.
const RECHARGE_MULTIPLIERS: Record<string, number> = {
  'dawn': 0.1,
  'long rest': 0.1,
  'short rest': 0.2,
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
 * Calculate combat power score from combat features
 */
export function calculateCombatScore(combat: CombatFeatures): number {
  let score = 0;

  // Enhancement bonus
  score += combat.enhancement;

  // Damage bonus
  if (combat.damageBonus?.dice) {
    let diceValue = DICE_VALUES[combat.damageBonus.dice] || 0;

    // Frequency multiplier
    // - per-hit (default): 1.0 - applies to every attack
    // - per-turn: 0.5 - only applies once per turn (even with multiple attacks)
    const frequency = combat.damageBonus.frequency || 'per-hit';
    if (frequency === 'per-turn') {
      diceValue *= 0.5;
    }

    // Conditional damage (only works vs specific creatures) is worth 25% of normal value
    if (combat.damageBonus.conditional) {
      diceValue *= 0.25;
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

  // Damage resistances - each resistance is worth 1.5 points
  // (defensive, situational, but very valuable in the right circumstances)
  if (combat.resistances && combat.resistances.length > 0) {
    score += combat.resistances.length * 1.5;
  }

  // Spell charges (legacy format)
  if (combat.charges && combat.charges.length > 0) {
    for (const charge of combat.charges) {
      const multiplier = RECHARGE_MULTIPLIERS[charge.recharge] || 0.5;
      score += charge.spellLevel * charge.usesPerDay * multiplier;
    }
  }

  // Charge pool (new intuitive format)
  if (combat.chargePool && combat.chargePool.abilities.length > 0) {
    // Estimate total charges available per day
    // Assumes 2 short rests per adventuring day (standard assumption)
    const totalChargesPerDay =
      combat.chargePool.maxCharges +
      combat.chargePool.chargesPerLongRest +
      (combat.chargePool.chargesPerShortRest * 2);

    // Calculate score for each ability
    for (const ability of combat.chargePool.abilities) {
      if (ability.chargesPerUse > 0) {
        const effectiveUses = totalChargesPerDay / ability.chargesPerUse;
        // Use a lower multiplier since charges are limited and shared across abilities
        const multiplier = 0.15; // Slightly higher than legacy due to more accurate modeling
        score += ability.spellLevel * effectiveUses * multiplier;
      }
    }
  }

  return score;
}

/**
 * Convert combat score to rarity
 */
export function scoreToRarity(score: number): Rarity {
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
 * Prioritizes named items (Flame Tongue, Sun Blade) over generic +X items
 * Physical similarity: exact match > same category > any item
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

  // Separate named items from generic +X items
  const namedItems = allItems.filter(item => !isGenericItem(item));
  const genericItems = allItems.filter(item => isGenericItem(item));

  let anchor: MagicItem | null = null;

  // Priority 1: Named items with exact base item match
  anchor = findClosestInCandidates(
    namedItems.filter((item) => item.baseItem === userItem.baseItem),
    userScore
  );

  // Priority 2: Named items with same category (e.g., longsword → greatsword)
  if (!anchor && userItem.baseItem) {
    const userCategory = getItemCategory(userItem.baseItem);
    anchor = findClosestInCandidates(
      namedItems.filter((item) => getItemCategory(item.baseItem) === userCategory),
      userScore
    );
  }

  // Priority 3: Any named item
  if (!anchor) {
    anchor = findClosestInCandidates(namedItems, userScore);
  }

  // Priority 4: Generic items with exact base item match (fallback)
  if (!anchor) {
    anchor = findClosestInCandidates(
      genericItems.filter((item) => item.baseItem === userItem.baseItem),
      userScore
    );
  }

  // Priority 5: Generic items with same category (fallback)
  if (!anchor && userItem.baseItem) {
    const userCategory = getItemCategory(userItem.baseItem);
    anchor = findClosestInCandidates(
      genericItems.filter((item) => getItemCategory(item.baseItem) === userCategory),
      userScore
    );
  }

  // Priority 6: Any generic item (last resort)
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

  // Priority 1: Named items with exact base item match
  const priority1 = namedItems.filter((item) => item.baseItem === userItem.baseItem);
  priority1.forEach((item) => {
    const score = calculateCombatScore(item.combat);
    candidates.push({
      item,
      score,
      scoreDiff: Math.abs(score - userScore),
      priority: 1,
    });
  });

  // Priority 2: Named items with same category
  if (userItem.baseItem) {
    const userCategory = getItemCategory(userItem.baseItem);
    const priority2 = namedItems.filter(
      (item) =>
        getItemCategory(item.baseItem) === userCategory &&
        item.baseItem !== userItem.baseItem
    );
    priority2.forEach((item) => {
      const score = calculateCombatScore(item.combat);
      candidates.push({
        item,
        score,
        scoreDiff: Math.abs(score - userScore),
        priority: 2,
      });
    });
  }

  // Priority 3: Any other named item
  const userCategory = userItem.baseItem ? getItemCategory(userItem.baseItem) : 'other';
  const priority3 = namedItems.filter(
    (item) =>
      item.baseItem !== userItem.baseItem &&
      getItemCategory(item.baseItem) !== userCategory
  );
  priority3.forEach((item) => {
    const score = calculateCombatScore(item.combat);
    candidates.push({
      item,
      score,
      scoreDiff: Math.abs(score - userScore),
      priority: 3,
    });
  });

  // Priority 4-6: Generic items (only if we need more)
  const genericCandidates: typeof candidates = [];
  genericItems.forEach((item) => {
    const score = calculateCombatScore(item.combat);
    let priority = 6; // default: any generic
    if (item.baseItem === userItem.baseItem) {
      priority = 4;
    } else if (
      userItem.baseItem &&
      getItemCategory(item.baseItem) === getItemCategory(userItem.baseItem)
    ) {
      priority = 5;
    }
    genericCandidates.push({
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

  genericCandidates.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.scoreDiff - b.scoreDiff;
  });

  // Take top items, preferring named items but falling back to generic if needed
  const topCandidates = candidates.slice(0, count);
  if (topCandidates.length < count) {
    topCandidates.push(...genericCandidates.slice(0, count - topCandidates.length));
  }

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
    const userDmgValue = DICE_VALUES[userDmg] || 0;
    const anchorDmgValue = DICE_VALUES[anchorDmg] || 0;
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
    // Calculate user's daily charge budget
    const userDailyCharges = userPool.maxCharges + userPool.chargesPerLongRest + (userPool.chargesPerShortRest * 2);

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
      details.push(`${userPool.maxCharges} max charges + ${userPool.chargesPerLongRest}/LR (anchor has no charges)`);
    } else {
      const anchorDailyCharges = anchorPool.maxCharges + anchorPool.chargesPerLongRest + (anchorPool.chargesPerShortRest * 2);
      if (userDailyCharges !== anchorDailyCharges) {
        details.push(`~${userDailyCharges} charges/day vs anchor's ~${anchorDailyCharges}`);
      }
    }
  } else if (anchorPool && anchorPool.abilities.length > 0) {
    // User has no charge pool but anchor does
    const anchorDailyCharges = anchorPool.maxCharges + anchorPool.chargesPerLongRest + (anchorPool.chargesPerShortRest * 2);
    details.push(`no spell abilities (anchor has ~${anchorDailyCharges} charges/day)`);
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
  const combatRarity = scoreToRarity(combatScore);
  const ribbonCount = countRibbons(item.ribbons);

  // Get anchor item for reference
  const { anchor, anchorScore, comparison } = findAnchorItem(item);

  // Check if anchor item's stated rarity is significantly off from calculated
  // Only flag items that are 2+ tiers away (e.g., Uncommon item calculated as Very Rare)
  // This accounts for special abilities and ribbons we don't measure in combat score
  let anchorIsUnbalanced = false;
  if (anchor && anchor.rarity) {
    const anchorCalculatedRarity = scoreToRarity(anchorScore);
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
      const anchorCalculatedRarity = scoreToRarity(anchorScore);
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
