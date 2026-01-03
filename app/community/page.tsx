'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Nav } from '@/components/Nav';
import { getGraduatedItems } from '@/lib/actions/community';
import { CommunityItem, ACCENT_COLORS, AccentColor } from '@/types/magic-item';
import { capitalizeRarity, getRarityColorClass, getRarityBgClass } from '@/lib/calculator-ui-utils';
import { getItemEmoji } from '@/lib/item-balance-flags';

// Get accent color hex value
function getAccentColorHex(color: AccentColor): string {
  return ACCENT_COLORS[color] || ACCENT_COLORS.silver;
}

export default function CommunityPage() {
  const [items, setItems] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      setError(null);

      const result = await getGraduatedItems();

      if (!result.success) {
        setError(result.error);
      } else {
        setItems(result.data);
      }

      setLoading(false);
    }

    loadItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex items-center justify-center mt-32">
          <div className="text-slate-400">Loading the Evergreen Collection...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex flex-col items-center justify-center gap-4 mt-32">
          <div className="text-red-400">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-3 mb-2">
            <span className="text-emerald-400">🌲</span>
            The Evergreen Collection
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Community-created magic items that earned 10+ endorsements.
            These are the best homebrew items, as voted by the community.
          </p>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2">
              The Collection is Growing
            </h2>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              No items have graduated yet. Items need 10 endorsements from
              community votes to join the Evergreen Collection.
            </p>
            <Link
              href="/calculator"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Create an Item
            </Link>
          </div>
        )}

        {/* Items grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => {
              const accentHex = getAccentColorHex(item.creatorAccentColor);
              const itemEmoji = getItemEmoji(item.baseItem);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition-colors ${getRarityBgClass(item.suggestedRarity)}`}
                >
                  {/* Card header with endorsement badge */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{itemEmoji}</span>
                        <div className="min-w-0">
                          <h3 className="text-slate-100 font-semibold truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
                            <span className="capitalize">{item.baseItem}</span>
                            {item.attunement && (
                              <span className="text-[10px] px-1 py-0.5 bg-violet-900/50 text-violet-300 rounded">
                                A
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Endorsement count */}
                      <div className="flex items-center gap-1 bg-emerald-900/40 text-emerald-400 px-2 py-1 rounded text-sm flex-shrink-0">
                        <span>👑</span>
                        <span className="font-semibold">{item.upvotes}</span>
                      </div>
                    </div>

                    {/* Score and rarity */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="font-mono text-slate-300">
                        {item.score.toFixed(1)} pts
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className={`font-medium ${getRarityColorClass(item.suggestedRarity)}`}>
                        {capitalizeRarity(item.suggestedRarity)}
                      </span>
                    </div>

                    {/* Combat features preview */}
                    <div className="text-sm text-slate-400 space-y-1 min-h-[48px]">
                      {item.combat.enhancement > 0 && (
                        <div>+{item.combat.enhancement} enhancement</div>
                      )}
                      {item.combat.damageBonus && (
                        <div>
                          {item.combat.damageBonus.dice} {item.combat.damageBonus.type}
                        </div>
                      )}
                      {item.combat.acBonus && item.combat.acBonus > 0 && (
                        <div>+{item.combat.acBonus} AC</div>
                      )}
                      {item.combat.savingThrowBonus && item.combat.savingThrowBonus > 0 && (
                        <div>+{item.combat.savingThrowBonus} saves</div>
                      )}
                      {item.combat.chargePool && item.combat.chargePool.abilities.length > 0 && (
                        <div>
                          {item.combat.chargePool.abilities.length} spell
                          {item.combat.chargePool.abilities.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {item.combat.resistances && item.combat.resistances.length > 0 && (
                        <div>
                          Resist: {item.combat.resistances.slice(0, 2).join(', ')}
                          {item.combat.resistances.length > 2 && '...'}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-slate-500 italic truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Creator footer */}
                  <div
                    className="px-4 py-2.5 flex items-center gap-2 border-t"
                    style={{
                      borderColor: `${accentHex}40`,
                      background: `linear-gradient(to right, ${accentHex}10, transparent)`,
                    }}
                  >
                    <span className="text-lg">{item.creatorEmoji}</span>
                    <Link
                      href={`/profile/${encodeURIComponent(item.creatorDisplayName)}`}
                      className="text-sm text-slate-400 hover:text-slate-200 truncate transition-colors"
                    >
                      {item.creatorDisplayName}
                    </Link>
                    <div
                      className="ml-auto w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: accentHex }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Stats footer */}
        {items.length > 0 && (
          <div className="mt-8 text-center text-slate-500 text-sm">
            {items.length} item{items.length !== 1 ? 's' : ''} in the Evergreen Collection
          </div>
        )}
      </div>
    </div>
  );
}
