import { ImageResponse } from 'next/og';
import { getCertification } from '@/lib/actions/certifications';

export const runtime = 'edge';

// Rarity color schemes for the badge
// Legendary* uses red to indicate the item exceeds SRD reference items
const RARITY_COLORS: Record<string, { border: string; accent: string; glow: string; text: string }> = {
  'Common': {
    border: '#64748b',
    accent: '#94a3b8',
    glow: 'rgba(100, 116, 139, 0.3)',
    text: '#94a3b8',
  },
  'Uncommon': {
    border: '#10b981',
    accent: '#34d399',
    glow: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
  },
  'Rare': {
    border: '#3b82f6',
    accent: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.3)',
    text: '#60a5fa',
  },
  'Very Rare': {
    border: '#8b5cf6',
    accent: '#a78bfa',
    glow: 'rgba(139, 92, 246, 0.4)',
    text: '#a78bfa',
  },
  'Legendary': {
    border: '#f59e0b',
    accent: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: '#fbbf24',
  },
  'Legendary*': {
    border: '#ef4444',
    accent: '#f87171',
    glow: 'rgba(239, 68, 68, 0.4)',
    text: '#f87171',
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await getCertification(id);

  if (!result.success || !result.data) {
    // Return a placeholder error image
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
            fontFamily: 'serif',
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

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          padding: 0,
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #292524 0%, #1c1917 50%, #0c0a09 100%)',
          }}
        />

        {/* Border frame */}
        <div
          style={{
            position: 'absolute',
            inset: 12,
            border: `3px solid ${colors.border}`,
            borderRadius: 8,
            boxShadow: `0 0 30px ${colors.glow}`,
          }}
        />

        {/* Corner ornaments */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 40,
            height: 40,
            borderTop: `3px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.border}`,
            borderRadius: '4px 0 0 0',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderTop: `3px solid ${colors.border}`,
            borderRight: `3px solid ${colors.border}`,
            borderRadius: '0 4px 0 0',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            width: 40,
            height: 40,
            borderBottom: `3px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.border}`,
            borderRadius: '0 0 0 4px',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            width: 40,
            height: 40,
            borderBottom: `3px solid ${colors.border}`,
            borderRight: `3px solid ${colors.border}`,
            borderRadius: '0 0 4px 0',
            opacity: 0.7,
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flex: 1,
            padding: '40px 60px',
            gap: 16,
          }}
        >
          {/* Evergreen seal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `2px solid ${colors.border}`,
              backgroundColor: 'rgba(28, 25, 23, 0.9)',
              fontSize: 28,
            }}
          >
            🌿
          </div>

          {/* Item name */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 12,
                letterSpacing: '0.2em',
                color: colors.accent,
                textTransform: 'uppercase',
              }}
            >
              Balance Certified
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: '#fef3c7',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: 500,
              }}
            >
              {cert.itemName}
            </span>
          </div>

          {/* Rarity badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 24px',
              borderRadius: 100,
              border: `2px solid ${colors.border}`,
              backgroundColor: 'rgba(28, 25, 23, 0.7)',
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: colors.text,
              }}
            >
              {cert.suggestedRarity}
            </span>
          </div>

          {/* Stats Summary */}
          {(() => {
            const stats: string[] = [];
            if (cert.enhancementBonus) stats.push(`+${cert.enhancementBonus}`);
            if (cert.acBonus) stats.push(`+${cert.acBonus} AC`);
            if (cert.savingThrowBonus) stats.push(`+${cert.savingThrowBonus} saves`);
            if (cert.extraDamageDice) stats.push(`${cert.extraDamageDice} ${cert.extraDamageType || ''}`);
            if (cert.chargesDescription) stats.push('charges');

            const summary = stats.length > 0 ? stats.join(' • ') : cert.baseItem;

            return (
              <span
                style={{
                  fontSize: 14,
                  color: '#a8a29e',
                  textTransform: 'capitalize',
                }}
              >
                {summary}
              </span>
            );
          })()}

          {/* Score */}
          <span
            style={{
              fontSize: 13,
              color: '#78716c',
            }}
          >
            Balance Score: {cert.score.toFixed(2)} pts
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            bottom: 24,
            left: 0,
            right: 0,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: '#57534e',
              letterSpacing: '0.1em',
            }}
          >
            evergreen5e.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 315,
    }
  );
}
