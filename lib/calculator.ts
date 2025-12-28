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
 * Find the closest matching SRD item based on combat score
 */
export function findClosestMatch(
  userItem: Partial<MagicItem>
): MagicItem | null {
  if (!userItem.combat) return null;

  const userScore = calculateCombatScore(userItem.combat);

  // Filter by base item if specified
  let candidates = srdItems as MagicItem[];
  if (userItem.baseItem) {
    candidates = candidates.filter(
      (item) => item.baseItem === userItem.baseItem
    );
  }

  if (candidates.length === 0) {
    // Fall back to all items if no matching base item
    candidates = srdItems as MagicItem[];
  }

  // Find closest by score
  let closestItem: MagicItem | null = null;
  let smallestDiff = Infinity;

  for (const item of candidates) {
    const itemScore = calculateCombatScore(item.combat);
    const diff = Math.abs(itemScore - userScore);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestItem = item;
    }
  }

  return closestItem;
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
 * Get suggested rarity with ribbons consideration
 */
export function getSuggestedRarity(item: Partial<MagicItem>): {
  combatRarity: Rarity;
  combatScore: number;
  ribbonCount: number;
  suggestedRarity: Rarity;
  explanation: string;
} {
  const combatScore = item.combat ? calculateCombatScore(item.combat) : 0;
  const combatRarity = scoreToRarity(combatScore);
  const ribbonCount = countRibbons(item.ribbons);

  // For now, ribbons don't affect rarity (as we're not implementing them yet)
  // But we'll return the structure for future use
  let suggestedRarity = combatRarity;
  let explanation = `Based on ${combatScore.toFixed(1)} combat points, this item is ${combatRarity}.`;

  if (ribbonCount > 0) {
    explanation += ` It also has ${ribbonCount} ribbon feature(s), which may increase rarity by 0-1 tier depending on their utility.`;
  }

  return {
    combatScore,
    combatRarity,
    ribbonCount,
    suggestedRarity,
    explanation,
  };
}
