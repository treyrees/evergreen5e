'use client';

import { useState } from 'react';

interface CertificationEmbedProps {
  itemName: string;
  certUrl: string;
  badgeUrl: string;
  suggestedRarity: string;
}

export function CertificationEmbed({
  itemName,
  certUrl,
  badgeUrl,
  suggestedRarity,
}: CertificationEmbedProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const htmlEmbed = `<a href="${certUrl}" target="_blank"><img src="${badgeUrl}" alt="${itemName} - Balance Certified ${suggestedRarity}" width="400" /></a>`;
  const markdownEmbed = `[![${itemName} - Balance Certified](${badgeUrl})](${certUrl})`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-slate-200">Share Your Certification</h2>

      {/* Badge Preview */}
      <div className="space-y-3">
        <p className="text-sm text-slate-400">Badge Preview</p>
        <div className="bg-slate-900/50 rounded-lg p-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={badgeUrl}
            alt={`${itemName} - Balance Certified ${suggestedRarity}`}
            className="max-w-full h-auto rounded shadow-lg"
            width={400}
          />
        </div>
      </div>

      {/* Direct Link */}
      <div className="space-y-2">
        <p className="text-sm text-slate-400">Direct Link</p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={certUrl}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 font-mono"
          />
          <button
            onClick={() => copyToClipboard(certUrl, 'link')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded transition-colors min-w-[70px]"
          >
            {copiedField === 'link' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* HTML Embed */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-400">HTML Embed</p>
          <button
            onClick={() => copyToClipboard(htmlEmbed, 'html')}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {copiedField === 'html' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <textarea
          readOnly
          value={htmlEmbed}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 font-mono resize-none"
        />
      </div>

      {/* Markdown Embed */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-400">Markdown Embed</p>
          <button
            onClick={() => copyToClipboard(markdownEmbed, 'markdown')}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {copiedField === 'markdown' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <input
          type="text"
          readOnly
          value={markdownEmbed}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 font-mono"
        />
      </div>

      {/* Download Badge Button */}
      <a
        href={badgeUrl}
        download={`${itemName.toLowerCase().replace(/\s+/g, '-')}-balance-certified.png`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Badge
      </a>
    </div>
  );
}
