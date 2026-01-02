'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, SignInModal } from '@/components/auth';
import { Nav } from '@/components/Nav';
import { getItemsToVote, castVote } from '@/lib/actions/community';
import { CommunityItem, ACCENT_COLORS, AccentColor } from '@/types/magic-item';
import { capitalizeRarity, getRarityColorClass, getRarityBgClass } from '@/lib/calculator-ui-utils';

// Get accent color hex value
function getAccentColorHex(color: AccentColor): string {
  return ACCENT_COLORS[color] || ACCENT_COLORS.silver;
}

// Crown icon SVG component
function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L9 9L1 7L5 15L3 23H21L19 15L23 7L15 9L12 1Z" />
    </svg>
  );
}

export default function VotePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const [items, setItems] = useState<CommunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [earnedTicket, setEarnedTicket] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const loadItems = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    setSelectedWinner(null);
    setShowResults(false);
    setEarnedTicket(false);

    const result = await getItemsToVote(3);

    if (!result.success) {
      setError(result.error);
    } else {
      setItems(result.data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user, loadItems]);

  const handleCrown = async (winnerId: string) => {
    if (voting || !items.length) return;

    setVoting(true);
    setSelectedWinner(winnerId);

    // Vote up for winner, pass for others
    const votePromises = items.map((item) =>
      castVote(item.id, item.id === winnerId ? 'up' : 'pass')
    );

    try {
      const results = await Promise.all(votePromises);

      // Check if any result earned a ticket
      const ticketEarned = results.some((r) => r.success && r.data?.earnedTicket);
      setEarnedTicket(ticketEarned);
      setShowResults(true);

      // Refresh profile to update ticket count
      await refreshProfile();

      // Wait a moment then load new items
      setTimeout(() => {
        loadItems();
      }, 2000);
    } catch (err) {
      console.error('Error voting:', err);
      setError('Failed to cast votes');
    }

    setVoting(false);
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">👑</div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">Crown the Best Items</h1>
            <p className="text-slate-400 mb-6">
              Vote on community-submitted magic items. Pick your favorite from each matchup to help the best items rise to the Evergreen Collection.
            </p>
            <button
              onClick={() => setShowSignInModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Sign in to Vote
            </button>
          </div>

          <SignInModal
            isOpen={showSignInModal}
            onClose={() => setShowSignInModal(false)}
            redirectTo="/vote"
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex items-center justify-center mt-32">
          <div className="text-slate-400">Loading items...</div>
        </div>
      </div>
    );
  }

  // No items to vote on
  if (!items.length && !error) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-slate-100 mb-2">All Caught Up!</h1>
            <p className="text-slate-400 mb-6">
              You&apos;ve voted on all available items. Check back later for more submissions, or publish your own items to get votes!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/calculator"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create an Item
              </Link>
              <button
                onClick={loadItems}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="text-center">
            <div className="text-red-400 mb-4">{error}</div>
            <button
              onClick={loadItems}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
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
            Crown the Best
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pick your favorite item. Every 15 votes earns a ticket!
          </p>
        </div>

        {/* Vote progress indicator */}
        {profile && (
          <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">Progress to next ticket</span>
              <span className="text-slate-300">
                {profile.totalVotes % 15}/15 votes
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${((profile.totalVotes % 15) / 15) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Earned ticket notification */}
        <AnimatePresence>
          {earnedTicket && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-amber-900/30 border border-amber-600/50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl mb-1">🎫</div>
              <div className="text-amber-300 font-semibold">You earned a ticket!</div>
              <div className="text-amber-400/70 text-sm">15 votes cast. Keep going!</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence mode="wait">
            {items.map((item, index) => {
              const accentHex = getAccentColorHex(item.creatorAccentColor);
              const isWinner = selectedWinner === item.id;
              const isLoser = selectedWinner && selectedWinner !== item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isLoser && showResults ? 0.5 : 1,
                    y: 0,
                    scale: isWinner && showResults ? 1.02 : 1,
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-slate-800 rounded-lg overflow-hidden border-2 transition-all ${
                    isWinner && showResults
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-slate-700 hover:border-slate-600'
                  } ${getRarityBgClass(item.suggestedRarity)}`}
                >
                  {/* Winner crown overlay */}
                  {isWinner && showResults && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      <div className="bg-amber-500 rounded-full p-2 shadow-lg">
                        <CrownIcon className="w-5 h-5 text-white" />
                      </div>
                    </motion.div>
                  )}

                  {/* Card content */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-slate-100 font-semibold text-lg truncate">{item.name}</h3>
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

                    {/* Score and rarity */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="font-mono text-slate-300">{item.score.toFixed(1)} pts</span>
                      <span className="text-slate-600">|</span>
                      <span className={`font-medium ${getRarityColorClass(item.suggestedRarity)}`}>
                        {capitalizeRarity(item.suggestedRarity)}
                      </span>
                    </div>

                    {/* Effects preview */}
                    <div className="text-sm text-slate-400 space-y-1 mb-4 min-h-[60px]">
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
                      {item.description && (
                        <div className="text-slate-500 italic truncate">{item.description}</div>
                      )}
                    </div>

                    {/* Crown button */}
                    <button
                      onClick={() => handleCrown(item.id)}
                      disabled={voting || showResults}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        voting || showResults
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-500 text-white hover:scale-[1.02]'
                      }`}
                    >
                      <CrownIcon className="w-5 h-5" />
                      {voting ? 'Voting...' : showResults ? (isWinner ? 'Crowned!' : 'Passed') : 'Crown This'}
                    </button>
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
                    <span className="text-sm text-slate-400 truncate">by {item.creatorDisplayName}</span>
                    <div
                      className="ml-auto w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: accentHex }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Skip button */}
        {!showResults && items.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadItems}
              disabled={voting}
              className="text-slate-500 hover:text-slate-400 text-sm transition-colors"
            >
              Skip these items →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
