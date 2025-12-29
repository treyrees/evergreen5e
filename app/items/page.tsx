'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import srdItems from '@/data/srd-items.json';
import { MagicItem } from '@/types/magic-item';
import { getItemScore, scoreToRarity } from '@/lib/calculator';
import { getWarningIndicator } from '@/lib/item-balance-flags';

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'bookRarity' | 'calcRarity' | 'points'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Calculate rarity from score (using shared function with hasCombatFeatures bump)

  // Format effects list
  const getEffectsList = (item: MagicItem): string[] => {
    const effects: string[] = [];

    if (item.combat.enhancement > 0) {
      effects.push(`+${item.combat.enhancement} enhancement`);
    }
    if (item.combat.damageBonus) {
      let dmgText = `${item.combat.damageBonus.dice} ${item.combat.damageBonus.type}`;
      if (item.combat.damageBonus.conditional) dmgText += ' (conditional)';
      if (item.combat.damageBonus.vicious) dmgText += ' (vicious)';
      if (item.combat.damageBonus.frequency === 'per-turn') dmgText += ' (per-turn)';
      effects.push(dmgText);
    }
    if (item.combat.acBonus) {
      effects.push(`+${item.combat.acBonus} AC`);
    }
    if (item.combat.savingThrowBonus) {
      effects.push(`+${item.combat.savingThrowBonus} saves`);
    }
    if (item.combat.abilityScoreSetter) {
      effects.push(`${item.combat.abilityScoreSetter.ability} → ${item.combat.abilityScoreSetter.setValue}`);
    }
    if (item.combat.abilityScoreBonus) {
      effects.push(`+${item.combat.abilityScoreBonus.bonus} ${item.combat.abilityScoreBonus.ability}`);
    }
    if (item.combat.flight) {
      effects.push(item.combat.flight.duration === 'unlimited'
        ? 'Flight (unlimited)'
        : `Flight (${item.combat.flight.hoursPerDay} hrs/day)`);
    }
    if (item.combat.resistances && item.combat.resistances.length > 0) {
      effects.push(`Resist: ${item.combat.resistances.join(', ')}`);
    }
    if (item.combat.charges && item.combat.charges.length > 0) {
      item.combat.charges.forEach(charge => {
        effects.push(`${charge.spell} (${charge.usesPerDay}/day)`);
      });
    }

    // New SRD 5.2.1 mechanics
    if (item.combat.advantage && item.combat.advantage.length > 0) {
      effects.push(`Advantage: ${item.combat.advantage.join(', ')}`);
    }
    if (item.combat.reactionAC) {
      const uses = item.combat.reactionAC.usesPerShortRest
        ? `${item.combat.reactionAC.usesPerShortRest}/SR`
        : item.combat.reactionAC.unlimited
        ? 'unlimited'
        : '';
      effects.push(`+${item.combat.reactionAC.bonus} AC (reaction${uses ? ', ' + uses : ''})`);
    }
    if (item.combat.bonusActionDamage) {
      const flat = item.combat.bonusActionDamage.flatBonus ? `+${item.combat.bonusActionDamage.flatBonus}` : '';
      effects.push(`Bash: ${item.combat.bonusActionDamage.dice}${flat} ${item.combat.bonusActionDamage.type}`);
    }
    if (item.combat.conditionInfliction) {
      effects.push(`${item.combat.conditionInfliction.condition} (DC ${item.combat.conditionInfliction.dc} ${item.combat.conditionInfliction.save})`);
    }
    if (item.combat.damageTypeOverride) {
      effects.push(`Damage type: ${item.combat.damageTypeOverride}`);
    }
    if (item.combat.handsFreeDef) {
      effects.push('Hands-free defense');
    }

    return effects;
  };

  // Get discrepancy category
  const getDiscrepancyCategory = (itemName: string): string => {
    const warnings = getWarningIndicator(itemName);
    if (warnings.hasNumerical) return 'Numerical Edge Case';
    if (warnings.hasSpecial) return 'Special Mechanics';
    if (warnings.hasCommunity) return 'Community Note';
    return '';
  };

  // Process items with scores
  const itemsWithScores = useMemo(() => {
    return srdItems.map(item => {
      const magicItem = item as MagicItem;
      const score = getItemScore(magicItem);
      const calculatedRarity = scoreToRarity(score, score > 0);
      const effects = getEffectsList(magicItem);
      const discrepancyCategory = getDiscrepancyCategory(item.name);
      return {
        ...item,
        score,
        calculatedRarity,
        effects,
        discrepancyCategory,
      };
    });
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = itemsWithScores;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.effects.some(effect => effect.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.rarity?.toLowerCase() === rarityFilter.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'bookRarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
          const aIdx = rarityOrder.indexOf(a.rarity?.toLowerCase() || '');
          const bIdx = rarityOrder.indexOf(b.rarity?.toLowerCase() || '');
          compareValue = aIdx - bIdx;
          break;
        case 'calcRarity':
          const calcRarityOrder = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
          const aCalcIdx = calcRarityOrder.indexOf(a.calculatedRarity.toLowerCase());
          const bCalcIdx = calcRarityOrder.indexOf(b.calculatedRarity.toLowerCase());
          compareValue = aCalcIdx - bCalcIdx;
          break;
        case 'points':
          compareValue = a.score - b.score;
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [itemsWithScores, searchTerm, rarityFilter, sortBy, sortDirection]);

  // Get rarity color (matches calculator palette)
  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-slate-400';
      case 'uncommon': return 'text-emerald-400/80';
      case 'rare': return 'text-sky-400/80';
      case 'very rare': return 'text-violet-400/80';
      case 'legendary': return 'text-amber-400/80';
      default: return 'text-slate-300';
    }
  };

  // Check if rarities match
  const raritiesMatch = (bookRarity: string, calcRarity: string): boolean => {
    return bookRarity.toLowerCase() === calcRarity.toLowerCase();
  };

  const handleSort = (column: 'name' | 'bookRarity' | 'calcRarity' | 'points') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - Minimal (matches calculator) */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">
            Magic Items Database
          </h1>
          <div className="flex gap-4 text-sm">
            <Link href="/calculator" className="text-slate-500 hover:text-slate-300 transition-colors">
              Calculator
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
              Home
            </Link>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          Browse all {srdItems.length} SRD magic items with calculated power levels
        </p>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wide">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items or effects..."
                className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Rarity Filter */}
            <div className="w-48">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wide">Rarity</label>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="very rare">Very Rare</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-end pb-2">
              <div className="text-sm text-slate-500">
                {filteredAndSortedItems.length} of {srdItems.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/70 border-b border-slate-700">
                <tr>
                  <th
                    className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortBy === 'name' && (
                        <span className="text-emerald-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort('bookRarity')}
                  >
                    <div className="flex items-center gap-1">
                      Book Rarity
                      {sortBy === 'bookRarity' && (
                        <span className="text-emerald-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort('calcRarity')}
                  >
                    <div className="flex items-center gap-1">
                      Calculated Rarity
                      {sortBy === 'calcRarity' && (
                        <span className="text-emerald-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                    Quantifiable Effects
                  </th>
                  <th className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedItems.map((item, index) => {
                  const match = raritiesMatch(item.rarity || '', item.calculatedRarity);
                  const warnings = getWarningIndicator(item.name);
                  const isExpanded = expandedRows.has(index);

                  return (
                    <tr
                      key={index}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    >
                      {/* Name */}
                      <td className="p-3">
                        <div className="font-medium text-slate-100">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.baseItem}</div>
                        {item.attunement && (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-violet-900/50 text-violet-300 rounded">Attunement</span>
                        )}
                      </td>

                      {/* Book Rarity */}
                      <td className="p-3">
                        <div className={`font-medium ${getRarityColor(item.rarity || '')}`}>
                          {item.rarity?.toUpperCase()}
                        </div>
                      </td>

                      {/* Calculated Rarity + Points */}
                      <td className="p-3">
                        <div className={`font-medium ${getRarityColor(item.calculatedRarity)}`}>
                          {item.calculatedRarity.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {item.score.toFixed(1)} pts
                        </div>
                        {!match && (
                          <div className="text-[10px] text-amber-500/80 mt-0.5">
                            ≠ Book rarity
                          </div>
                        )}
                      </td>

                      {/* Effects */}
                      <td className="p-3">
                        {item.effects.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.effects.map((effect, idx) => (
                              <div key={idx} className="text-slate-300 text-xs">
                                • {effect}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-500 italic text-xs">
                            No quantifiable effects
                          </div>
                        )}
                      </td>

                      {/* Notes (formerly Discrepancy Category) */}
                      <td className="p-3">
                        {item.discrepancyCategory ? (
                          <div className="text-xs">
                            <button
                              onClick={() => toggleRowExpansion(index)}
                              className="text-left hover:bg-slate-700/30 rounded px-2 py-1 -mx-2 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-[10px]">
                                  {isExpanded ? '▼' : '▶'}
                                </span>
                                {item.discrepancyCategory === 'Numerical Edge Case' && (
                                  <span className="inline-flex items-center gap-1 text-sky-400/80">
                                    🔢 Edge Case
                                  </span>
                                )}
                                {item.discrepancyCategory === 'Special Mechanics' && (
                                  <span className="inline-flex items-center gap-1 text-amber-400/80">
                                    ⭐ Special
                                  </span>
                                )}
                                {item.discrepancyCategory === 'Community Note' && (
                                  <span className="inline-flex items-center gap-1 text-slate-400">
                                    💬 Note
                                  </span>
                                )}
                              </div>
                            </button>
                            {isExpanded && warnings.explanation && (
                              <div className="mt-2 pl-5 pr-2 text-slate-400 text-[11px] border-l-2 border-slate-600">
                                {warnings.explanation}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-600 text-xs">—</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
