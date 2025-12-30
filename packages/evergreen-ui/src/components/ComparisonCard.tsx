'use client';

import { ReactNode, useState } from 'react';
import { getMedalBorderClass, getRarityBgClass } from '../utils/rarity';
import { AttunementBadge } from './Badge';

/** Default score display when AnimatedNumber is not provided */
function DefaultScoreDisplay({ value }: { value: number }) {
  return <span>{value.toFixed(1)}</span>;
}

export interface ComparisonItemData {
  /** Item name */
  name: string;
  /** Combat score in points */
  score: number;
  /** Rarity tier */
  rarity: string;
  /** Requires attunement */
  attunement?: boolean;
  /** Item details to display */
  details: ReactNode;
  /** Optional link URL */
  href?: string;
}

export interface ComparisonCardProps {
  /** Your item (left side) */
  yourItem: ComparisonItemData;
  /** Reference item (right side) */
  referenceItem: ComparisonItemData;
  /** Medal ranking (0 = gold, 1 = silver, 2 = bronze) */
  rank: number;
  /** Warning/info content for the reference item */
  warningContent?: ReactNode;
  /** Score difference summary text */
  differenceText?: ReactNode;
  /** Get color class for rarity */
  getRarityColorClass: (rarity: string) => string;
  /** Format rarity for display */
  capitalizeRarity: (rarity: string) => string;
  /** Animated number component for scores */
  AnimatedNumber?: React.ComponentType<{ value: number }>;
}

/**
 * Side-by-side comparison card for your item vs a reference item.
 * Used in the "What's Similar?" section.
 */
export function ComparisonCard({
  yourItem,
  referenceItem,
  rank,
  warningContent,
  differenceText,
  getRarityColorClass,
  capitalizeRarity,
  AnimatedNumber,
}: ComparisonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const scoreDiff = yourItem.score - referenceItem.score;

  const ScoreDisplay = AnimatedNumber || DefaultScoreDisplay;

  return (
    <div
      className={`rounded-lg overflow-hidden border-2 ${getMedalBorderClass(rank)}`}
    >
      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-2">
        {/* LEFT: Your Item */}
        <div
          className={`${getRarityBgClass(yourItem.rarity)} p-3 border-r border-slate-700`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-200 font-semibold text-sm truncate">
              {yourItem.name}
            </span>
            {yourItem.attunement && <AttunementBadge />}
          </div>
          <div className="text-xs mb-2">
            <span className="font-mono text-slate-300">
              <ScoreDisplay value={yourItem.score} /> pts
            </span>
            <span className="mx-1 text-slate-600">•</span>
            <span className={`font-medium ${getRarityColorClass(yourItem.rarity)}`}>
              {capitalizeRarity(yourItem.rarity)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            {yourItem.details}
          </div>
        </div>

        {/* RIGHT: Reference Item */}
        <div className={`${getRarityBgClass(referenceItem.rarity)} p-3`}>
          <div className="flex items-center justify-between mb-2">
            {referenceItem.href ? (
              <a
                href={referenceItem.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 font-semibold text-sm truncate hover:underline hover:text-slate-100 transition-colors"
                title="View on D&D Beyond"
              >
                {referenceItem.name}
              </a>
            ) : (
              <span className="text-slate-200 font-semibold text-sm truncate">
                {referenceItem.name}
              </span>
            )}
            <div className="flex items-center gap-1">
              {warningContent && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title="View notes"
                  className="text-[10px] px-1 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                >
                  ℹ
                </button>
              )}
              {referenceItem.attunement && <AttunementBadge />}
            </div>
          </div>
          <div className="text-xs mb-2">
            <span className="font-mono text-slate-300">
              {referenceItem.score.toFixed(1)} pts
            </span>
            <span className="mx-1 text-slate-600">•</span>
            <span className={`font-medium ${getRarityColorClass(referenceItem.rarity)}`}>
              {capitalizeRarity(referenceItem.rarity)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-0.5">
            {referenceItem.details}
          </div>
        </div>
      </div>

      {/* Expanded Info Panel */}
      {isExpanded && warningContent && (
        <div className="bg-slate-800 px-3 py-2 border-t border-slate-700">
          <div className="text-[11px] text-slate-400">{warningContent}</div>
        </div>
      )}

      {/* Difference Summary */}
      <div className="bg-slate-900/50 px-3 py-2 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="text-xs">
            {Math.abs(scoreDiff) < 0.3 ? (
              <span className="text-slate-400">≈ Similar power</span>
            ) : scoreDiff > 0 ? (
              <span className="text-amber-400/90">
                +{scoreDiff.toFixed(1)} pts stronger
              </span>
            ) : (
              <span className="text-sky-400/90">
                {scoreDiff.toFixed(1)} pts weaker
              </span>
            )}
          </div>
          {differenceText && (
            <div className="text-[10px] text-slate-500 truncate max-w-[60%] text-right">
              {differenceText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
