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
const RECHARGE_MULTIPLIERS: Record<string, number> = {
  'dawn': 0.5,
  'long rest': 0.5,
  'short rest': 1.0,
};

/**
 * Calculate combat power score from combat features
 */
export function calculateCombatScore(combat: CombatFeatures): number {
  let score = 0;

  // Enhancement bonus
  score += combat.enhancement;

  // Damage bonus
  if (combat.damageBonus?.dice) {
    const diceValue = DICE_VALUES[combat.damageBonus.dice] || 0;
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

  // Spell charges
  if (combat.charges && combat.charges.length > 0) {
    for (const charge of combat.charges) {
      const multiplier = RECHARGE_MULTIPLIERS[charge.recharge] || 0.5;
      score += charge.spellLevel * charge.usesPerDay * multiplier;
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
 * Comparison result between user item and anchor
 */
export interface AnchorComparison {
  type: 'stronger' | 'weaker' | 'equal';
  scoreDifference: number;
  details: string[];
}

/**
 * Find anchor item - the baseline SRD item for balancing reference
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

  // Filter by base item if specified
  let candidates = srdItems as MagicItem[];
  if (userItem.baseItem) {
    const matchingBase = candidates.filter(
      (item) => item.baseItem === userItem.baseItem
    );
    // Only use matching base if we found any
    if (matchingBase.length > 0) {
      candidates = matchingBase;
    }
  }

  // Find closest by score
  let anchor: MagicItem | null = null;
  let smallestDiff = Infinity;

  for (const item of candidates) {
    const itemScore = calculateCombatScore(item.combat);
    const diff = Math.abs(itemScore - userScore);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      anchor = item;
    }
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
  if (userDmg && !anchorDmg) {
    details.push(`has ${userDmg} damage (anchor has none)`);
  } else if (!userDmg && anchorDmg) {
    details.push(`no damage bonus (anchor has ${anchorDmg})`);
  } else if (userDmg && anchorDmg && userDmg !== anchorDmg) {
    const userDmgValue = DICE_VALUES[userDmg] || 0;
    const anchorDmgValue = DICE_VALUES[anchorDmg] || 0;
    if (userDmgValue > anchorDmgValue) {
      details.push(`${userDmg} vs anchor's ${anchorDmg} damage`);
    } else {
      details.push(`${userDmg} vs anchor's ${anchorDmg} damage`);
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

  // Spell charges comparison
  const userCharges = userCombat.charges?.length || 0;
  const anchorCharges = anchorCombat.charges?.length || 0;
  if (userCharges !== anchorCharges) {
    if (userCharges > anchorCharges) {
      details.push(`${userCharges} spell charges (anchor has ${anchorCharges})`);
    } else {
      details.push(`${userCharges} spell charges (anchor has ${anchorCharges})`);
    }
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
} {
  const combatScore = item.combat ? calculateCombatScore(item.combat) : 0;
  const combatRarity = scoreToRarity(combatScore);
  const ribbonCount = countRibbons(item.ribbons);

  // Get anchor item for reference
  const { anchor, anchorScore, comparison } = findAnchorItem(item);

  // For now, ribbons don't affect rarity (as we're not implementing them yet)
  // But we'll return the structure for future use
  let suggestedRarity = combatRarity;
  let explanation = `Based on ${combatScore.toFixed(1)} combat points, this item is ${combatRarity}.`;

  if (anchor && comparison) {
    if (comparison.type === 'equal') {
      explanation += ` This matches the power level of ${anchor.name} (${anchor.rarity}).`;
    } else if (comparison.type === 'stronger') {
      explanation += ` This is ${comparison.scoreDifference.toFixed(1)} points stronger than ${anchor.name} (${anchor.rarity}).`;
    } else {
      explanation += ` This is ${Math.abs(comparison.scoreDifference).toFixed(1)} points weaker than ${anchor.name} (${anchor.rarity}).`;
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
  };
}
