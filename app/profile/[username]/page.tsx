'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/auth';
import { getProfileByDisplayName, ProfileWithItems } from '@/lib/actions/profile';
import { publishItem } from '@/lib/actions/community';
import { ACCENT_COLORS, AccentColor } from '@/types/magic-item';
import { capitalizeRarity, getRarityColorClass, getRarityBgClass } from '@/lib/calculator-ui-utils';

// Get accent color hex value
function getAccentColorHex(color: AccentColor): string {
  return ACCENT_COLORS[color] || ACCENT_COLORS.silver;
}

// Endorsement threshold for graduating to the Collection
const ENDORSEMENT_THRESHOLD = 10;

export default function ProfilePage() {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  const { user } = useAuth();

  const [profileData, setProfileData] = useState<ProfileWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishingItemId, setPublishingItemId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const isOwnProfile = user && profileData?.profile.id === user.id;

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);

      const result = await getProfileByDisplayName(username);

      if (!result.success) {
        setError(result.error);
      } else if (!result.data) {
        setError('Profile not found');
      } else {
        setProfileData(result.data);
      }

      setLoading(false);
    }

    loadProfile();
  }, [username]);

  const handlePublish = async (savedItemId: string) => {
    if (!profileData || profileData.profile.tickets < 1) {
      setPublishError('No tickets available. Vote on items to earn tickets!');
      return;
    }

    setPublishingItemId(savedItemId);
    setPublishError(null);

    const result = await publishItem({ savedItemId });

    if (!result.success) {
      setPublishError(result.error);
    } else {
      // Refresh profile data
      const refreshResult = await getProfileByDisplayName(username);
      if (refreshResult.success && refreshResult.data) {
        setProfileData(refreshResult.data);
      }
    }

    setPublishingItemId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-slate-400">{error || 'Profile not found'}</div>
        <Link href="/" className="text-emerald-400 hover:text-emerald-300">
          Go home
        </Link>
      </div>
    );
  }

  const { profile, savedItems, publishedItems, graduatedCount } = profileData;
  const accentHex = getAccentColorHex(profile.accentColor);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header nav */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-4 text-sm">
            <Link href="/calculator" className="text-slate-500 hover:text-slate-300 transition-colors">
              Calculator
            </Link>
            <Link href="/vote" className="text-slate-500 hover:text-slate-300 transition-colors">
              Vote
            </Link>
          </div>
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
            Home
          </Link>
        </div>

        {/* Profile Header */}
        <div
          className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700"
          style={{ borderColor: `${accentHex}40` }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar with emoji */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${accentHex}30`, borderColor: accentHex, borderWidth: 2 }}
            >
              {profile.emoji}
            </div>

            {/* Name and stats */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                {profile.displayName}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: accentHex }}
                />
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="text-slate-400">
                  <span className="text-emerald-400 font-semibold">{graduatedCount}</span>
                  {' '}item{graduatedCount !== 1 ? 's' : ''} in the Evergreen Collection
                </span>
                {isOwnProfile && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">
                      <span className="text-amber-400 font-semibold">{profile.tickets}</span>
                      {' '}ticket{profile.tickets !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Items (only visible to owner) */}
        {isOwnProfile && savedItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-slate-500">📦</span>
              My Saved Items
              <span className="text-sm font-normal text-slate-500">({savedItems.length})</span>
            </h2>

            {publishError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {publishError}
              </div>
            )}

            <div className="space-y-3">
              {savedItems.map((item) => {
                // Check if already published
                const isPublished = publishedItems.some(
                  (pi) => pi.name === item.name && pi.baseItem === item.baseItem
                );

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-800 rounded-lg p-4 border border-slate-700 ${getRarityBgClass(item.suggestedRarity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-200">{item.name}</div>
                        <div className="text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{item.baseItem}</span>
                          <span className="text-slate-600">•</span>
                          <span className="font-mono">{item.score.toFixed(1)} pts</span>
                          <span className="text-slate-600">•</span>
                          <span className={getRarityColorClass(item.suggestedRarity)}>
                            {capitalizeRarity(item.suggestedRarity)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {isPublished ? (
                          <span className="text-sm text-slate-500 italic">Published</span>
                        ) : (
                          <button
                            onClick={() => handlePublish(item.id)}
                            disabled={publishingItemId === item.id || profile.tickets < 1}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              profile.tickets < 1
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            {publishingItemId === item.id ? (
                              'Publishing...'
                            ) : (
                              <>Publish <span className="text-emerald-300/70">(1 ticket)</span></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Published Items */}
        {publishedItems.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-slate-500">🏆</span>
              Published Items
              <span className="text-sm font-normal text-slate-500">({publishedItems.length})</span>
            </h2>

            <div className="space-y-3">
              <AnimatePresence>
                {publishedItems.map((item) => {
                  const isGraduated = item.status === 'graduated';
                  const progressPercent = Math.min(100, (item.upvotes / ENDORSEMENT_THRESHOLD) * 100);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-slate-800 rounded-lg p-4 border ${
                        isGraduated ? 'border-emerald-600/50' : 'border-slate-700'
                      } ${getRarityBgClass(item.suggestedRarity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-slate-200 flex items-center gap-2">
                            {item.name}
                            {isGraduated && (
                              <span className="text-xs px-1.5 py-0.5 bg-emerald-900/50 text-emerald-400 rounded">
                                In Collection
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="capitalize">{item.baseItem}</span>
                            <span className="text-slate-600">•</span>
                            <span className="font-mono">{item.score.toFixed(1)} pts</span>
                            <span className="text-slate-600">•</span>
                            <span className={getRarityColorClass(item.suggestedRarity)}>
                              {capitalizeRarity(item.suggestedRarity)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-semibold text-slate-200">
                            {item.upvotes}
                            <span className="text-sm font-normal text-slate-500">/{ENDORSEMENT_THRESHOLD}</span>
                          </div>
                          <div className="text-xs text-slate-500">endorsements</div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {!isGraduated && (
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      )}

                      {/* Description if present */}
                      {item.description && (
                        <div className="mt-3 text-sm text-slate-400 bg-slate-900/30 rounded p-2">
                          {item.description}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty state */}
        {publishedItems.length === 0 && (!isOwnProfile || savedItems.length === 0) && (
          <div className="text-center py-12 text-slate-500">
            {isOwnProfile ? (
              <>
                <div className="text-lg mb-2">No items yet</div>
                <Link href="/calculator" className="text-emerald-400 hover:text-emerald-300">
                  Create your first magic item →
                </Link>
              </>
            ) : (
              <div className="text-lg">No published items yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
