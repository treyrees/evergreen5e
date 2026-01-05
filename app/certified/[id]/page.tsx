import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCertification } from '@/lib/actions/certifications';
import { Nav } from '@/components/Nav';
import { CertificationEmbed } from '@/components/CertificationEmbed';
import { getRarityColorClass } from '@/lib/calculator-ui-utils';

// Rarity border colors for the certificate
// Legendary* uses red to indicate the item exceeds SRD reference items
const RARITY_BORDER_COLORS: Record<string, string> = {
  'Common': 'border-slate-500',
  'Uncommon': 'border-emerald-500',
  'Rare': 'border-sky-500',
  'Very Rare': 'border-violet-500',
  'Legendary': 'border-amber-500',
  'Legendary*': 'border-red-500',
};

const RARITY_GLOW_COLORS: Record<string, string> = {
  'Common': 'shadow-slate-500/20',
  'Uncommon': 'shadow-emerald-500/40',
  'Rare': 'shadow-sky-500/40',
  'Very Rare': 'shadow-violet-500/50',
  'Legendary': 'shadow-amber-500/60',
  'Legendary*': 'shadow-red-500/60',
};

const RARITY_ACCENT_COLORS: Record<string, string> = {
  'Common': 'text-slate-400',
  'Uncommon': 'text-emerald-400',
  'Rare': 'text-sky-400',
  'Very Rare': 'text-violet-400',
  'Legendary': 'text-amber-400',
  'Legendary*': 'text-red-400',
};

const RARITY_BG_ACCENTS: Record<string, string> = {
  'Common': 'from-slate-900/80 via-slate-950/60 to-stone-950/80',
  'Uncommon': 'from-emerald-950/50 via-stone-950/60 to-stone-950/80',
  'Rare': 'from-sky-950/50 via-stone-950/60 to-stone-950/80',
  'Very Rare': 'from-violet-950/50 via-stone-950/60 to-stone-950/80',
  'Legendary': 'from-amber-950/60 via-stone-900/60 to-stone-950/80',
  'Legendary*': 'from-red-950/50 via-stone-950/60 to-stone-950/80',
};

// Feature icons based on attribute type
const FEATURE_ICONS: Record<string, string> = {
  'Enhancement': '⚔️',
  'Bonus Damage': '💥',
  'Armor Class': '🛡️',
  'Saving Throws': '✨',
  'Spell Save DC': '🎯',
  'Spell Attack': '🔮',
  'Ability Score': '💪',
  'Resistances': '🔰',
  'Damage Immunities': '🚫',
  'Condition Immunities': '🛡️',
  'Flight': '🪽',
  'Senses & Movement': '👁️',
  'Advantage': '🎲',
  '+Proficiency': '📈',
  'Other Skills': '🎭',
  'Weapon Properties': '⚒️',
  'Armor Properties': '🏋️',
  'Spells': '📜',
  'Charges': '⚡',
};

// Damage type colors for visual distinction
const DAMAGE_TYPE_COLORS: Record<string, string> = {
  'fire': 'text-orange-400',
  'cold': 'text-cyan-300',
  'lightning': 'text-yellow-300',
  'thunder': 'text-purple-300',
  'acid': 'text-lime-400',
  'poison': 'text-green-400',
  'necrotic': 'text-gray-400',
  'radiant': 'text-amber-200',
  'force': 'text-indigo-300',
  'psychic': 'text-pink-300',
  'slashing': 'text-stone-300',
  'piercing': 'text-stone-300',
  'bludgeoning': 'text-stone-300',
};

function getFeatureIcon(label: string): string {
  return FEATURE_ICONS[label] || '✦';
}

function highlightDamageTypes(text: string): JSX.Element {
  // Split text and highlight damage types with their colors
  const damageTypePattern = /(fire|cold|lightning|thunder|acid|poison|necrotic|radiant|force|psychic|slashing|piercing|bludgeoning)/gi;
  const parts = text.split(damageTypePattern);

  return (
    <>
      {parts.map((part, i) => {
        const colorClass = DAMAGE_TYPE_COLORS[part.toLowerCase()];
        if (colorClass) {
          return <span key={i} className={`${colorClass} font-medium`}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

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
    title: `${cert.itemName} - Balance Certified`,
    description: `${cert.itemName} is a balanced ${cert.suggestedRarity} magic item. Score: ${cert.score.toFixed(2)} pts.`,
    openGraph: {
      title: `${cert.itemName} - Balance Certified ${cert.suggestedRarity}`,
      description: `A balanced ${cert.suggestedRarity} magic item.`,
      images: [`/api/certified/${id}/badge`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cert.itemName} - Balance Certified`,
      description: `A balanced ${cert.suggestedRarity} magic item.`,
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
  const bgAccent = RARITY_BG_ACCENTS[cert.suggestedRarity] || RARITY_BG_ACCENTS['Common'];
  const rarityTextColor = getRarityColorClass(cert.suggestedRarity);
  const isLegendary = cert.suggestedRarity === 'Legendary' || cert.suggestedRarity === 'Legendary*';
  const isVeryRareOrHigher = ['Very Rare', 'Legendary', 'Legendary*'].includes(cert.suggestedRarity);

  const certDate = new Date(cert.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evergreen5e.vercel.app';
  const certUrl = `${siteUrl}/certified/${id}`;
  const badgeUrl = `${siteUrl}/api/certified/${id}/badge`;

  // Build feature list from itemAttributes or fallback fields
  const features: Array<{ label: string; value: string }> = cert.itemAttributes && cert.itemAttributes.length > 0
    ? cert.itemAttributes
    : [];

  // Fallback for old certifications
  if (features.length === 0) {
    if (cert.enhancementBonus) {
      features.push({ label: 'Enhancement', value: `+${cert.enhancementBonus} bonus to attack and damage rolls` });
    }
    if (cert.acBonus) {
      features.push({ label: 'Armor Class', value: `+${cert.acBonus} bonus to AC` });
    }
    if (cert.savingThrowBonus) {
      features.push({ label: 'Saving Throws', value: `+${cert.savingThrowBonus} bonus to saving throws` });
    }
    if (cert.extraDamageDice) {
      features.push({ label: 'Bonus Damage', value: `${cert.extraDamageDice} ${cert.extraDamageType} damage per hit` });
    }
    if (cert.chargesDescription) {
      features.push({ label: 'Charges', value: cert.chargesDescription });
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Certificate Card */}
          <div
            className={`relative bg-gradient-to-b ${bgAccent} rounded-xl border-2 ${borderColor} shadow-2xl ${glowColor} overflow-hidden certificate-animate-in ${isVeryRareOrHigher ? 'border-glow-animate' : ''}`}
            style={isVeryRareOrHigher ? { '--glow-color': glowColor.replace('shadow-', '').replace('/50', '').replace('/60', '') } as React.CSSProperties : undefined}
          >
            {/* Parchment texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz48L3N2Zz4=')]" />

            {/* Shimmer effect for legendary+ items */}
            {isLegendary && (
              <div className="absolute inset-0 rarity-shimmer pointer-events-none" />
            )}

            {/* Corner ornaments - more prominent */}
            <div className={`absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 ${borderColor} opacity-70 rounded-tl`} />
            <div className={`absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 ${borderColor} opacity-70 rounded-tr`} />
            <div className={`absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 ${borderColor} opacity-70 rounded-bl`} />
            <div className={`absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 ${borderColor} opacity-70 rounded-br`} />

            {/* Additional inner frame for very rare+ */}
            {isVeryRareOrHigher && (
              <>
                <div className={`absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-transparent ${borderColor.replace('border-', 'via-')}/30 to-transparent`} />
                <div className={`absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent ${borderColor.replace('border-', 'via-')}/30 to-transparent`} />
              </>
            )}

            <div className="relative p-8 md:p-12 space-y-8">
              {/* Header with seal */}
              <div className="text-center space-y-5">
                {/* Certified seal */}
                <div className="inline-flex items-center justify-center">
                  <div className={`relative w-20 h-20 rounded-full border-2 ${borderColor} bg-gradient-to-b from-stone-800/90 to-stone-900/95 flex items-center justify-center shadow-lg ${isLegendary ? 'seal-legendary' : ''}`}>
                    <span className="text-3xl">🌿</span>
                    {/* Seal glow for legendary */}
                    {isLegendary && (
                      <div className={`absolute inset-0 rounded-full ${glowColor} blur-md -z-10`} />
                    )}
                  </div>
                </div>

                {/* Certification label */}
                <div>
                  <p className={`text-xs uppercase tracking-[0.35em] ${accentColor} font-semibold mb-3`}>
                    ✦ Balance Certified ✦
                  </p>
                  <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-amber-100/95 leading-tight tracking-wide">
                    {cert.itemName}
                  </h1>
                </div>

                {/* Rarity badge with score */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full border ${borderColor} bg-stone-900/70 backdrop-blur-sm`}>
                    <span className={`font-cinzel text-xl font-bold ${rarityTextColor} tracking-wide`}>
                      {cert.suggestedRarity}
                    </span>
                    <span className="text-stone-600">|</span>
                    <span className="text-stone-300 font-medium">{cert.score.toFixed(2)} pts</span>
                  </div>
                </div>
              </div>

              {/* Ornate divider */}
              <div className="flex items-center gap-3 px-4">
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-stone-600/50 to-transparent`} />
                <span className={`${accentColor} text-lg`}>◆</span>
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-stone-600/50 to-transparent`} />
              </div>

              {/* Item Features - Stat Block Style */}
              {features.length > 0 && (
                <div className="bg-stone-950/50 rounded-lg border border-stone-800/80 overflow-hidden">
                  {/* Stat block header */}
                  <div className={`px-4 py-2 bg-gradient-to-r ${borderColor.replace('border-', 'from-')}/20 to-transparent border-b border-stone-800/50`}>
                    <h2 className="text-xs uppercase tracking-[0.2em] text-stone-400 font-semibold">
                      Item Properties
                    </h2>
                  </div>

                  {/* Features list */}
                  <div className="p-4 space-y-3">
                    {features.map((attr, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 group feature-animate opacity-0"
                        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                      >
                        <span className="text-lg flex-shrink-0 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {getFeatureIcon(attr.label)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`font-semibold ${accentColor}`}>{attr.label}.</span>{' '}
                          <span className="text-stone-300 leading-relaxed">
                            {highlightDamageTypes(attr.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-stone-900/40 rounded-lg px-4 py-3 border border-stone-800/50">
                  <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Base Item</p>
                  <p className="text-stone-200 capitalize font-medium">{cert.baseItem}</p>
                </div>
                <div className="bg-stone-900/40 rounded-lg px-4 py-3 border border-stone-800/50">
                  <p className="text-stone-500 text-xs uppercase tracking-wider mb-1">Attunement</p>
                  <p className="text-stone-200 font-medium">
                    {cert.attunement ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-violet-400">◈</span> Required
                      </span>
                    ) : (
                      'Not Required'
                    )}
                  </p>
                </div>
              </div>

              {/* Flavor Text */}
              {cert.flavorText && (
                <div className="text-center px-6 py-4 bg-stone-900/30 rounded-lg border border-stone-800/30">
                  <p className="text-stone-400 italic text-sm leading-relaxed">
                    &ldquo;{cert.flavorText}&rdquo;
                  </p>
                </div>
              )}

              {/* Second divider */}
              <div className="flex items-center gap-3 px-4">
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-stone-700/40 to-transparent`} />
              </div>

              {/* Certification footer */}
              <div className="text-center space-y-3">
                {cert.creatorName && (
                  <p className="text-stone-400 text-sm">
                    Created by <span className="text-stone-200 font-medium">{cert.creatorName}</span>
                  </p>
                )}
                <div className="flex items-center justify-center gap-4 text-xs text-stone-500">
                  <span>Certified {certDate}</span>
                  <span className="text-stone-700">•</span>
                  <span className="font-mono text-stone-600">#{id.slice(0, 8)}</span>
                </div>
                <p className="text-[10px] text-stone-600 tracking-wide">
                  Scored using transparent balance formulas at evergreen5e
                </p>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <CertificationEmbed
            itemName={cert.itemName}
            certUrl={certUrl}
            badgeUrl={badgeUrl}
            suggestedRarity={cert.suggestedRarity}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/calculator"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors text-center btn-glow-emerald"
            >
              Create Another Item
            </Link>
            <Link
              href="/calculator"
              className="px-6 py-2.5 bg-slate-700/80 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors text-center border border-slate-600/50"
            >
              ← Back to Calculator
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
