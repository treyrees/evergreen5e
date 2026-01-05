import { ImageResponse } from 'next/og';
import { getCertification } from '@/lib/actions/certifications';

export const runtime = 'edge';

// Rarity color schemes for the badge
// Legendary* uses red to indicate the item exceeds SRD reference items
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

// Feature icons for the badge
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

function getFeatureIcon(label: string): string {
  return FEATURE_ICONS[label] || '✦';
}

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

  // Build feature summary from itemAttributes
  const features: Array<{ label: string; value: string }> = cert.itemAttributes && cert.itemAttributes.length > 0
    ? cert.itemAttributes
    : [];

  // Fallback for old certifications
  if (features.length === 0) {
    if (cert.enhancementBonus) {
      features.push({ label: 'Enhancement', value: `+${cert.enhancementBonus}` });
    }
    if (cert.acBonus) {
      features.push({ label: 'Armor Class', value: `+${cert.acBonus} AC` });
    }
    if (cert.savingThrowBonus) {
      features.push({ label: 'Saving Throws', value: `+${cert.savingThrowBonus}` });
    }
    if (cert.extraDamageDice) {
      features.push({ label: 'Bonus Damage', value: `${cert.extraDamageDice} ${cert.extraDamageType || ''}` });
    }
    if (cert.chargesDescription) {
      features.push({ label: 'Charges', value: 'Yes' });
    }
  }

  // Limit to 4 features for display, with abbreviated values
  const displayFeatures = features.slice(0, 4).map(f => {
    // Abbreviate long values
    let shortValue = f.value;
    if (shortValue.length > 30) {
      shortValue = shortValue.substring(0, 27) + '...';
    }
    return { label: f.label, value: shortValue, icon: getFeatureIcon(f.label) };
  });

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
            background: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)',
          }}
        />

        {/* Subtle rarity tint overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, ${colors.bg} 0%, transparent 70%)`,
          }}
        />

        {/* Border frame with glow */}
        <div
          style={{
            position: 'absolute',
            inset: 10,
            border: `2px solid ${colors.border}`,
            borderRadius: 12,
            boxShadow: `0 0 40px ${colors.glow}, inset 0 0 60px ${colors.glow}`,
          }}
        />

        {/* Corner ornaments */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 32,
            height: 32,
            borderTop: `2px solid ${colors.border}`,
            borderLeft: `2px solid ${colors.border}`,
            borderRadius: '6px 0 0 0',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderTop: `2px solid ${colors.border}`,
            borderRight: `2px solid ${colors.border}`,
            borderRadius: '0 6px 0 0',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            width: 32,
            height: 32,
            borderBottom: `2px solid ${colors.border}`,
            borderLeft: `2px solid ${colors.border}`,
            borderRadius: '0 0 0 6px',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 32,
            height: 32,
            borderBottom: `2px solid ${colors.border}`,
            borderRight: `2px solid ${colors.border}`,
            borderRadius: '0 0 6px 0',
            opacity: 0.8,
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            position: 'relative',
            flex: 1,
            padding: '24px 32px',
            gap: 24,
          }}
        >
          {/* Left side - Item info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'center',
              gap: 12,
            }}
          >
            {/* Certification label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 24 }}>🌿</span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  color: colors.accent,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Balance Certified
              </span>
            </div>

            {/* Item name */}
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#fef3c7',
                lineHeight: 1.15,
                maxWidth: 340,
              }}
            >
              {cert.itemName.length > 28 ? cert.itemName.substring(0, 26) + '...' : cert.itemName}
            </span>

            {/* Rarity + Score */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 16px',
                  borderRadius: 100,
                  border: `1.5px solid ${colors.border}`,
                  backgroundColor: 'rgba(28, 25, 23, 0.8)',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: colors.text,
                  }}
                >
                  {cert.suggestedRarity}
                </span>
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: '#78716c',
                }}
              >
                {cert.score.toFixed(2)} pts
              </span>
            </div>

            {/* Base item + Attunement */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                fontSize: 12,
                color: '#a8a29e',
                marginTop: 4,
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{cert.baseItem}</span>
              {cert.attunement && (
                <>
                  <span style={{ color: '#57534e' }}>•</span>
                  <span style={{ color: '#a78bfa' }}>Requires Attunement</span>
                </>
              )}
            </div>
          </div>

          {/* Right side - Features */}
          {displayFeatures.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: 200,
                gap: 8,
                paddingLeft: 20,
                borderLeft: '1px solid rgba(120, 113, 108, 0.3)',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: '#78716c',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Properties
              </span>
              {displayFeatures.map((feature, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{feature.icon}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#d6d3d1',
                      lineHeight: 1.3,
                    }}
                  >
                    {feature.label}
                  </span>
                </div>
              ))}
              {features.length > 4 && (
                <span
                  style={{
                    fontSize: 10,
                    color: '#78716c',
                    fontStyle: 'italic',
                  }}
                >
                  +{features.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            bottom: 18,
            left: 0,
            right: 0,
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: '#57534e',
              letterSpacing: '0.05em',
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
