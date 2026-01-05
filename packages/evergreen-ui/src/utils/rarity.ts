/**
 * Rarity-related utility functions for TTRPG balance calculators.
 * These work across different game systems (5e, Draw Steel, etc.)
 */

export type Rarity = 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary' | 'legendary*';

/**
 * Capitalize rarity for display (e.g., "very rare" → "Very Rare")
 */
export function capitalizeRarity(rarity: string): string {
  return rarity
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get Tailwind text color class based on rarity tier (case-insensitive)
 * Legendary* uses red to indicate the item exceeds SRD reference items
 */
export function getRarityColorClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'text-slate-400';
  if (r === 'uncommon') return 'text-emerald-400/80';
  if (r === 'rare') return 'text-sky-400/80';
  if (r === 'very rare') return 'text-violet-400/80';
  if (r === 'legendary*') return 'text-red-400/80';
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
  if (r === 'legendary*') return 'bg-red-950/20';
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
