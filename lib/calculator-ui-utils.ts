/**
 * UI utility functions for the calculator page.
 * Pure functions with no external dependencies.
 */

/**
 * Capitalize rarity for display (e.g., "very rare" → "Very Rare")
 */
export function capitalizeRarity(rarity: string): string {
  return rarity.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Get rarity color class based on rarity tier (case-insensitive)
 */
export function getRarityColorClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'text-slate-400';
  if (r === 'uncommon') return 'text-emerald-400/80';
  if (r === 'rare') return 'text-sky-400/80';
  if (r === 'very rare') return 'text-violet-400/80';
  if (r === 'legendary') return 'text-amber-400/80';
  return 'text-slate-400';
}

/**
 * Get muted rarity background class for comparison cards
 */
export function getRarityBgClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'bg-slate-700/30';
  if (r === 'uncommon') return 'bg-emerald-950/20';
  if (r === 'rare') return 'bg-sky-950/20';
  if (r === 'very rare') return 'bg-violet-950/20';
  if (r === 'legendary') return 'bg-amber-950/20';
  return 'bg-slate-700/30';
}

/**
 * Get medal border class (gold/silver/bronze) for comparison ranking
 */
export function getMedalBorderClass(index: number): string {
  if (index === 0) return 'border-amber-500/60'; // Gold
  if (index === 1) return 'border-slate-400/60'; // Silver
  return 'border-amber-700/50'; // Bronze
}

/**
 * Get bright background color for scale indicator pips
 * Full brightness colors matching the rarity text colors
 */
export function getRarityScalePipClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'bg-slate-400';
  if (r === 'uncommon') return 'bg-emerald-400';
  if (r === 'rare') return 'bg-sky-400';
  if (r === 'very rare') return 'bg-violet-400';
  if (r === 'legendary') return 'bg-amber-400';
  return 'bg-slate-400';
}

/**
 * Rarity tier definitions for the scale indicator
 */
const RARITY_TIERS = [
  { name: 'Common', floor: 0, ceiling: 1 },
  { name: 'Uncommon', floor: 1, ceiling: 2 },
  { name: 'Rare', floor: 2, ceiling: 3 },
  { name: 'Very Rare', floor: 3, ceiling: 4 },
  { name: 'Legendary', floor: 4, ceiling: 5 },
] as const;

/**
 * Get the rarity scale position data for the indicator
 * Returns the position (0-9) within the current tier and adjacent rarity names
 */
export function getRarityScaleData(score: number): {
  position: number; // 0-9 representing x.0 to x.9
  currentRarity: string;
  prevRarity: string | null;
  nextRarity: string | null;
  isNearBoundary: boolean; // true if position >= 7 or <= 2
} {
  // Clamp score to minimum of 0
  const clampedScore = Math.max(0, score);

  // Find current tier
  const tierIndex = RARITY_TIERS.findIndex(
    (tier, i) => clampedScore >= tier.floor && (clampedScore < tier.ceiling || i === RARITY_TIERS.length - 1)
  );

  const tier = RARITY_TIERS[tierIndex] || RARITY_TIERS[0];
  const prevTier = tierIndex > 0 ? RARITY_TIERS[tierIndex - 1] : null;
  const nextTier = tierIndex < RARITY_TIERS.length - 1 ? RARITY_TIERS[tierIndex + 1] : null;

  // Calculate position within tier (0-9)
  // For Legendary (unbounded), cap at position 9 for scores >= 5
  let position: number;
  if (tier.name === 'Legendary') {
    position = Math.min(9, Math.floor((clampedScore - tier.floor) * 10));
  } else {
    position = Math.min(9, Math.floor((clampedScore - tier.floor) * 10));
  }

  // Clamp position to 0-9
  position = Math.max(0, Math.min(9, position));

  return {
    position,
    currentRarity: tier.name,
    prevRarity: prevTier?.name || null,
    nextRarity: nextTier?.name || null,
    isNearBoundary: position >= 7 || position <= 2,
  };
}
