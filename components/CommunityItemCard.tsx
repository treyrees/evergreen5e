'use client';

import { ReactNode } from 'react';
import { CommunityItem, ACCENT_COLORS, AccentColor } from '@/types/magic-item';

// Get rarity color class
function getRarityColorClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'text-slate-400';
  if (r === 'uncommon') return 'text-emerald-400/80';
  if (r === 'rare') return 'text-sky-400/80';
  if (r === 'very rare') return 'text-violet-400/80';
  if (r === 'legendary') return 'text-amber-400/80';
  return 'text-slate-400';
}

// Get rarity background class
function getRarityBgClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'bg-slate-700/30';
  if (r === 'uncommon') return 'bg-emerald-950/20';
  if (r === 'rare') return 'bg-sky-950/20';
  if (r === 'very rare') return 'bg-violet-950/20';
  if (r === 'legendary') return 'bg-amber-950/20';
  return 'bg-slate-700/30';
}

// Capitalize rarity
function capitalizeRarity(rarity: string): string {
  return rarity.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Get accent color hex value
function getAccentColorHex(color: AccentColor): string {
  return ACCENT_COLORS[color] || ACCENT_COLORS.silver;
}

export interface CommunityItemCardProps {
  item: CommunityItem;
  /** Whether to show the full card or a compact version */
  compact?: boolean;
  /** Click handler for voting or navigation */
  onClick?: () => void;
  /** Optional action buttons (vote up, pass, etc.) */
  actions?: ReactNode;
}

/**
 * Card component for displaying community-submitted items.
 * Features creator badge with emoji and accent color.
 */
export function CommunityItemCard({
  item,
  compact = false,
  onClick,
  actions,
}: CommunityItemCardProps) {
  const accentHex = getAccentColorHex(item.creatorAccentColor);

  // Build effects list from item data
  const effects: string[] = [];
  if (item.combat.enhancement > 0) {
    effects.push(`+${item.combat.enhancement} enhancement`);
  }
  if (item.combat.damageBonus) {
    let dmgText = `${item.combat.damageBonus.dice} ${item.combat.damageBonus.type}`;
    if (item.combat.damageBonus.conditionalType) dmgText += ` (${item.combat.damageBonus.conditionalType})`;
    effects.push(dmgText);
  }
  if (item.combat.acBonus) {
    effects.push(`+${item.combat.acBonus} AC`);
  }
  if (item.combat.savingThrowBonus) {
    effects.push(`+${item.combat.savingThrowBonus} saves`);
  }
  if (item.combat.flight) {
    const duration = item.combat.flight.flyDuration === 'unlimited' ? '∞' : `${item.combat.flight.flyDuration}h`;
    effects.push(`Flight ${item.combat.flight.flySpeed || 30}ft ${duration}`);
  }
  if (item.combat.resistances && item.combat.resistances.length > 0) {
    effects.push(`Resist: ${item.combat.resistances.join(', ')}`);
  }
  if (item.combat.chargePool && item.combat.chargePool.abilities.length > 0) {
    effects.push(`${item.combat.chargePool.abilities.length} spell${item.combat.chargePool.abilities.length > 1 ? 's' : ''}`);
  }

  if (compact) {
    return (
      <div
        className={`rounded-lg overflow-hidden border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer ${getRarityBgClass(item.suggestedRarity)}`}
        onClick={onClick}
      >
        <div className="p-3">
          {/* Header with name and creator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-200 font-semibold text-sm truncate">{item.name}</span>
            {item.attunement && (
              <span className="text-[10px] px-1 py-0.5 bg-violet-900/50 text-violet-300 rounded">A</span>
            )}
          </div>

          {/* Score and rarity */}
          <div className="text-xs mb-2">
            <span className="font-mono text-slate-300">{item.score.toFixed(1)} pts</span>
            <span className="mx-1 text-slate-600">•</span>
            <span className={`font-medium ${getRarityColorClass(item.suggestedRarity)}`}>
              {capitalizeRarity(item.suggestedRarity)}
            </span>
          </div>

          {/* Creator badge */}
          <div
            className="flex items-center gap-1.5 text-[11px] pt-2 border-t border-slate-700/50"
            style={{ borderColor: `${accentHex}40` }}
          >
            <span>{item.creatorEmoji}</span>
            <span className="text-slate-400 truncate">by {item.creatorDisplayName}</span>
            <div
              className="ml-auto w-2 h-2 rounded-full"
              style={{ backgroundColor: accentHex }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full card view
  return (
    <div className={`rounded-lg overflow-hidden border border-slate-600 ${getRarityBgClass(item.suggestedRarity)}`}>
      {/* Main content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-100 font-semibold text-base truncate">{item.name}</h3>
          <div className="flex items-center gap-2">
            {item.attunement && (
              <span className="text-[10px] px-1.5 py-0.5 bg-violet-900/50 text-violet-300 rounded">
                Attunement
              </span>
            )}
            <span className="text-sm text-slate-400">{item.upvotes} votes</span>
          </div>
        </div>

        {/* Base item and score */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <span className="text-slate-400 capitalize">{item.baseItem}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-300">{item.score.toFixed(1)} pts</span>
          <span className="text-slate-600">•</span>
          <span className={`font-medium ${getRarityColorClass(item.suggestedRarity)}`}>
            {capitalizeRarity(item.suggestedRarity)}
          </span>
        </div>

        {/* Effects list */}
        {effects.length > 0 && (
          <div className="text-sm text-slate-400 space-y-1 mb-3">
            {effects.map((effect, idx) => (
              <div key={idx}>• {effect}</div>
            ))}
          </div>
        )}

        {/* Special mechanics (description) */}
        {item.description && (
          <div className="text-sm text-slate-300 bg-slate-800/50 rounded p-3 mb-3">
            {item.description}
          </div>
        )}

        {/* Cosmetic features (ribbons) */}
        {item.ribbons?.cosmetic && item.ribbons.cosmetic.length > 0 && (
          <div className="text-sm text-slate-500 italic space-y-1 mb-3">
            {item.ribbons.cosmetic.map((feature, idx) => (
              <div key={idx}>{feature}</div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="pt-3 border-t border-slate-700">
            {actions}
          </div>
        )}
      </div>

      {/* Creator footer with accent color */}
      <div
        className="px-4 py-2.5 flex items-center gap-2 border-t"
        style={{
          borderColor: `${accentHex}40`,
          background: `linear-gradient(to right, ${accentHex}10, transparent)`,
        }}
      >
        <span className="text-lg">{item.creatorEmoji}</span>
        <span className="text-sm text-slate-300">by {item.creatorDisplayName}</span>
        <div
          className="ml-auto w-3 h-3 rounded-full"
          style={{ backgroundColor: accentHex }}
        />
      </div>
    </div>
  );
}

/**
 * Compact reference card for community items in "What's Similar?" section.
 * Matches the style of SRD reference items but with creator badge.
 */
export interface CommunityReferenceCardProps {
  item: CommunityItem;
  /** Your item's score for comparison */
  yourScore: number;
}

export function CommunityReferenceCard({ item, yourScore }: CommunityReferenceCardProps) {
  const accentHex = getAccentColorHex(item.creatorAccentColor);
  const scoreDiff = yourScore - item.score;

  // Build effects list
  const effects: string[] = [];
  if (item.combat.enhancement > 0) {
    effects.push(`+${item.combat.enhancement} enhancement`);
  }
  if (item.combat.damageBonus) {
    effects.push(`${item.combat.damageBonus.dice} ${item.combat.damageBonus.type}`);
  }
  if (item.combat.acBonus) {
    effects.push(`+${item.combat.acBonus} AC`);
  }
  if (item.combat.savingThrowBonus) {
    effects.push(`+${item.combat.savingThrowBonus} saves`);
  }
  if (item.combat.chargePool && item.combat.chargePool.abilities.length > 0) {
    effects.push(`${item.combat.chargePool.abilities.length} spell${item.combat.chargePool.abilities.length > 1 ? 's' : ''}`);
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-slate-600 ${getRarityBgClass(item.suggestedRarity)}`}>
      <div className="p-3">
        {/* Name and attunement */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-200 font-semibold text-sm truncate">{item.name}</span>
          <div className="flex items-center gap-1">
            {item.attunement && (
              <span className="text-[10px] px-1 py-0.5 bg-violet-900/50 text-violet-300 rounded">A</span>
            )}
          </div>
        </div>

        {/* Score and rarity */}
        <div className="text-xs mb-2">
          <span className="font-mono text-slate-300">{item.score.toFixed(1)} pts</span>
          <span className="mx-1 text-slate-600">•</span>
          <span className={`font-medium ${getRarityColorClass(item.suggestedRarity)}`}>
            {capitalizeRarity(item.suggestedRarity)}
          </span>
        </div>

        {/* Effects */}
        <div className="text-[11px] text-slate-400 space-y-0.5">
          {effects.map((effect, idx) => (
            <div key={idx}>{effect}</div>
          ))}
        </div>
      </div>

      {/* Creator footer */}
      <div
        className="px-3 py-1.5 flex items-center gap-1.5 text-[11px] border-t"
        style={{
          borderColor: `${accentHex}40`,
          background: `linear-gradient(to right, ${accentHex}08, transparent)`,
        }}
      >
        <span>{item.creatorEmoji}</span>
        <span className="text-slate-400 truncate">by {item.creatorDisplayName}</span>
        <div
          className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: accentHex }}
        />
      </div>

      {/* Score difference footer */}
      <div className="bg-slate-900/50 px-3 py-1.5 border-t border-slate-700 text-xs">
        {Math.abs(scoreDiff) < 0.3 ? (
          <span className="text-slate-400">≈ Similar power</span>
        ) : scoreDiff > 0 ? (
          <span className="text-amber-400/90">+{scoreDiff.toFixed(1)} pts stronger</span>
        ) : (
          <span className="text-sky-400/90">{scoreDiff.toFixed(1)} pts weaker</span>
        )}
      </div>
    </div>
  );
}
