'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { MagicItem, DamageBonus, ChargedAbility, AbilityScoreSetter, AbilityScoreBonus, PermanentBuffs, WeaponProperty } from '@/types/magic-item';
import {
  getSuggestedRarity,
  findTopAnchorItems,
} from '@/lib/calculator';
import { getWarningIndicator } from '@/lib/item-balance-flags';
import { generateRandomItemName } from '@/lib/item-name-generator';

// Animated number component for smooth score transitions
function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (current) => current.toFixed(decimals));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

// Capitalize rarity for display (e.g., "very rare" → "Very Rare")
function capitalizeRarity(rarity: string): string {
  return rarity.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Get rarity color class based on rarity tier (case-insensitive)
function getRarityColorClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'text-slate-400';
  if (r === 'uncommon') return 'text-emerald-400/80';
  if (r === 'rare') return 'text-sky-400/80';
  if (r === 'very rare') return 'text-violet-400/80';
  if (r === 'legendary') return 'text-amber-400/80';
  return 'text-slate-400';
}

// Get muted rarity background class for comparison cards
function getRarityBgClass(rarity: string): string {
  const r = rarity.toLowerCase();
  if (r === 'common') return 'bg-slate-700/30';
  if (r === 'uncommon') return 'bg-emerald-950/20';
  if (r === 'rare') return 'bg-sky-950/20';
  if (r === 'very rare') return 'bg-violet-950/20';
  if (r === 'legendary') return 'bg-amber-950/20';
  return 'bg-slate-700/30';
}

// Get medal border class (gold/silver/bronze) for comparison ranking
function getMedalBorderClass(index: number): string {
  if (index === 0) return 'border-amber-500/60'; // Gold
  if (index === 1) return 'border-slate-400/60'; // Silver
  return 'border-amber-700/50'; // Bronze
}

const BASE_ITEMS = {
  'Melee Weapons (Simple)': [
    'club',
    'dagger',
    'greatclub',
    'handaxe',
    'javelin',
    'mace',
    'quarterstaff',
    'spear',
  ],
  'Melee Weapons (Martial)': [
    'battleaxe',
    'flail',
    'glaive',
    'greataxe',
    'greatsword',
    'halberd',
    'lance',
    'longsword',
    'maul',
    'morningstar',
    'pike',
    'rapier',
    'scimitar',
    'shortsword',
    'trident',
    'warhammer',
    'whip',
  ],
  'Ranged Weapons': [
    'crossbow (hand)',
    'crossbow (heavy)',
    'crossbow (light)',
    'longbow',
    'shortbow',
  ],
  'Armor': [
    'armor (light)',
    'armor (medium)',
    'armor (heavy)',
    'shield',
  ],
  'Implements': [
    'rod',
    'staff',
    'wand',
  ],
  'Accessories': [
    'amulet',
    'boots',
    'cloak',
    'gloves',
    'ring',
  ],
};

// Helper to check if a base item is a weapon
const WEAPON_ITEMS = new Set([
  ...BASE_ITEMS['Melee Weapons (Simple)'],
  ...BASE_ITEMS['Melee Weapons (Martial)'],
  ...BASE_ITEMS['Ranged Weapons'],
]);

const DAMAGE_TYPES = [
  'fire',
  'cold',
  'lightning',
  'acid',
  'poison',
  'thunder',
  'radiant',
  'necrotic',
  'psychic',
  'force',
  'piercing',
  'slashing',
  'bludgeoning',
];

export default function CalculatorPage() {
  const [itemName, setItemName] = useState('');
  const [baseItem, setBaseItem] = useState('');
  const [enhancement, setEnhancement] = useState(0);
  const [enhancementSometimes, setEnhancementSometimes] = useState(false);
  const [damageBonus, setDamageBonus] = useState<DamageBonus | undefined>(
    undefined
  );
  const [acBonus, setAcBonus] = useState(0);
  const [acBonusSometimes, setAcBonusSometimes] = useState(false);
  const [savingThrowBonus, setSavingThrowBonus] = useState(0);
  const [saveBonusSometimes, setSaveBonusSometimes] = useState(false);
  const [resistances, setResistances] = useState<string[]>([]);
  const [resistancesSometimes, setResistancesSometimes] = useState(false);
  const [attunement, setAttunement] = useState(false);

  // Ability score setter state
  const [abilityScoreSetter, setAbilityScoreSetter] = useState<AbilityScoreSetter | undefined>(undefined);

  // Ability score bonus state
  const [abilityScoreBonus, setAbilityScoreBonus] = useState<AbilityScoreBonus | undefined>(undefined);

  // Permanent buffs state
  const [permanentBuffs, setPermanentBuffs] = useState<PermanentBuffs>({});

  // Flight state (separate from permanentBuffs for detailed configuration)
  const [flightEnabled, setFlightEnabled] = useState(false);
  const [flySpeed, setFlySpeed] = useState(30);
  const [flyDuration, setFlyDuration] = useState<number | 'unlimited'>(4);

  // Weapon properties state (for adding properties not normally on the base weapon)
  const [weaponProperties, setWeaponProperties] = useState<WeaponProperty[]>([]);

  // Charge pool state (new intuitive system)
  const [maxCharges, setMaxCharges] = useState(0);
  const [chargesPerShortRest, setChargesPerShortRest] = useState(0);
  const [chargesPerLongRest, setChargesPerLongRest] = useState(0);
  const [abilities, setAbilities] = useState<ChargedAbility[]>([]);

  // UI state
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [expandedItemInfo, setExpandedItemInfo] = useState<string | null>(null);

  // Item Preview state
  const [itemDescription, setItemDescription] = useState('');
  const [hiddenAttributes, setHiddenAttributes] = useState<Set<string>>(new Set());
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Generate random placeholder after mount to avoid hydration mismatch
  const [randomPlaceholder, setRandomPlaceholder] = useState('');
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: one-time mount initialization
    setRandomPlaceholder(generateRandomItemName());
  }, []);

  const [newAbility, setNewAbility] = useState<ChargedAbility>({
    spell: '',
    spellLevel: 0,
    chargesPerUse: 1,
  });
  const [spellNameError, setSpellNameError] = useState(false);

  // Check if selected base item is a weapon
  const isWeaponSelected = useMemo(() => WEAPON_ITEMS.has(baseItem), [baseItem]);

  // Check if any combat attributes are selected (for blur effect)
  const hasPermanentBuffs = Object.values(permanentBuffs).some(v => v === true);
  const hasSelectedAttributes = useMemo(() => {
    return (
      enhancement > 0 ||
      damageBonus !== undefined ||
      acBonus > 0 ||
      savingThrowBonus > 0 ||
      maxCharges > 0 ||
      chargesPerShortRest > 0 ||
      chargesPerLongRest > 0 ||
      abilities.length > 0 ||
      abilityScoreSetter !== undefined ||
      abilityScoreBonus !== undefined ||
      hasPermanentBuffs ||
      flightEnabled ||
      weaponProperties.length > 0 ||
      resistances.length > 0
    );
  }, [enhancement, damageBonus, acBonus, savingThrowBonus, maxCharges, chargesPerShortRest, chargesPerLongRest, abilities, abilityScoreSetter, abilityScoreBonus, hasPermanentBuffs, flightEnabled, weaponProperties, resistances]);

  const currentItem: Partial<MagicItem> = useMemo(() => ({
    name: itemName || 'Unnamed Item',
    baseItem,
    combat: {
      enhancement,
      enhancementMultiplier: enhancementSometimes ? 0.5 : undefined,
      damageBonus,
      acBonus: acBonus > 0 ? acBonus : undefined,
      acBonusMultiplier: acBonusSometimes ? 0.5 : undefined,
      savingThrowBonus: savingThrowBonus > 0 ? savingThrowBonus : undefined,
      savingThrowBonusMultiplier: saveBonusSometimes ? 0.5 : undefined,
      resistances: resistances.length > 0 ? resistances : undefined,
      resistancesMultiplier: resistancesSometimes ? 0.5 : undefined,
      abilityScoreSetter,
      abilityScoreBonus,
      permanentBuffs: hasPermanentBuffs ? permanentBuffs : undefined,
      flight: flightEnabled ? {
        flySpeed,
        flyDuration,
      } : undefined,
      chargePool: (maxCharges > 0 || abilities.length > 0) ? {
        maxCharges,
        chargesPerShortRest,
        chargesPerLongRest,
        abilities,
      } : undefined,
      weaponProperties: weaponProperties.length > 0 ? weaponProperties : undefined,
    },
    attunement,
  }), [itemName, baseItem, enhancement, enhancementSometimes, damageBonus, acBonus, acBonusSometimes, savingThrowBonus, saveBonusSometimes, resistances, resistancesSometimes, abilityScoreSetter, abilityScoreBonus, permanentBuffs, hasPermanentBuffs, flightEnabled, flySpeed, flyDuration, maxCharges, chargesPerShortRest, chargesPerLongRest, abilities, attunement, weaponProperties]);

  const results = useMemo(() => getSuggestedRarity(currentItem), [currentItem]);
  const topAnchors = useMemo(() => findTopAnchorItems(currentItem, 3), [currentItem]);

  // Track if this is the first rarity transition (slower) vs subsequent (faster)
  const isFirstTransition = useRef(true);

  // Update body background based on rarity when item is populated
  useEffect(() => {
    if (hasSelectedAttributes) {
      // First transition is 3s, subsequent are 1s
      if (isFirstTransition.current) {
        document.body.classList.remove('fast-transition');
        isFirstTransition.current = false;
      } else {
        document.body.classList.add('fast-transition');
      }
      // Set the rarity on the body to trigger the background color transition
      document.body.dataset.rarity = results.suggestedRarity.toLowerCase();
    } else {
      // Remove the rarity attribute to return to default purple
      delete document.body.dataset.rarity;
      // Reset so next time attributes are added, we get slow transition again
      isFirstTransition.current = true;
      document.body.classList.remove('fast-transition');
    }

    // Cleanup on unmount - return to default purple
    return () => {
      delete document.body.dataset.rarity;
      document.body.classList.remove('fast-transition');
    };
  }, [hasSelectedAttributes, results.suggestedRarity]);

  const addAbility = () => {
    if (newAbility.spell.trim()) {
      setSpellNameError(false);
      setAbilities([...abilities, newAbility]);
      setNewAbility({
        spell: '',
        spellLevel: 0,
        chargesPerUse: 1,
      });
      // Keep form open to allow adding multiple abilities
    } else {
      setSpellNameError(true);
      // Clear error after animation
      setTimeout(() => setSpellNameError(false), 2000);
    }
  };

  const removeAbility = (index: number) => {
    setAbilities(abilities.filter((_, i) => i !== index));
  };

  // Toggle attribute visibility in preview
  const toggleAttributeVisibility = (attrKey: string) => {
    setHiddenAttributes(prev => {
      const next = new Set(prev);
      if (next.has(attrKey)) {
        next.delete(attrKey);
      } else {
        next.add(attrKey);
      }
      return next;
    });
  };

  // Helper to format base item for display (capitalize first letter of each word)
  const formatBaseItem = (item: string) => {
    return item.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get item type category for DMG-style formatting
  const getItemTypeCategory = (item: string): string => {
    if (WEAPON_ITEMS.has(item)) return 'Weapon';
    if (item.includes('armor')) return 'Armor';
    if (item === 'shield') return 'Armor';
    if (['rod', 'staff', 'wand'].includes(item)) return 'Wondrous item';
    return 'Wondrous item';
  };

  // Build the type line like "Weapon (longsword), rare (requires attunement)"
  const buildTypeLine = (): string => {
    const category = getItemTypeCategory(baseItem);
    const itemSpec = baseItem ? `(${formatBaseItem(baseItem).toLowerCase()})` : '';
    const rarityText = results.suggestedRarity.toLowerCase();
    const attunementText = attunement ? ' (requires attunement)' : '';

    if (category === 'Weapon' || category === 'Armor') {
      return `${category} ${itemSpec}, ${rarityText}${attunementText}`;
    }
    return `${category}, ${rarityText}${attunementText}`;
  };

  // Get display name for the item
  const getDisplayName = (): string => {
    if (itemName.trim()) return itemName.trim();
    if (baseItem) return formatBaseItem(baseItem);
    return 'Magic Item';
  };

  // Build list of toggleable attributes
  const previewAttributes = useMemo(() => {
    const attrs: { key: string; label: string; value: string }[] = [];

    if (enhancement > 0) {
      const suffix = enhancementSometimes ? ' (conditional)' : '';
      attrs.push({ key: 'enhancement', label: 'Enhancement', value: `+${enhancement} bonus to attack and damage rolls${suffix}` });
    }

    if (damageBonus) {
      let dmgText = `${damageBonus.dice} ${damageBonus.type} damage`;
      if (damageBonus.vicious) dmgText += ' on critical hits';
      else if (damageBonus.frequency === 'per-turn') dmgText += ' (once per turn)';
      else dmgText += ' per hit';
      if (damageBonus.conditional) dmgText += ' against specific creatures';
      attrs.push({ key: 'damage', label: 'Bonus Damage', value: dmgText });
    }

    if (acBonus > 0) {
      const suffix = acBonusSometimes ? ' (conditional)' : '';
      attrs.push({ key: 'ac', label: 'Armor Class', value: `+${acBonus} bonus to AC${suffix}` });
    }

    if (savingThrowBonus > 0) {
      const suffix = saveBonusSometimes ? ' (conditional)' : '';
      attrs.push({ key: 'saves', label: 'Saving Throws', value: `+${savingThrowBonus} bonus to saving throws${suffix}` });
    }

    if (abilityScoreSetter) {
      attrs.push({ key: 'ability-setter', label: 'Ability Score', value: `${abilityScoreSetter.ability} score becomes ${abilityScoreSetter.setValue}` });
    }

    if (abilityScoreBonus) {
      attrs.push({ key: 'ability-bonus', label: 'Ability Score', value: `+${abilityScoreBonus.bonus} to ${abilityScoreBonus.ability}` });
    }

    if (resistances.length > 0) {
      const suffix = resistancesSometimes ? ' (conditional)' : '';
      attrs.push({ key: 'resistances', label: 'Resistances', value: `Resistance to ${resistances.join(', ')} damage${suffix}` });
    }

    if (flightEnabled) {
      const duration = flyDuration === 'unlimited' ? 'unlimited' : `${flyDuration} hour${flyDuration === 1 ? '' : 's'} per day`;
      attrs.push({ key: 'flight', label: 'Flight', value: `Flying speed of ${flySpeed} feet (${duration})` });
    }

    const buffs: string[] = [];
    if (permanentBuffs.darkvision) buffs.push('darkvision 60 ft.');
    if (permanentBuffs.blindsight) buffs.push('blindsight 30 ft.');
    if (permanentBuffs.tremorsense) buffs.push('tremorsense 30 ft.');
    if (permanentBuffs.speedBonus) buffs.push('+10 ft. movement speed');
    if (permanentBuffs.climbBurrow) buffs.push('climb and burrow speeds equal to walking speed');
    if (buffs.length > 0) {
      attrs.push({ key: 'buffs', label: 'Senses & Movement', value: buffs.join(', ') });
    }

    if (weaponProperties.length > 0) {
      const propLabels: Record<string, string> = {
        'finesse': 'finesse',
        'light': 'light',
        'reach': 'reach',
        'thrown': 'thrown',
        'versatile': 'versatile',
        'heavy-two-handed': 'heavy, two-handed',
      };
      const propText = weaponProperties.map(p => propLabels[p] || p).join(', ');
      attrs.push({ key: 'properties', label: 'Properties', value: `Gains the ${propText} ${weaponProperties.length === 1 ? 'property' : 'properties'}` });
    }

    if (abilities.length > 0) {
      const spellList = abilities.map(a => `${a.spell} (${a.chargesPerUse} charge${a.chargesPerUse > 1 ? 's' : ''})`).join(', ');
      attrs.push({ key: 'spells', label: 'Spells', value: spellList });
    }

    if (maxCharges > 0) {
      let rechargeText = '';
      if (chargesPerLongRest > 0) rechargeText = `regains ${chargesPerLongRest} at dawn`;
      if (chargesPerShortRest > 0) rechargeText = rechargeText ? `${rechargeText}, ${chargesPerShortRest} per short rest` : `regains ${chargesPerShortRest} per short rest`;
      attrs.push({ key: 'charges', label: 'Charges', value: `${maxCharges} charges${rechargeText ? `, ${rechargeText}` : ''}` });
    }

    return attrs;
  }, [enhancement, enhancementSometimes, damageBonus, acBonus, acBonusSometimes, savingThrowBonus, saveBonusSometimes, abilityScoreSetter, abilityScoreBonus, resistances, resistancesSometimes, flightEnabled, flySpeed, flyDuration, permanentBuffs, weaponProperties, abilities, maxCharges, chargesPerLongRest, chargesPerShortRest]);

  // Get rarity color for canvas (hex values)
  const getRarityHexColor = (rarity: string): string => {
    const r = rarity.toLowerCase();
    if (r === 'common') return '#94a3b8';
    if (r === 'uncommon') return '#4ade80';
    if (r === 'rare') return '#38bdf8';
    if (r === 'very rare') return '#a78bfa';
    if (r === 'legendary') return '#fbbf24';
    return '#94a3b8';
  };

  // Get rarity background gradient colors
  const getRarityGradientColors = (rarity: string): [string, string] => {
    const r = rarity.toLowerCase();
    if (r === 'common') return ['#1e293b', '#0f172a'];
    if (r === 'uncommon') return ['#052e16', '#0f172a'];
    if (r === 'rare') return ['#0c4a6e', '#0f172a'];
    if (r === 'very rare') return ['#2e1065', '#0f172a'];
    if (r === 'legendary') return ['#451a03', '#0f172a'];
    return ['#1e293b', '#0f172a'];
  };

  // Generate print preview image
  const generatePreviewImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 500;
    const padding = 28;
    const rarityColor = getRarityHexColor(results.suggestedRarity);
    const [gradientStart, gradientEnd] = getRarityGradientColors(results.suggestedRarity);

    // Filter visible attributes
    const visibleAttrs = previewAttributes.filter(attr => !hiddenAttributes.has(attr.key));

    // Calculate dynamic height based on content
    let contentHeight = 0;
    contentHeight += 50; // Name
    contentHeight += 24; // Type line
    contentHeight += 20; // Spacing
    contentHeight += 60; // Rarity badge
    contentHeight += 20; // Spacing
    contentHeight += visibleAttrs.length * 28; // Attributes
    if (itemDescription.trim()) {
      // Estimate description lines (rough calculation)
      const descLines = Math.ceil(itemDescription.length / 50);
      contentHeight += 20 + (descLines * 20); // Description
    }
    contentHeight += 40; // Bottom padding

    const height = Math.max(300, contentHeight + padding * 2);
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, gradientStart);
    bgGradient.addColorStop(1, gradientEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative border
    ctx.strokeStyle = rarityColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Inner subtle border
    ctx.strokeStyle = `${rarityColor}40`;
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, width - 28, height - 28);

    // Top accent line
    const accentGradient = ctx.createLinearGradient(0, 0, width, 0);
    accentGradient.addColorStop(0, 'transparent');
    accentGradient.addColorStop(0.3, `${rarityColor}80`);
    accentGradient.addColorStop(0.5, rarityColor);
    accentGradient.addColorStop(0.7, `${rarityColor}80`);
    accentGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = accentGradient;
    ctx.fillRect(20, 20, width - 40, 3);

    let y = padding + 30;

    // Item Name
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 28px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(getDisplayName(), width / 2, y);
    y += 30;

    // Type line
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 14px Georgia, serif';
    ctx.fillText(buildTypeLine(), width / 2, y);
    y += 35;

    // Rarity Badge with Score
    const badgeWidth = 180;
    const badgeHeight = 44;
    const badgeX = (width - badgeWidth) / 2;

    // Badge background
    ctx.fillStyle = `${rarityColor}20`;
    ctx.beginPath();
    ctx.roundRect(badgeX, y, badgeWidth, badgeHeight, 8);
    ctx.fill();

    // Badge border
    ctx.strokeStyle = `${rarityColor}60`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rarity text
    ctx.fillStyle = rarityColor;
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(results.suggestedRarity.toUpperCase(), width / 2, y + 20);

    // Score
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px monospace';
    ctx.fillText(`${results.combatScore.toFixed(1)} pts`, width / 2, y + 36);

    y += badgeHeight + 25;

    // Divider line
    ctx.strokeStyle = `${rarityColor}30`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding + 20, y);
    ctx.lineTo(width - padding - 20, y);
    ctx.stroke();
    y += 20;

    // Attributes
    ctx.textAlign = 'left';
    for (const attr of visibleAttrs) {
      // Bullet
      ctx.fillStyle = `${rarityColor}80`;
      ctx.font = '14px Georgia, serif';
      ctx.fillText('•', padding + 10, y);

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 13px Georgia, serif';
      const labelWidth = ctx.measureText(`${attr.label}. `).width;
      ctx.fillText(`${attr.label}. `, padding + 26, y);

      // Value (with word wrap if needed)
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px Georgia, serif';
      const maxValueWidth = width - padding * 2 - 26 - labelWidth - 10;
      let valueText = attr.value;
      if (ctx.measureText(valueText).width > maxValueWidth) {
        // Truncate with ellipsis
        while (ctx.measureText(valueText + '...').width > maxValueWidth && valueText.length > 0) {
          valueText = valueText.slice(0, -1);
        }
        valueText += '...';
      }
      ctx.fillText(valueText, padding + 26 + labelWidth, y);
      y += 24;
    }

    // Description
    if (itemDescription.trim()) {
      y += 10;
      ctx.strokeStyle = `${rarityColor}20`;
      ctx.beginPath();
      ctx.moveTo(padding + 20, y);
      ctx.lineTo(width - padding - 20, y);
      ctx.stroke();
      y += 18;

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 12px Georgia, serif';
      ctx.textAlign = 'left';

      // Word wrap description
      const words = itemDescription.split(' ');
      let line = '';
      const maxWidth = width - padding * 2 - 20;

      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth && line !== '') {
          ctx.fillText(line.trim(), padding + 10, y);
          line = word + ' ';
          y += 18;
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        ctx.fillText(line.trim(), padding + 10, y);
      }
    }

    // Generate image URL
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewImageUrl(dataUrl);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header - Minimal */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-100">
            Evergreen5e Magic Item Balancer
          </h1>
          <div className="flex gap-4 text-sm">
            <Link href="/items" className="text-slate-500 hover:text-slate-300 transition-colors">
              Browse Items
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
              Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Base Item Selection */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder={randomPlaceholder || 'Sword of Flames'}
                    className="w-full px-4 py-2.5 border border-slate-600 rounded-md bg-slate-900 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Base Item Type
                  </label>
                  <select
                    value={baseItem}
                    onChange={(e) => {
                      const newItem = e.target.value;
                      setBaseItem(newItem);
                      // Clear weapon properties when switching to a non-weapon
                      if (!WEAPON_ITEMS.has(newItem)) {
                        setWeaponProperties([]);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="" disabled className="text-slate-500">
                      Select base item type...
                    </option>
                    {Object.entries(BASE_ITEMS).map(([category, items]) => (
                      <optgroup key={category} label={category}>
                        {items.map((item) => (
                          <option key={item} value={item}>
                            {item.charAt(0).toUpperCase() + item.slice(1)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={attunement}
                    onChange={(e) => setAttunement(e.target.checked)}
                    className="mr-2.5 h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    Requires Attunement
                  </span>
                </label>
              </div>
            </div>

            {/* Combat Bonuses */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Combat Bonuses</h2>
              <div className="space-y-5">
                  {/* Enhancement Bonus */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Enhancement (+hit/+dmg)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((value) => (
                          <button
                            key={value}
                            onClick={() => {
                              setEnhancement(value);
                              if (value === 0) setEnhancementSometimes(false);
                            }}
                            className={`px-4 py-2 rounded-md font-medium transition-all ${
                              enhancement === value
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            +{value}
                          </button>
                        ))}
                      </div>
                      {enhancement > 0 && (
                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={enhancementSometimes}
                            onChange={(e) => setEnhancementSometimes(e.target.checked)}
                            className="h-3.5 w-3.5 text-amber-500 rounded border-slate-600 bg-slate-900"
                          />
                          <span className={enhancementSometimes ? 'text-amber-400' : ''}>Sometimes</span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Bonus Damage Dice */}
                  <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bonus Damage Dice
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={damageBonus ? damageBonus.dice.split('d')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          setDamageBonus(undefined);
                        } else {
                          const dieType = damageBonus?.dice.split('d')[1] || '6';
                          setDamageBonus({
                            dice: `${e.target.value}d${dieType}`,
                            type: damageBonus?.type || 'fire',
                            frequency: damageBonus?.frequency || 'per-hit',
                            conditional: damageBonus?.conditional || false,
                          });
                        }
                      }}
                      className="w-20 px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">-</option>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                    <select
                      value={damageBonus ? `d${damageBonus.dice.split('d')[1]}` : ''}
                      onChange={(e) => {
                        if (damageBonus && e.target.value) {
                          const numDice = damageBonus.dice.split('d')[0];
                          const dieType = e.target.value.substring(1);
                          setDamageBonus({
                            ...damageBonus,
                            dice: `${numDice}d${dieType}`,
                          });
                        }
                      }}
                      className="w-24 px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none"
                      disabled={!damageBonus}
                    >
                      <option value="">-</option>
                      {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((die) => (
                        <option key={die} value={die}>
                          {die}
                        </option>
                      ))}
                    </select>
                    {damageBonus && (
                      <select
                        value={damageBonus.type}
                        onChange={(e) =>
                          setDamageBonus({ ...damageBonus, type: e.target.value })
                        }
                        className="flex-1 px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none"
                      >
                        {DAMAGE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {damageBonus && (
                    <div className="mt-3 space-y-2">
                      {!damageBonus.vicious && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setDamageBonus({ ...damageBonus, frequency: 'per-hit' })}
                            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                              (damageBonus.frequency || 'per-hit') === 'per-hit'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Per Hit
                          </button>
                          <button
                            onClick={() => setDamageBonus({ ...damageBonus, frequency: 'per-turn' })}
                            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                              damageBonus.frequency === 'per-turn'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Once Per Turn
                          </button>
                        </div>
                      )}
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={damageBonus.vicious || false}
                          onChange={(e) =>
                            setDamageBonus({ ...damageBonus, vicious: e.target.checked })
                          }
                          className="mr-2.5 h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-slate-300">
                          Vicious (crits only)
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={damageBonus.conditional || false}
                          onChange={(e) =>
                            setDamageBonus({ ...damageBonus, conditional: e.target.checked })
                          }
                          className="mr-2.5 h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                        />
                        <span className="text-sm text-slate-400 group-hover:text-slate-300">
                          Conditional (vs specific creatures)
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Defensive Bonuses - Combined Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      AC Bonus
                    </label>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((value) => (
                        <button
                          key={value}
                          onClick={() => {
                            setAcBonus(value);
                            if (value === 0) setAcBonusSometimes(false);
                          }}
                          className={`flex-1 px-3 py-2 rounded font-medium transition-all ${
                            acBonus === value
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          +{value}
                        </button>
                      ))}
                    </div>
                    {acBonus > 0 && (
                      <label className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={acBonusSometimes}
                          onChange={(e) => setAcBonusSometimes(e.target.checked)}
                          className="h-3.5 w-3.5 text-amber-500 rounded border-slate-600 bg-slate-900"
                        />
                        <span className={acBonusSometimes ? 'text-amber-400' : ''}>Sometimes</span>
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Save Bonus
                    </label>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((value) => (
                        <button
                          key={value}
                          onClick={() => {
                            setSavingThrowBonus(value);
                            if (value === 0) setSaveBonusSometimes(false);
                          }}
                          className={`flex-1 px-3 py-2 rounded font-medium transition-all ${
                            savingThrowBonus === value
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          +{value}
                        </button>
                      ))}
                    </div>
                    {savingThrowBonus > 0 && (
                      <label className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={saveBonusSometimes}
                          onChange={(e) => setSaveBonusSometimes(e.target.checked)}
                          className="h-3.5 w-3.5 text-amber-500 rounded border-slate-600 bg-slate-900"
                        />
                        <span className={saveBonusSometimes ? 'text-amber-400' : ''}>Sometimes</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Weapon Properties - Added Properties (only for weapons) */}
                <AnimatePresence>
                  {isWeaponSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Added Weapon Properties
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {([
                          { id: 'finesse', label: 'Finesse', tooltip: 'Use DEX or STR for attacks' },
                          { id: 'light', label: 'Light', tooltip: 'Enables two-weapon fighting' },
                          { id: 'reach', label: 'Reach', tooltip: '+5 feet reach on attacks' },
                          { id: 'thrown', label: 'Thrown', tooltip: 'Can throw for ranged attack' },
                          { id: 'versatile', label: 'Versatile', tooltip: 'Use with one or two hands' },
                          { id: 'heavy-two-handed', label: 'Heavy / Two-Handed', tooltip: 'Heavy or requires two hands' },
                        ] as const).map((prop) => (
                          <label
                            key={prop.id}
                            className="flex items-center gap-2.5 p-2.5 rounded border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors"
                            title={prop.tooltip}
                          >
                            <input
                              type="checkbox"
                              checked={weaponProperties.includes(prop.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setWeaponProperties([...weaponProperties, prop.id]);
                                } else {
                                  setWeaponProperties(weaponProperties.filter(p => p !== prop.id));
                                }
                              }}
                              className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                            />
                            <span className="text-sm text-slate-300">{prop.label}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Passive Abilities - Collapsible */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-700/50 transition-colors"
              >
                <div>
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide" style={{ fontFamily: 'var(--font-cinzel), Georgia, serif' }}>Passive Abilities</span>
                  <span className="ml-2 text-xs text-slate-500">Senses, Stats, Resistances, & Movement</span>
                </div>
                <span className="text-slate-500 text-lg">{showAdvancedOptions ? '−' : '+'}</span>
              </button>

              {showAdvancedOptions && (
                <div className="px-5 pb-5 space-y-4 border-t border-slate-700">
                  {/* Ability Score */}
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ability Score Modifier
                    </label>
                    <div className="space-y-2">
                      <select
                        value={
                          abilityScoreSetter ? 'set' :
                          abilityScoreBonus ? 'bonus' :
                          ''
                        }
                        onChange={(e) => {
                          if (e.target.value === '') {
                            setAbilityScoreSetter(undefined);
                            setAbilityScoreBonus(undefined);
                          } else if (e.target.value === 'set') {
                            setAbilityScoreBonus(undefined);
                            setAbilityScoreSetter({
                              ability: abilityScoreSetter?.ability || 'STR',
                              setValue: 19
                            });
                          } else if (e.target.value === 'bonus') {
                            setAbilityScoreSetter(undefined);
                            setAbilityScoreBonus({
                              ability: abilityScoreBonus?.ability || 'STR',
                              bonus: 2
                            });
                          }
                        }}
                        className="w-full px-4 py-2.5 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">None</option>
                        <option value="set">Set to value (e.g., STR 19)</option>
                        <option value="bonus">Add bonus (e.g., +2 INT)</option>
                      </select>

                      {(abilityScoreSetter || abilityScoreBonus) && (
                        <div className="flex gap-2">
                          <select
                            value={abilityScoreSetter?.ability || abilityScoreBonus?.ability || ''}
                            onChange={(e) => {
                              const ability = e.target.value as AbilityScoreSetter['ability'];
                              if (abilityScoreSetter) {
                                setAbilityScoreSetter({ ...abilityScoreSetter, ability });
                              } else if (abilityScoreBonus) {
                                setAbilityScoreBonus({ ...abilityScoreBonus, ability });
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="STR">Strength</option>
                            <option value="DEX">Dexterity</option>
                            <option value="CON">Constitution</option>
                            <option value="INT">Intelligence</option>
                            <option value="WIS">Wisdom</option>
                            <option value="CHA">Charisma</option>
                          </select>
                          {abilityScoreSetter && (
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={abilityScoreSetter.setValue}
                              onChange={(e) => setAbilityScoreSetter({
                                ...abilityScoreSetter,
                                setValue: parseInt(e.target.value) || 19
                              })}
                              className="w-20 px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none"
                              placeholder="19"
                            />
                          )}
                          {abilityScoreBonus && (
                            <input
                              type="number"
                              min="1"
                              max="12"
                              value={abilityScoreBonus.bonus}
                              onChange={(e) => setAbilityScoreBonus({
                                ...abilityScoreBonus,
                                bonus: parseInt(e.target.value) || 2
                              })}
                              className="w-20 px-3 py-2 border border-slate-600 rounded-md bg-slate-900 text-slate-100 focus:border-emerald-500 focus:outline-none"
                              placeholder="+2"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Senses & Movement - Collapsible */}
                  <details className="bg-slate-700/30 border border-slate-600 rounded-md font-sans">
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-slate-300 hover:bg-slate-700/50 rounded-md select-none">
                      Senses & Movement
                    </summary>
                    <div className="px-3 pb-3 pt-2 border-t border-slate-600">
                      {/* Flight with Speed and Duration */}
                      <div className="mb-3 p-2.5 rounded border border-slate-600">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={flightEnabled}
                            onChange={(e) => setFlightEnabled(e.target.checked)}
                            className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                          />
                          <span className="text-sm text-slate-300">Flight</span>
                        </label>
                        {flightEnabled && (
                          <div className="mt-2 ml-6 grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Speed (ft)</label>
                              <select
                                value={flySpeed}
                                onChange={(e) => setFlySpeed(parseInt(e.target.value))}
                                className="w-full px-2 py-1.5 text-sm border border-slate-600 rounded bg-slate-900 text-slate-100"
                              >
                                <option value={30}>30 ft</option>
                                <option value={40}>40 ft</option>
                                <option value={50}>50 ft</option>
                                <option value={60}>60 ft</option>
                                <option value={80}>80 ft</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Duration</label>
                              <select
                                value={flyDuration === 'unlimited' ? 'unlimited' : flyDuration}
                                onChange={(e) => setFlyDuration(e.target.value === 'unlimited' ? 'unlimited' : parseInt(e.target.value))}
                                className="w-full px-2 py-1.5 text-sm border border-slate-600 rounded bg-slate-900 text-slate-100"
                              >
                                <option value={1}>1 hr/day</option>
                                <option value={2}>2 hrs/day</option>
                                <option value={4}>4 hrs/day</option>
                                <option value={8}>8 hrs/day</option>
                                <option value="unlimited">Unlimited</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2.5 p-2.5 rounded border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={permanentBuffs.darkvision || false}
                            onChange={(e) => setPermanentBuffs({ ...permanentBuffs, darkvision: e.target.checked })}
                            className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                          />
                          <span className="text-sm text-slate-300">Darkvision</span>
                        </label>

                        <label className="flex items-center gap-2.5 p-2.5 rounded border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={permanentBuffs.speedBonus || false}
                            onChange={(e) => setPermanentBuffs({ ...permanentBuffs, speedBonus: e.target.checked })}
                            className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                          />
                          <span className="text-sm text-slate-300">+10 ft Speed</span>
                        </label>

                        <label className="flex items-center gap-2.5 p-2.5 rounded border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={permanentBuffs.blindsight || false}
                            onChange={(e) => setPermanentBuffs({ ...permanentBuffs, blindsight: e.target.checked })}
                            className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                          />
                          <span className="text-sm text-slate-300">Blindsight</span>
                        </label>

                        <label className="flex items-center gap-2.5 p-2.5 rounded border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={permanentBuffs.climbBurrow || false}
                            onChange={(e) => setPermanentBuffs({ ...permanentBuffs, climbBurrow: e.target.checked })}
                            className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                          />
                          <span className="text-sm text-slate-300">Climb/Burrow</span>
                        </label>

                        <label className="flex items-center gap-2.5 p-2.5 rounded border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={permanentBuffs.tremorsense || false}
                            onChange={(e) => setPermanentBuffs({ ...permanentBuffs, tremorsense: e.target.checked })}
                            className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                          />
                          <span className="text-sm text-slate-300">Tremorsense</span>
                        </label>
                      </div>
                    </div>
                  </details>

                  {/* Damage Resistances - Collapsible */}
                  <details className="bg-slate-700/30 border border-slate-600 rounded-md font-sans">
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-slate-300 hover:bg-slate-700/50 rounded-md select-none">
                      Damage Resistances
                      {resistances.length > 0 && (
                        <span className="ml-2 text-xs text-slate-500">({resistances.length} selected{resistancesSometimes ? ', sometimes' : ''})</span>
                      )}
                    </summary>
                    <div className="px-3 pb-3 pt-2 border-t border-slate-600">
                      <div className="grid grid-cols-2 gap-2">
                        {DAMAGE_TYPES.map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2.5 p-2.5 rounded border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={resistances.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setResistances([...resistances, type]);
                                } else {
                                  setResistances(resistances.filter(r => r !== type));
                                  if (resistances.length <= 1) setResistancesSometimes(false);
                                }
                              }}
                              className="h-4 w-4 text-emerald-600 rounded border-slate-600 bg-slate-900"
                            />
                            <span className="text-sm text-slate-300">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                      {resistances.length > 0 && (
                        <label className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-600 text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                          <input
                            type="checkbox"
                            checked={resistancesSometimes}
                            onChange={(e) => setResistancesSometimes(e.target.checked)}
                            className="h-3.5 w-3.5 text-amber-500 rounded border-slate-600 bg-slate-900"
                          />
                          <span className={resistancesSometimes ? 'text-amber-400' : ''}>Sometimes</span>
                        </label>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Spells & Abilities */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Spells & Abilities</h2>
              <div className="space-y-4">

                  {/* Collapsible Helper Guide */}
                  <details className="mb-3 bg-slate-700/30 border border-slate-600 rounded-md">
                    <summary className="px-3 py-2 cursor-pointer text-sm font-medium text-slate-300 hover:bg-slate-700/50 rounded-md select-none">
                      Spell Level Guide
                    </summary>
                    <div className="px-3 py-3 text-xs text-slate-300 space-y-2 border-t border-slate-600">
                      <p className="text-slate-400 text-[11px] mb-2">
                        Find the spell most similar to your custom effect. Use that spell level.
                      </p>

                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Level 0 (Cantrip)</span>
                          <span className="text-slate-500">Light, Mage Hand</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Level 1-2</span>
                          <span className="text-slate-500">Magic Missile, Invisibility</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span>Level 3 (AoE unlocks)</span>
                          <span className="text-emerald-500">Fireball, Lightning Bolt</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Level 4-5</span>
                          <span className="text-slate-500">Wall of Fire, Polymorph</span>
                        </div>
                        <div className="flex justify-between text-amber-400">
                          <span>Level 6+</span>
                          <span className="text-amber-500">Disintegrate, Wish</span>
                        </div>
                      </div>

                      <p className="text-slate-500 italic text-[10px] pt-2 border-t border-slate-600">
                        Sword shoots lightning? Lv3. Adds 1d6 fire? Lv1.
                      </p>
                    </div>
                  </details>

                  {/* Charge Pool Configuration */}
                  {(maxCharges > 0 || chargesPerShortRest > 0 || chargesPerLongRest > 0 || abilities.length > 0) && (
                    <div className="mb-4 p-3 bg-slate-700/30 rounded border border-slate-600">
                      <label className="block text-xs font-medium text-slate-400 mb-2">
                        Charge Pool
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Max</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={maxCharges === 0 ? '' : maxCharges}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[0-9]+$/.test(val)) {
                                setMaxCharges(val === '' ? 0 : parseInt(val));
                              }
                            }}
                            className="w-full px-2 py-1.5 border border-slate-600 rounded bg-slate-900 text-slate-100 text-sm focus:border-emerald-500 focus:outline-none"
                            placeholder="7"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Short Rest</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={chargesPerShortRest === 0 ? '' : chargesPerShortRest}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[0-9]+$/.test(val)) {
                                setChargesPerShortRest(val === '' ? 0 : parseInt(val));
                              }
                            }}
                            className="w-full px-2 py-1.5 border border-slate-600 rounded bg-slate-900 text-slate-100 text-sm focus:border-emerald-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Long Rest</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={chargesPerLongRest === 0 ? '' : chargesPerLongRest}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[0-9]+$/.test(val)) {
                                setChargesPerLongRest(val === '' ? 0 : parseInt(val));
                              }
                            }}
                            className="w-full px-2 py-1.5 border border-slate-600 rounded bg-slate-900 text-slate-100 text-sm focus:border-emerald-500 focus:outline-none"
                            placeholder="4"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Abilities List */}
                  {abilities.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {abilities.map((ability, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-700/50 p-3 rounded border border-slate-600"
                        >
                          <div className="text-sm text-slate-300">
                            <span className="font-medium">{ability.spell}</span>
                            <span className="text-slate-500"> Lv{ability.spellLevel}, {ability.chargesPerUse}ch</span>
                          </div>
                          <button
                            onClick={() => removeAbility(index)}
                            className="text-slate-500 hover:text-red-400 text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Ability Form */}
                  {showChargeForm ? (
                    <div className="space-y-3 p-4 bg-slate-700/50 rounded border border-slate-600">
                      <div>
                        <input
                          type="text"
                          value={newAbility.spell}
                          onChange={(e) => {
                            setSpellNameError(false);
                            setNewAbility({ ...newAbility, spell: e.target.value });
                          }}
                          placeholder="Spell/Ability name"
                          className={`w-full px-3 py-2 border rounded bg-slate-900 text-slate-100 text-sm focus:outline-none transition-colors ${
                            spellNameError
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-slate-600 focus:border-emerald-500'
                          }`}
                        />
                        {spellNameError && (
                          <p className="text-xs text-red-400 mt-1">Please enter a spell or ability name</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Spell Level</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newAbility.spellLevel === 0 ? '' : newAbility.spellLevel}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[0-9]$/.test(val)) {
                                setNewAbility({
                                  ...newAbility,
                                  spellLevel: val === '' ? 0 : Math.min(9, parseInt(val)),
                                });
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                setNewAbility({ ...newAbility, spellLevel: 0 });
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-900 text-slate-100 text-sm focus:border-emerald-500 focus:outline-none"
                            placeholder="0-9"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 mb-1">Charges/Use</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={newAbility.chargesPerUse === 1 ? '' : newAbility.chargesPerUse}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^[0-9]+$/.test(val)) {
                                setNewAbility({
                                  ...newAbility,
                                  chargesPerUse: val === '' ? 1 : Math.max(1, parseInt(val)),
                                });
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                setNewAbility({ ...newAbility, chargesPerUse: 1 });
                              }
                            }}
                            className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-900 text-slate-100 text-sm focus:border-emerald-500 focus:outline-none"
                            placeholder="1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addAbility}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 text-sm font-medium transition-colors"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowChargeForm(false);
                            setSpellNameError(false);
                          }}
                          className="px-4 py-2 bg-slate-600 text-slate-300 rounded hover:bg-slate-500 text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowChargeForm(true)}
                      className="w-full px-4 py-3 border border-dashed border-slate-600 rounded text-slate-500 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      + Add Spell or Ability
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="relative bg-slate-800 text-slate-100 rounded-lg shadow-xl p-6 text-sm border border-slate-700">
              {/* Empty state when no attributes selected */}
              {!hasSelectedAttributes && (
                <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center z-10">
                  <div className="text-center px-8 py-12">
                    <div className="text-4xl mb-4 opacity-30">⚔️</div>
                    <div className="text-lg font-medium text-slate-400 mb-2">
                      Configure Your Item
                    </div>
                    <div className="text-sm text-slate-500">
                      Select a base item and add bonuses to see the suggested rarity
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {/* Suggested Rarity - THE ANSWER */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Suggested Rarity</span>
                    <span className="text-sm font-mono text-slate-500">
                      <AnimatedNumber value={results.combatScore} /> pts
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${getRarityColorClass(results.suggestedRarity)}`}>
                    {results.suggestedRarity}
                  </div>
                </div>

                {/* What's Similar? - Reference Comparisons */}
                {topAnchors.length > 0 && baseItem && hasSelectedAttributes && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">What&apos;s Similar?</span>
                      <span
                        className="text-slate-500 hover:text-slate-300 cursor-help text-xs"
                        title="Compare your item's power level against official SRD items with similar properties."
                      >
                        ⓘ
                      </span>
                    </div>

                    <div className="space-y-3">
                      {topAnchors.slice(0, 3).map((anchorData, index) => {
                        const { anchor, anchorScore, comparison } = anchorData;
                        const warnings = getWarningIndicator(anchor.name);
                        const scoreDiff = results.combatScore - anchorScore;
                        const hasWarnings = warnings.hasSpecial || warnings.hasCommunity;
                        const isExpanded = expandedItemInfo === anchor.name;

                        return (
                          <div key={index} className={`rounded-lg overflow-hidden border-2 ${getMedalBorderClass(index)}`}>
                            {/* Side-by-Side Cards */}
                            <div className="grid grid-cols-2">
                              {/* LEFT: Your Item */}
                              <div className={`${getRarityBgClass(results.suggestedRarity)} p-3 border-r border-slate-700`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-200 font-semibold text-sm truncate">{itemName || 'Your Item'}</span>
                                  {attunement && <span title="Requires Attunement" className="text-[10px] px-1 py-0.5 bg-violet-900/50 text-violet-300 rounded">A</span>}
                                </div>
                                <div className="text-xs mb-2">
                                  <span className="font-mono text-slate-300"><AnimatedNumber value={results.combatScore} /> pts</span>
                                  <span className="mx-1 text-slate-600">•</span>
                                  <span className={`font-medium ${getRarityColorClass(results.suggestedRarity)}`}>{results.suggestedRarity}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 space-y-0.5">
                                  {enhancement > 0 && <div>+{enhancement} enhancement{enhancementSometimes ? ' ½' : ''}</div>}
                                  {damageBonus && <div>{damageBonus.dice} {damageBonus.type}{damageBonus.vicious ? ' (crit)' : ''}{damageBonus.frequency === 'per-turn' ? ' /turn' : ''}</div>}
                                  {acBonus > 0 && <div>+{acBonus} AC{acBonusSometimes ? ' ½' : ''}</div>}
                                  {savingThrowBonus > 0 && <div>+{savingThrowBonus} saves{saveBonusSometimes ? ' ½' : ''}</div>}
                                  {abilityScoreSetter && <div>{abilityScoreSetter.ability} → {abilityScoreSetter.setValue}</div>}
                                  {flightEnabled && <div>Flight {flySpeed}ft {flyDuration === 'unlimited' ? '∞' : `${flyDuration}h`}</div>}
                                  {resistances.length > 0 && <div>Resist: {resistances.join(', ')}{resistancesSometimes ? ' ½' : ''}</div>}
                                  {abilities.length > 0 && <div>{abilities.length} spell{abilities.length > 1 ? 's' : ''}</div>}
                                  {maxCharges > 0 && <div>{maxCharges} charges</div>}
                                </div>
                              </div>

                              {/* RIGHT: Reference Item */}
                              <div className={`${getRarityBgClass(anchor.rarity || 'common')} p-3`}>
                                <div className="flex items-center justify-between mb-2">
                                  {anchor.dndbeyondSlug ? (
                                    <a
                                      href={`https://www.dndbeyond.com/magic-items/${anchor.dndbeyondSlug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-slate-200 font-semibold text-sm truncate hover:underline hover:text-slate-100 transition-colors"
                                      title="View on D&D Beyond"
                                    >
                                      {anchor.name}
                                    </a>
                                  ) : (
                                    <span className="text-slate-200 font-semibold text-sm truncate">{anchor.name}</span>
                                  )}
                                  <div className="flex items-center gap-1">
                                    {hasWarnings && (
                                      <button
                                        onClick={() => setExpandedItemInfo(isExpanded ? null : anchor.name)}
                                        title="View notes"
                                        className="text-[10px] px-1 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                                      >
                                        ℹ
                                      </button>
                                    )}
                                    {anchor.attunement && <span title="Requires Attunement" className="text-[10px] px-1 py-0.5 bg-violet-900/50 text-violet-300 rounded">A</span>}
                                  </div>
                                </div>
                                <div className="text-xs mb-2">
                                  <span className="font-mono text-slate-300">{anchorScore.toFixed(1)} pts</span>
                                  <span className="mx-1 text-slate-600">•</span>
                                  <span className={`font-medium ${getRarityColorClass(anchor.rarity || 'common')}`}>{capitalizeRarity(anchor.rarity || 'common')}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 space-y-0.5">
                                  {anchor.combat.enhancement > 0 && <div>+{anchor.combat.enhancement} enhancement</div>}
                                  {anchor.combat.damageBonus && <div>{anchor.combat.damageBonus.dice} {anchor.combat.damageBonus.type}{anchor.combat.damageBonus.vicious ? ' (crit)' : ''}{anchor.combat.damageBonus.conditionalType ? ` (${anchor.combat.damageBonus.conditionalType})` : ''}</div>}
                                  {anchor.combat.acBonus && <div>+{anchor.combat.acBonus} AC</div>}
                                  {anchor.combat.savingThrowBonus && <div>+{anchor.combat.savingThrowBonus} saves</div>}
                                  {anchor.combat.abilityScoreSetter && <div>{anchor.combat.abilityScoreSetter.ability} → {anchor.combat.abilityScoreSetter.setValue}</div>}
                                  {anchor.combat.flight && <div>Flight {anchor.combat.flight.flySpeed || 30}ft {anchor.combat.flight.flyDuration === 'unlimited' ? '∞' : `${anchor.combat.flight.flyDuration || anchor.combat.flight.hoursPerDay}h`}</div>}
                                  {anchor.combat.resistances && anchor.combat.resistances.length > 0 && <div>Resist: {anchor.combat.resistances.join(', ')}</div>}
                                  {anchor.combat.charges && <div>{anchor.combat.charges.length} spell{anchor.combat.charges.length > 1 ? 's' : ''}</div>}
                                  {anchor.combat.advantage && <div>Adv: {anchor.combat.advantage.join(', ')}</div>}
                                  {anchor.combat.handsFreeDef && <div>Hands-free defense</div>}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Info Panel */}
                            {isExpanded && warnings.explanation && (
                              <div className="bg-slate-800 px-3 py-2 border-t border-slate-700">
                                <div className="text-[11px] text-slate-400">
                                  {warnings.hasSpecial && <span className="text-amber-400">⭐ Special: </span>}
                                  {warnings.hasCommunity && <span className="text-sky-400">💬 Note: </span>}
                                  {warnings.explanation}
                                </div>
                              </div>
                            )}

                            {/* Difference Summary */}
                            <div className="bg-slate-900/50 px-3 py-2 border-t border-slate-700">
                              <div className="flex items-center justify-between">
                                <div className="text-xs">
                                  {Math.abs(scoreDiff) < 0.3 ? (
                                    <span className="text-slate-400">≈ Similar power</span>
                                  ) : scoreDiff > 0 ? (
                                    <span className="text-amber-400/90">+{scoreDiff.toFixed(1)} pts stronger</span>
                                  ) : (
                                    <span className="text-sky-400/90">{scoreDiff.toFixed(1)} pts weaker</span>
                                  )}
                                </div>
                                {Math.abs(scoreDiff) >= 0.3 && comparison.details.length > 0 && (
                                  <div className="text-[10px] text-slate-500 truncate max-w-[60%] text-right">
                                    {comparison.details[0]}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}


              </div>
            </div>

            {/* Your Item Preview - Separate Card */}
            {hasSelectedAttributes && baseItem && (
              <div className="mt-4 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Your Item</span>
                  <span
                    className="text-slate-500 hover:text-slate-300 cursor-help text-xs"
                    title="Preview your item as it would appear in a D&D sourcebook. Click attributes to hide them from the preview."
                  >
                    ⓘ
                  </span>
                </div>

                {/* DMG-Style Item Card */}
                <div className="relative bg-gradient-to-b from-amber-950/10 via-slate-800/50 to-slate-800/50">
                  {/* Decorative top border accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />

                  <div className="p-5 space-y-4">
                    {/* Item Name - Large, ornate */}
                    <div className="border-b border-amber-900/30 pb-3">
                      <h3
                        className={`text-2xl font-bold tracking-wide ${getRarityColorClass(results.suggestedRarity)}`}
                        style={{ fontFamily: 'var(--font-cinzel), Georgia, serif' }}
                      >
                        {getDisplayName()}
                      </h3>
                      {/* Type Line - Italic, smaller */}
                      <p className="text-sm italic text-slate-400 mt-1">
                        {buildTypeLine()}
                      </p>
                    </div>

                    {/* Attributes Section */}
                    {previewAttributes.length > 0 && (
                      <div className="space-y-2.5">
                        {previewAttributes.map((attr) => (
                          <div
                            key={attr.key}
                            className={`group flex items-start gap-2 text-sm transition-all cursor-pointer ${
                              hiddenAttributes.has(attr.key)
                                ? 'opacity-30 line-through'
                                : 'opacity-100'
                            }`}
                            onClick={() => toggleAttributeVisibility(attr.key)}
                            title={hiddenAttributes.has(attr.key) ? 'Click to show in preview' : 'Click to hide from preview'}
                          >
                            <span className="text-amber-600/70 select-none">•</span>
                            <span className="text-slate-300">
                              <span className="font-semibold text-slate-200">{attr.label}.</span>{' '}
                              {attr.value}
                            </span>
                            <span className={`ml-auto text-[10px] transition-opacity ${
                              hiddenAttributes.has(attr.key)
                                ? 'opacity-100 text-emerald-400'
                                : 'opacity-0 group-hover:opacity-100 text-slate-500'
                            }`}>
                              {hiddenAttributes.has(attr.key) ? 'show' : 'hide'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* User Description Textarea */}
                    <div className="pt-3 border-t border-amber-900/20">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                        Description
                      </label>
                      <textarea
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        placeholder="Describe your item's special properties, abilities, history or appearance..."
                        rows={4}
                        className="w-full px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 bg-slate-900/50 border border-slate-700 rounded-md focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 resize-none"
                        style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
                      />
                    </div>

                    {/* Generate Preview Button */}
                    <div className="pt-4">
                      <button
                        onClick={generatePreviewImage}
                        className="w-full px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/40 text-amber-200 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Generate Print Preview
                      </button>
                    </div>
                  </div>

                  {/* Decorative bottom border accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
                </div>

                {/* Footer with hidden attributes hint */}
                {hiddenAttributes.size > 0 && (
                  <div className="px-5 py-2 border-t border-slate-700 bg-slate-800/50">
                    <p className="text-[10px] text-slate-500 italic">
                      {hiddenAttributes.size} attribute{hiddenAttributes.size > 1 ? 's' : ''} hidden from preview
                    </p>
                  </div>
                )}

                {/* Generated Image Preview */}
                {previewImageUrl && (
                  <div className="p-5 border-t border-slate-700 bg-slate-900/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Print Preview</span>
                      <button
                        onClick={() => setPreviewImageUrl(null)}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={previewImageUrl}
                        alt={`${getDisplayName()} - ${results.suggestedRarity}`}
                        className="max-w-full rounded-lg shadow-xl border border-slate-600 cursor-pointer"
                        title="Right-click to save image"
                      />
                    </div>
                    <p className="text-center text-[10px] text-slate-500 mt-3">
                      Right-click the image to copy or save
                    </p>
                  </div>
                )}

                {/* Hidden canvas for image generation */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>
        </div>

        {/* Formula Details - Collapsed by default */}
        <div className="mt-6">
          <div className="bg-slate-800/50 text-slate-100 rounded-lg text-sm border border-slate-700">
            <button
              onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              className="w-full px-5 py-3 text-left text-slate-500 hover:text-slate-300 text-xs flex items-center justify-between transition-colors"
            >
              <span>Formula Details</span>
              <span>{showFormulaDetails ? '−' : '+'}</span>
            </button>

            {showFormulaDetails && (
              <div className="px-6 pb-6 text-xs text-slate-400">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Base Values:</div>
                      <div>• Enhancement: 1 point per +1</div>
                      <div>• AC Bonus: 1 pt/+1 on armor/shields, <span className="text-amber-400">1.5 pt/+1 on other items</span></div>
                      <div className="text-slate-500 pl-2 text-[10px]">(Non-armor AC stacks with armor, breaking bounded accuracy)</div>
                      <div>• Saving Throw Bonus: 1 point per +1</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Damage Dice:</div>
                      <div>• 1d4 = 0.5 pts, 1d6 = 1 pt, 1d8 = 1.25 pts, 1d10 = 1.5 pts, 1d12 = 1.75 pts</div>
                      <div>• 2d6 = 2 pts, 2d8 = 2.5 pts, 3d6 = 3 pts, 3d8 = 3.75 pts, 4d6 = 4 pts</div>
                      <div className="text-slate-500">• Vicious (crit only): ×0.05 (5% proc rate, e.g. 2d6 vicious = ~0.35 pts)</div>
                      <div className="text-slate-500">• Per-turn frequency: ×0.4 (once per turn vs every hit)</div>
                      <div className="text-slate-500">• Conditional damage by type:</div>
                      <div className="text-slate-500 pl-2">- Creature-common (undead, fiends): ×0.6</div>
                      <div className="text-slate-500 pl-2">- Creature-rare (giants, dragons): ×0.4</div>
                      <div className="text-slate-500 pl-2">- Sworn-enemy (declared target): ×0.6</div>
                      <div className="text-slate-500 pl-2">- Environmental (darkness, water): ×0.25</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Damage Type Multipliers:</div>
                      <div>• Strong (fewer resistances): Force ×1.2, Psychic ×1.15, Radiant ×1.1</div>
                      <div>• Neutral (baseline): Fire, Cold, Lightning, Thunder, Acid, Physical ×1.0</div>
                      <div>• Weak (more resistances): Necrotic ×0.9, Poison ×0.7</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Ability Scores:</div>
                      <div>• Setter (19): 1.5 pts | Setter (20): 2.0 pts | Setter (21): 3.0 pts | Setter (23+): 3.5+ pts</div>
                      <div className="text-slate-500 pl-2">Ability multipliers: CON ×1.34, DEX ×1.17, others ×1.0</div>
                      <div>• Bonus: ×0.75 per point (e.g., +2 bonus = 1.5 pts)</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Permanent Buffs:</div>
                      <div>• Flight: 2.0 pts (tactical dominance, ranged immunity)</div>
                      <div>• Blindsight: 0.75 pts (see invisible, through illusions)</div>
                      <div>• Speed Bonus: 0.5 pts (+10 ft movement)</div>
                      <div>• Tremorsense: 0.5 pts (detect via vibrations)</div>
                      <div>• Climb/Burrow: 0.5 pts (vertical/underground mobility)</div>
                      <div>• Darkvision: 0.25 pts (many races have this)</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Resistances:</div>
                      <div>• 2.0 points per damage type resisted</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Spell/Ability Charges:</div>
                      <div>• Formula: effective_level × uses_per_day × recharge_mult</div>
                      <div>• Dawn/Long Rest: ×0.1-0.2 | Short Rest: ×0.2-0.4</div>
                      <div className="text-slate-500">• High-level spell scaling (effective value):</div>
                      <div className="text-slate-500 pl-2">- Levels 1-5: linear (1, 2, 3, 4, 5)</div>
                      <div className="text-slate-500 pl-2">- Level 6-7: 7, 10 | Level 8-9: 14, 20</div>
                      <div className="text-slate-500 italic text-[10px]">
                        Level 9 spells (Wish) are campaign-defining, hence 20× effective value.
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Rarity Thresholds:</div>
                      <div>• Common: &lt;1.0 pts | Uncommon: 1.0-1.9 pts | Rare: 2.0-2.9 pts</div>
                      <div>• Very Rare: 3.0-3.9 pts | Legendary: 4.0+ pts</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-200 font-semibold">Attunement:</div>
                      <div className="text-slate-300 text-[11px]">
                        Attunement does <span className="text-slate-500">not</span> modify scores. Official 5e pricing is inconsistent—Cloak of Protection (+1 AC/saves, Uncommon) vs Ring of Protection (identical stats, Rare).
                      </div>
                      <div className="text-slate-500 italic text-[10px] mt-1">
                        When comparing, prioritize reference items with matching attunement. The 3-slot limit means attunement is an &quot;opportunity cost&quot; that varies by build.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-slate-200 font-semibold">Reference Item Discrepancy Categories:</div>
                    <div className="space-y-3">
                      <div className="bg-slate-700/30 border border-slate-600 rounded p-3">
                        <div className="text-slate-300 font-semibold mb-1">⭐ Special Mechanics</div>
                        <div className="text-slate-400 text-[11px]">
                          These items grant bonuses that can&apos;t be expressed in numbers (e.g., flight, invisibility, instant kill). Understand the item&apos;s effect and add something similar of your own to match the reference!
                        </div>
                      </div>
                      <div className="bg-slate-700/30 border border-slate-600 rounded p-3">
                        <div className="text-slate-300 font-semibold mb-1">🔢 Numerical Edge Case</div>
                        <div className="text-slate-400 text-[11px]">
                          These items can be quantified, but only when rare or subjective circumstances occur. For example, a &quot;natural 20 when attacking a humanoid&quot; and &quot;25 extra damage only against dragons in the dark&quot; can only be quantified on an adventure-by-adventure basis. Understand your setting and circumstances and compensate accordingly.
                        </div>
                      </div>
                      <div className="bg-slate-700/30 border border-slate-600 rounded p-3">
                        <div className="text-slate-300 font-semibold mb-1">💬 Community Note</div>
                        <div className="text-slate-400 text-[11px]">
                          This item is probably underpowered. Take this reference with a grain of salt.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
