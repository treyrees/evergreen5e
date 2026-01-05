'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCertification, CreateCertificationInput } from '@/lib/actions/certifications';
import { useAuth } from '@/components/auth';
import type { Rarity } from '@/types/magic-item';

// Local storage key for tracking free certification usage
const FREE_CERT_KEY = 'evergreen5e_free_cert_used';

interface CertifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemData: Omit<CreateCertificationInput, 'itemName' | 'creatorName' | 'flavorText' | 'itemAttributes'>;
  itemAttributes?: Array<{ label: string; value: string }>;
  defaultItemName?: string;
  defaultFlavorText?: string;
}

export function CertifyModal({
  isOpen,
  onClose,
  itemData,
  itemAttributes,
  defaultItemName = '',
  defaultFlavorText = '',
}: CertifyModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [itemName, setItemName] = useState(defaultItemName);
  const [creatorName, setCreatorName] = useState('');
  const [flavorText, setFlavorText] = useState(defaultFlavorText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUsedFreeCert, setHasUsedFreeCert] = useState(false);

  // Check if user has used their free certification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasUsedFreeCert(localStorage.getItem(FREE_CERT_KEY) === 'true');
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setItemName(defaultItemName);
      setCreatorName('');
      setFlavorText(defaultFlavorText);
      setError(null);
    }
  }, [isOpen, defaultItemName, defaultFlavorText]);

  const canCertify = user || !hasUsedFreeCert;
  const isLoggedIn = !!user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemName.trim()) {
      setError('Item name is required');
      return;
    }

    if (!canCertify) {
      setError('Sign in to create more certifications');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCertification(
        {
          ...itemData,
          itemName: itemName.trim(),
          creatorName: creatorName.trim() || null,
          flavorText: flavorText.trim() || null,
          itemAttributes: itemAttributes,
        },
        isLoggedIn // Link to user if logged in
      );

      if (result.success) {
        // Mark free certification as used if not logged in
        if (!isLoggedIn) {
          localStorage.setItem(FREE_CERT_KEY, 'true');
        }
        // Redirect to certification page
        router.push(`/certified/${result.data.id}`);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const rarityColors: Record<Rarity, string> = {
    'Common': 'text-slate-400',
    'Uncommon': 'text-emerald-400',
    'Rare': 'text-sky-400',
    'Very Rare': 'text-violet-400',
    'Legendary': 'text-amber-400',
    'Legendary*': 'text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 rounded-lg border border-slate-700 shadow-2xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Certify Your Item</h2>
            <p className="text-sm text-slate-400 mt-1">
              Get a shareable badge proving your item is balanced
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item Summary */}
        <div className="bg-slate-900/50 rounded-lg p-3 mb-6 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Rarity</span>
            <span className={`font-semibold ${rarityColors[itemData.suggestedRarity]}`}>
              {itemData.suggestedRarity}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-slate-400">Balance Score</span>
            <span className="text-slate-200 font-mono">{itemData.score.toFixed(2)} pts</span>
          </div>
        </div>

        {/* Free certification notice */}
        {!isLoggedIn && (
          <div className={`rounded-lg p-3 mb-6 text-sm ${hasUsedFreeCert ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-emerald-900/30 border border-emerald-700/50'}`}>
            {hasUsedFreeCert ? (
              <p className="text-amber-300">
                <strong>Sign in</strong> to create more certifications. Your free certification has been used.
              </p>
            ) : (
              <p className="text-emerald-300">
                <strong>First certification is free!</strong> Sign in later to create more and manage them.
              </p>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Item Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Flametongue Greatsword"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={100}
              required
              disabled={!canCertify}
            />
          </div>

          {/* Creator Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Creator Name <span className="text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Your name or handle"
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength={50}
              disabled={!canCertify}
            />
          </div>

          {/* Flavor Text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Flavor Text <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              value={flavorText}
              onChange={(e) => setFlavorText(e.target.value)}
              placeholder="The blade glows faintly when orcs are near..."
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={2}
              maxLength={280}
              disabled={!canCertify}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-slate-500">Shown on your certificate</span>
              <span className="text-xs text-slate-600">{flavorText.length}/280</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canCertify}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              {isSubmitting ? 'Certifying...' : 'Certify Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
