'use client';

import { useState } from 'react';

interface CertificationEmbedProps {
  itemName: string;
  certUrl: string;
  badgeUrl: string;
  suggestedRarity: string;
}

const RARITY_ACCENT_COLORS: Record<string, string> = {
  'Common': 'text-slate-400 border-slate-500/50 bg-slate-500/10',
  'Uncommon': 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
  'Rare': 'text-sky-400 border-sky-500/50 bg-sky-500/10',
  'Very Rare': 'text-violet-400 border-violet-500/50 bg-violet-500/10',
  'Legendary': 'text-amber-400 border-amber-500/50 bg-amber-500/10',
  'Legendary*': 'text-red-400 border-red-500/50 bg-red-500/10',
};

type ShareTab = 'link' | 'embed' | 'download';

export function CertificationEmbed({
  itemName,
  certUrl,
  badgeUrl,
  suggestedRarity,
}: CertificationEmbedProps) {
  const [activeTab, setActiveTab] = useState<ShareTab>('link');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const accentClasses = RARITY_ACCENT_COLORS[suggestedRarity] || RARITY_ACCENT_COLORS['Common'];

  const htmlEmbed = `<a href="${certUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="${itemName} - Balance Certified ${suggestedRarity}" width="400" /></a>`;
  const markdownEmbed = `[![${itemName} - Balance Certified](${badgeUrl})](${certUrl})`;
  const bbcodeEmbed = `[url=${certUrl}][img]${badgeUrl}[/img][/url]`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out my balanced ${suggestedRarity} magic item: ${itemName}!`);
    const url = encodeURIComponent(certUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-700/80 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-xl">🔗</span>
          Share Your Certification
        </h2>
        <p className="text-sm text-slate-400 mt-1">Show off your balanced magic item</p>
      </div>

      {/* Badge Preview - Always visible */}
      <div className="p-6 border-b border-slate-700/30">
        <div className="bg-slate-950/50 rounded-lg p-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badgeUrl}
            alt={`${itemName} - Balance Certified ${suggestedRarity}`}
            className="max-w-full h-auto rounded-lg shadow-lg border border-slate-700/50"
            width={400}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4 border-b border-slate-700/30 bg-slate-800/20">
        <div className="flex flex-wrap gap-3 justify-center">
          {/* Copy Link - Primary Action */}
          <button
            onClick={() => copyToClipboard(certUrl, 'quick-link')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              copiedField === 'quick-link'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600/90 hover:bg-emerald-500 text-white'
            }`}
          >
            {copiedField === 'quick-link' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Link
              </>
            )}
          </button>

          {/* Share to Twitter/X */}
          <button
            onClick={shareToTwitter}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/80 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-600/50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share
          </button>

          {/* Download Badge */}
          <a
            href={badgeUrl}
            download={`${itemName.toLowerCase().replace(/\s+/g, '-')}-balance-certified.png`}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/80 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-600/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700/30">
        {(['link', 'embed', 'download'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? `${accentClasses} border-b-2`
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            {tab === 'link' && 'Direct Link'}
            {tab === 'embed' && 'Embed Codes'}
            {tab === 'download' && 'Badge Info'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Certification URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={certUrl}
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => copyToClipboard(certUrl, 'link')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all min-w-[80px] ${
                    copiedField === 'link'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  {copiedField === 'link' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Share this link directly in Discord, forums, or anywhere you want to show your certified item.
            </p>
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="space-y-5">
            {/* HTML Embed */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-400">HTML (for websites)</label>
                <button
                  onClick={() => copyToClipboard(htmlEmbed, 'html')}
                  className={`text-xs font-medium transition-colors ${
                    copiedField === 'html' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {copiedField === 'html' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                readOnly
                value={htmlEmbed}
                rows={2}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>

            {/* Markdown Embed */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-400">Markdown (Reddit, GitHub)</label>
                <button
                  onClick={() => copyToClipboard(markdownEmbed, 'markdown')}
                  className={`text-xs font-medium transition-colors ${
                    copiedField === 'markdown' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {copiedField === 'markdown' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={markdownEmbed}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>

            {/* BBCode Embed */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-slate-400">BBCode (forums)</label>
                <button
                  onClick={() => copyToClipboard(bbcodeEmbed, 'bbcode')}
                  className={`text-xs font-medium transition-colors ${
                    copiedField === 'bbcode' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {copiedField === 'bbcode' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={bbcodeEmbed}
                className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          </div>
        )}

        {activeTab === 'download' && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-200 mb-1">Badge Image</h3>
                <p className="text-xs text-slate-500 mb-3">
                  600 x 315px PNG image, optimized for social media sharing. Perfect for Twitter cards, Discord embeds, and forum signatures.
                </p>
                <a
                  href={badgeUrl}
                  download={`${itemName.toLowerCase().replace(/\s+/g, '-')}-balance-certified.png`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Badge PNG
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Badge URL</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={badgeUrl}
                  className="flex-1 bg-slate-950/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono focus:outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => copyToClipboard(badgeUrl, 'badge-url')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    copiedField === 'badge-url'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {copiedField === 'badge-url' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
