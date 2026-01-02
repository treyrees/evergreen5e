'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Nav } from '@/components/Nav';
import { getGraduatedItems } from '@/lib/actions/community';
import { CommunityItem, ACCENT_COLORS, AccentColor } from '@/types/magic-item';
import { capitalizeRarity, getRarityColorClass } from '@/lib/calculator-ui-utils';

export default function CommunityPage() {
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rarity' | 'score' | 'endorsements' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function loadItems() {
      const result = await getGraduatedItems();
      if (result.success) {
        setItems(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    loadItems();
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.baseItem.toLowerCase().includes(term) ||
        item.creatorDisplayName.toLowerCase().includes(term)
      );
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.suggestedRarity.toLowerCase() === rarityFilter.toLowerCase()
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
          const aIdx = rarityOrder.indexOf(a.suggestedRarity.toLowerCase());
          const bIdx = rarityOrder.indexOf(b.suggestedRarity.toLowerCase());
          compareValue = aIdx - bIdx;
          break;
        case 'score':
          compareValue = a.score - b.score;
          break;
        case 'endorsements':
          compareValue = a.upvotes - b.upvotes;
          break;
        case 'date':
          compareValue = new Date(a.graduatedAt || a.createdAt).getTime() - new Date(b.graduatedAt || b.createdAt).getTime();
          break;
      }

      return sortDirection === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [items, searchTerm, rarityFilter, sortBy, sortDirection]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection(column === 'date' || column === 'endorsements' ? 'desc' : 'asc');
    }
  };

  const getAccentColorStyle = (color: AccentColor) => {
    return { backgroundColor: ACCENT_COLORS[color] };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex items-center justify-center mt-32">
          <div className="text-slate-400">Loading community items...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="text-red-400 mb-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span className="text-amber-400">👑</span>
            Community Items
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {items.length === 0
              ? 'Items endorsed by the community will appear here'
              : `${items.length} items endorsed by the community`
            }
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-12 border border-slate-700 text-center">
            <div className="text-5xl mb-4">🗳️</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">No Items Yet</h2>
            <p className="text-slate-400 max-w-md mx-auto">
              When community members vote for items and they reach 10 endorsements, they appear here.
            </p>
          </div>
        ) : (
          <>
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
                    placeholder="Search items, base items, or creators..."
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
                    {filteredAndSortedItems.length} of {items.length} items
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
                      <th className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                        Base Item
                      </th>
                      <th
                        className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors"
                        onClick={() => handleSort('rarity')}
                      >
                        <div className="flex items-center gap-1">
                          Rarity
                          {sortBy === 'rarity' && (
                            <span className="text-emerald-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors"
                        onClick={() => handleSort('score')}
                      >
                        <div className="flex items-center gap-1">
                          Score
                          {sortBy === 'score' && (
                            <span className="text-emerald-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                      <th className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide">
                        Creator
                      </th>
                      <th
                        className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors"
                        onClick={() => handleSort('endorsements')}
                      >
                        <div className="flex items-center gap-1">
                          Endorsements
                          {sortBy === 'endorsements' && (
                            <span className="text-emerald-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                      <th
                        className="text-left p-3 text-slate-400 font-semibold text-xs uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-1">
                          Graduated
                          {sortBy === 'date' && (
                            <span className="text-emerald-400">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                      >
                        {/* Name */}
                        <td className="p-3">
                          <div className="font-medium text-slate-100">{item.name}</div>
                          {item.attunement && (
                            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-violet-900/50 text-violet-300 rounded">Attunement</span>
                          )}
                        </td>

                        {/* Base Item */}
                        <td className="p-3 text-slate-400">
                          {item.baseItem}
                        </td>

                        {/* Rarity */}
                        <td className="p-3">
                          <span className={`font-medium ${getRarityColorClass(item.suggestedRarity)}`}>
                            {capitalizeRarity(item.suggestedRarity)}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="p-3">
                          <span className="text-slate-300 font-mono text-xs">
                            {item.score.toFixed(1)} pts
                          </span>
                        </td>

                        {/* Creator */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                              style={getAccentColorStyle(item.creatorAccentColor)}
                            >
                              {item.creatorEmoji}
                            </div>
                            <span className="text-slate-300 text-sm">{item.creatorDisplayName}</span>
                          </div>
                        </td>

                        {/* Endorsements */}
                        <td className="p-3">
                          <span className="text-amber-400 font-medium">
                            👑 {item.upvotes}
                          </span>
                        </td>

                        {/* Graduated Date */}
                        <td className="p-3 text-slate-500 text-xs">
                          {item.graduatedAt ? formatDate(item.graduatedAt) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
