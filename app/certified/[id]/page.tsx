import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCertification } from '@/lib/actions/certifications';
import { Nav } from '@/components/Nav';
import { CertificationEmbed } from '@/components/CertificationEmbed';
import { getRarityColorClass } from '@/lib/calculator-ui-utils';

// Rarity border colors for the certificate
const RARITY_BORDER_COLORS: Record<string, string> = {
  'Common': 'border-slate-500',
  'Uncommon': 'border-emerald-500',
  'Rare': 'border-sky-500',
  'Very Rare': 'border-violet-500',
  'Legendary': 'border-amber-500',
};

const RARITY_GLOW_COLORS: Record<string, string> = {
  'Common': 'shadow-slate-500/20',
  'Uncommon': 'shadow-emerald-500/30',
  'Rare': 'shadow-sky-500/30',
  'Very Rare': 'shadow-violet-500/40',
  'Legendary': 'shadow-amber-500/50',
};

const RARITY_ACCENT_COLORS: Record<string, string> = {
  'Common': 'text-slate-400',
  'Uncommon': 'text-emerald-400',
  'Rare': 'text-sky-400',
  'Very Rare': 'text-violet-400',
  'Legendary': 'text-amber-400',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCertification(id);

  if (!result.success || !result.data) {
    return {
      title: 'Certification Not Found',
    };
  }

  const cert = result.data;
  return {
    title: `${cert.itemName} - Evergreen Certified`,
    description: `${cert.itemName} is a ${cert.suggestedRarity} magic item, formulaically balanced by Evergreen5e. Score: ${cert.score.toFixed(2)} pts.`,
    openGraph: {
      title: `${cert.itemName} - Evergreen Certified ${cert.suggestedRarity}`,
      description: `A formulaically balanced ${cert.suggestedRarity} magic item.`,
      images: [`/api/certified/${id}/badge`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cert.itemName} - Evergreen Certified`,
      description: `A formulaically balanced ${cert.suggestedRarity} magic item.`,
      images: [`/api/certified/${id}/badge`],
    },
  };
}

export default async function CertifiedPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getCertification(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const cert = result.data;
  const borderColor = RARITY_BORDER_COLORS[cert.suggestedRarity] || 'border-slate-500';
  const glowColor = RARITY_GLOW_COLORS[cert.suggestedRarity] || 'shadow-slate-500/20';
  const accentColor = RARITY_ACCENT_COLORS[cert.suggestedRarity] || 'text-slate-400';
  const rarityTextColor = getRarityColorClass(cert.suggestedRarity);

  const certDate = new Date(cert.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evergreen5e.vercel.app';
  const certUrl = `${siteUrl}/certified/${id}`;
  const badgeUrl = `${siteUrl}/api/certified/${id}/badge`;

  return (
    <>
      <Nav />
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Certificate Card */}
          <div
            className={`relative bg-gradient-to-b from-amber-950/40 via-stone-900/60 to-stone-950/80 rounded-lg border-2 ${borderColor} shadow-2xl ${glowColor} overflow-hidden`}
          >
            {/* Parchment texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz48L3N2Zz4=')]" />

            {/* Corner ornaments */}
            <div className={`absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 ${borderColor} opacity-60 rounded-tl-sm`} />
            <div className={`absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 ${borderColor} opacity-60 rounded-tr-sm`} />
            <div className={`absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 ${borderColor} opacity-60 rounded-bl-sm`} />
            <div className={`absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 ${borderColor} opacity-60 rounded-br-sm`} />

            <div className="relative p-8 md:p-10 space-y-6">
              {/* Header with seal */}
              <div className="text-center space-y-4">
                {/* Evergreen seal */}
                <div className="inline-flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-full border-2 ${borderColor} bg-stone-900/80 flex items-center justify-center`}>
                    <span className="text-2xl">🌿</span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <p className={`text-xs uppercase tracking-[0.3em] ${accentColor} font-medium mb-2`}>
                    Certificate of Balance
                  </p>
                  <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-amber-100/90 leading-tight">
                    {cert.itemName}
                  </h1>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent`} />
                <span className={`${accentColor} text-sm`}>✦</span>
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent`} />
              </div>

              {/* Rarity & Score */}
              <div className="text-center space-y-3">
                <div className={`inline-block px-6 py-2 rounded-full border ${borderColor} bg-stone-900/50`}>
                  <span className={`font-cinzel text-xl font-semibold ${rarityTextColor}`}>
                    {cert.suggestedRarity}
                  </span>
                </div>
                <p className="text-stone-400 text-sm">
                  Balance Score: <span className="text-stone-200 font-medium">{cert.score.toFixed(2)} pts</span>
                </p>
              </div>

              {/* Item Details */}
              <div className="bg-stone-900/40 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Base Item</span>
                  <span className="text-stone-300 capitalize">{cert.baseItem}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Attunement</span>
                  <span className="text-stone-300">{cert.attunement ? 'Required' : 'Not Required'}</span>
                </div>
                {cert.creatorName && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Created by</span>
                    <span className="text-stone-300">{cert.creatorName}</span>
                  </div>
                )}
              </div>

              {/* Certification stamp */}
              <div className="text-center pt-4 space-y-2">
                <p className={`text-lg font-cinzel font-semibold ${accentColor}`}>
                  Formulaically Balanced
                </p>
                <p className="text-xs text-stone-500">
                  Certified on {certDate}
                </p>
                <p className="text-xs text-stone-600 font-mono">
                  ID: {id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* Badge Preview & Embed Codes */}
          <CertificationEmbed
            itemName={cert.itemName}
            certUrl={certUrl}
            badgeUrl={badgeUrl}
            suggestedRarity={cert.suggestedRarity}
          />

          {/* Back to Calculator */}
          <div className="text-center">
            <Link
              href="/calculator"
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← Back to Calculator
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
