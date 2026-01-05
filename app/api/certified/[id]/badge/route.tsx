import { ImageResponse } from 'next/og';
import { getCertification } from '@/lib/actions/certifications';

export const runtime = 'edge';

// Rarity color schemes for the badge
const RARITY_COLORS: Record<string, { border: string; accent: string; glow: string; text: string; bg: string }> = {
  'Common': {
    border: '#64748b',
    accent: '#94a3b8',
    glow: 'rgba(100, 116, 139, 0.25)',
    text: '#94a3b8',
    bg: 'rgba(100, 116, 139, 0.08)',
  },
  'Uncommon': {
    border: '#10b981',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
    bg: 'rgba(16, 185, 129, 0.08)',
  },
  'Rare': {
    border: '#3b82f6',
    accent: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.3)',
    text: '#60a5fa',
    bg: 'rgba(59, 130, 246, 0.08)',
  },
  'Very Rare': {
    border: '#8b5cf6',
    accent: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.35)',
    text: '#a78bfa',
    bg: 'rgba(139, 92, 246, 0.08)',
  },
  'Legendary': {
    border: '#f59e0b',
    accent: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
  'Legendary*': {
    border: '#ef4444',
    accent: '#f87171',
    glow: 'rgba(239, 68, 68, 0.4)',
    text: '#f87171',
    bg: 'rgba(239, 68, 68, 0.1)',
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await getCertification(id);

  if (!result.success || !result.data) {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            fontFamily: 'sans-serif',
          }}
        >
          <span style={{ fontSize: 24 }}>Certification Not Found</span>
        </div>
      ),
      {
        width: 600,
        height: 315,
      }
    );
  }

  const cert = result.data;
  const colors = RARITY_COLORS[cert.suggestedRarity] || RARITY_COLORS['Common'];

  // Build feature list from itemAttributes or fallback
  const features: Array<{ label: string; value: string }> = cert.itemAttributes && cert.itemAttributes.length > 0
    ? cert.itemAttributes
    : [];

  // Fallback for old certifications
  if (features.length === 0) {
    if (cert.enhancementBonus) {
      features.push({ label: 'Enhancement', value: `+${cert.enhancementBonus} to attack and damage` });
    }
    if (cert.acBonus) {
      features.push({ label: 'Armor Class', value: `+${cert.acBonus} AC` });
    }
    if (cert.savingThrowBonus) {
      features.push({ label: 'Saving Throws', value: `+${cert.savingThrowBonus} to saves` });
    }
    if (cert.extraDamageDice) {
      features.push({ label: 'Bonus Damage', value: `${cert.extraDamageDice} ${cert.extraDamageType || ''}` });
    }
    if (cert.chargesDescription) {
      features.push({ label: 'Charges', value: cert.chargesDescription });
    }
  }

  // Format features for display - abbreviate long values
  const displayFeatures = features.slice(0, 3).map(f => {
    let text = `${f.label}: ${f.value}`;
    if (text.length > 45) {
      text = text.substring(0, 42) + '...';
    }
    return text;
  });

  const moreCount = features.length > 3 ? features.length - 3 : 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          fontFamily: 'sans-serif',
          position: 'relative',
          backgroundColor: '#0c0a09',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)',
          }}
        />

        {/* Rarity tint */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${colors.bg} 0%, transparent 60%)`,
          }}
        />

        {/* Border frame */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            border: `2px solid ${colors.border}`,
            borderRadius: 12,
            boxShadow: `0 0 30px ${colors.glow}`,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            padding: '28px 36px',
            height: '100%',
          }}
        >
          {/* Top row: Seal + Label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 28 }}>🌿</span>
            <span
              style={{
                fontSize: 12,
                letterSpacing: '0.12em',
                color: colors.accent,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Balance Certified
            </span>
          </div>

          {/* Item name */}
          <div
            style={{
              display: 'flex',
              marginTop: 12,
            }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: '#fef3c7',
                lineHeight: 1.2,
              }}
            >
              {cert.itemName.length > 32 ? cert.itemName.substring(0, 30) + '...' : cert.itemName}
            </span>
          </div>

          {/* Rarity + Score + Base item row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '5px 14px',
                borderRadius: 100,
                border: `1.5px solid ${colors.border}`,
                backgroundColor: 'rgba(28, 25, 23, 0.8)',
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: colors.text,
                }}
              >
                {cert.suggestedRarity}
              </span>
            </div>
            <span style={{ fontSize: 13, color: '#78716c' }}>
              {cert.score.toFixed(2)} pts
            </span>
            <span style={{ fontSize: 13, color: '#57534e' }}>•</span>
            <span style={{ fontSize: 13, color: '#a8a29e', textTransform: 'capitalize' }}>
              {cert.baseItem}
            </span>
            {cert.attunement && (
              <>
                <span style={{ fontSize: 13, color: '#57534e' }}>•</span>
                <span style={{ fontSize: 13, color: '#a78bfa' }}>Attunement</span>
              </>
            )}
          </div>

          {/* Features section */}
          {displayFeatures.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 16,
                padding: '12px 16px',
                backgroundColor: 'rgba(28, 25, 23, 0.6)',
                borderRadius: 8,
                border: '1px solid rgba(120, 113, 108, 0.2)',
                gap: 6,
              }}
            >
              {displayFeatures.map((feature, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 11, color: colors.accent }}>◆</span>
                  <span style={{ fontSize: 13, color: '#d6d3d1', lineHeight: 1.3 }}>
                    {feature}
                  </span>
                </div>
              ))}
              {moreCount > 0 && (
                <span style={{ fontSize: 11, color: '#78716c', marginLeft: 16 }}>
                  +{moreCount} more properties
                </span>
              )}
            </div>
          )}

          {/* Footer - positioned at bottom */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 20,
              left: 36,
              right: 36,
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 10, color: '#57534e', letterSpacing: '0.05em' }}>
              evergreen5e.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 315,
    }
  );
}
