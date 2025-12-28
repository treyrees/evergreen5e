'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MagicItem, DamageBonus, SpellCharge, ChargedAbility, ChargePool } from '@/types/magic-item';
import {
  calculateCombatScore,
  getSuggestedRarity,
  findTopAnchorItems,
} from '@/lib/calculator';
import { getWarningIndicator } from '@/lib/item-balance-flags';

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

const DAMAGE_DICE = ['1d4', '1d6', '1d8', '1d10', '2d6', '2d8', '3d6', '3d8', '4d6'];

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
  const [baseItem, setBaseItem] = useState('club');
  const [enhancement, setEnhancement] = useState(0);
  const [damageBonus, setDamageBonus] = useState<DamageBonus | undefined>(
    undefined
  );
  const [acBonus, setAcBonus] = useState(0);
  const [savingThrowBonus, setSavingThrowBonus] = useState(0);
  const [resistances, setResistances] = useState<string[]>([]);
  const [attunement, setAttunement] = useState(false);

  // Charge pool state (new intuitive system)
  const [maxCharges, setMaxCharges] = useState(0);
  const [chargesPerShortRest, setChargesPerShortRest] = useState(0);
  const [chargesPerLongRest, setChargesPerLongRest] = useState(0);
  const [abilities, setAbilities] = useState<ChargedAbility[]>([]);

  // UI state
  const [numAnchorsToShow, setNumAnchorsToShow] = useState(1);
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [newAbility, setNewAbility] = useState<ChargedAbility>({
    spell: '',
    spellLevel: 0,
    chargesPerUse: 1,
  });

  const currentItem: Partial<MagicItem> = useMemo(() => ({
    name: itemName || 'Unnamed Item',
    baseItem,
    combat: {
      enhancement,
      damageBonus,
      acBonus: acBonus > 0 ? acBonus : undefined,
      savingThrowBonus: savingThrowBonus > 0 ? savingThrowBonus : undefined,
      resistances: resistances.length > 0 ? resistances : undefined,
      chargePool: (maxCharges > 0 || abilities.length > 0) ? {
        maxCharges,
        chargesPerShortRest,
        chargesPerLongRest,
        abilities,
      } : undefined,
    },
    attunement,
  }), [itemName, baseItem, enhancement, damageBonus, acBonus, savingThrowBonus, resistances, maxCharges, chargesPerShortRest, chargesPerLongRest, abilities, attunement]);

  const results = useMemo(() => getSuggestedRarity(currentItem), [currentItem]);
  const topAnchors = useMemo(() => findTopAnchorItems(currentItem, 3), [currentItem]);

  const addAbility = () => {
    if (newAbility.spell.trim()) {
      setAbilities([...abilities, newAbility]);
      setNewAbility({
        spell: '',
        spellLevel: 0,
        chargesPerUse: 1,
      });
      setShowChargeForm(false);
    }
  };

  const removeAbility = (index: number) => {
    setAbilities(abilities.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Magic Item Calculator
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Build your custom magic item
            </p>
          </div>
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Item Builder */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                Item Builder
              </h2>
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Basic Info
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g., Sword of Flames"
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Base Item Type
                    </label>
                    <select
                      value={baseItem}
                      onChange={(e) => setBaseItem(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="attunement"
                      checked={attunement}
                      onChange={(e) => setAttunement(e.target.checked)}
                      className="mr-2 h-4 w-4 text-emerald-600 rounded"
                    />
                    <label
                      htmlFor="attunement"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Requires Attunement
                    </label>
                  </div>
                </div>

                {/* Combat Features Section */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Combat Features
                  </h3>
                  {/* Attack/Damage Bonus */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Attack/Damage Bonus
                    </label>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map((value) => (
                        <button
                          key={value}
                          onClick={() => setEnhancement(value)}
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            enhancement === value
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          +{value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Damage Bonus */}
                  <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Damage Bonus
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={damageBonus?.dice || ''}
                      onChange={(e) =>
                        setDamageBonus(
                          e.target.value
                            ? {
                                dice: e.target.value,
                                type: damageBonus?.type || 'fire',
                                conditional: damageBonus?.conditional || false,
                              }
                            : undefined
                        )
                      }
                      className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">None</option>
                      {DAMAGE_DICE.map((dice) => (
                        <option key={dice} value={dice}>
                          {dice}
                        </option>
                      ))}
                    </select>
                    {damageBonus && (
                      <select
                        value={damageBonus.type}
                        onChange={(e) =>
                          setDamageBonus({ ...damageBonus, type: e.target.value })
                        }
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
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
                    <div className="mt-2 flex items-center">
                      <input
                        type="checkbox"
                        id="conditional-damage"
                        checked={damageBonus.conditional || false}
                        onChange={(e) =>
                          setDamageBonus({ ...damageBonus, conditional: e.target.checked })
                        }
                        className="mr-2 h-4 w-4 text-emerald-600 rounded"
                      />
                      <label
                        htmlFor="conditional-damage"
                        className="text-sm text-slate-600 dark:text-slate-400"
                      >
                        Conditional (only vs specific creatures, e.g. dragons/giants)
                      </label>
                    </div>
                  )}
                </div>

                {/* AC Bonus */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    AC Bonus
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((value) => (
                      <button
                        key={value}
                        onClick={() => setAcBonus(value)}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          acBonus === value
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        +{value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saving Throw Bonus */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Saving Throw Bonus
                  </label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((value) => (
                      <button
                        key={value}
                        onClick={() => setSavingThrowBonus(value)}
                        className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          savingThrowBonus === value
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        +{value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spells & Spell-Like Abilities */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Spells & Spell-Like Abilities
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 italic">
                    For non-spell abilities, estimate equivalent spell level (0 for cantrip-like, 1-9 for leveled spells)
                  </p>

                  {/* Abilities List */}
                  {abilities.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {abilities.map((ability, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-md"
                        >
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-medium">{ability.spell}</span>
                            {' (Level '}{ability.spellLevel}{', '}{ability.chargesPerUse} charge{ability.chargesPerUse !== 1 ? 's' : ''})
                          </div>
                          <button
                            onClick={() => removeAbility(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Ability Form */}
                  {showChargeForm ? (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
                      {/* Charge Pool Configuration */}
                      <div className="pb-3 border-b border-slate-300 dark:border-slate-600">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          Item Charge Pool
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Max Charges
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={maxCharges}
                              onChange={(e) => setMaxCharges(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                              placeholder="7"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Per Short Rest
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={chargesPerShortRest}
                              onChange={(e) => setChargesPerShortRest(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Per Long Rest
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={chargesPerLongRest}
                              onChange={(e) => setChargesPerLongRest(parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                              placeholder="4"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Ability Details */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          Ability Details
                        </label>
                        <input
                          type="text"
                          value={newAbility.spell}
                          onChange={(e) =>
                            setNewAbility({ ...newAbility, spell: e.target.value })
                          }
                          placeholder="Spell/Ability name"
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Spell Level (0-9)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="9"
                              value={newAbility.spellLevel}
                              onChange={(e) =>
                                setNewAbility({
                                  ...newAbility,
                                  spellLevel: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                              placeholder="0 = cantrip"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                              Charges Per Use
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={newAbility.chargesPerUse}
                              onChange={(e) =>
                                setNewAbility({
                                  ...newAbility,
                                  chargesPerUse: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addAbility}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium"
                        >
                          Add Ability
                        </button>
                        <button
                          onClick={() => setShowChargeForm(false)}
                          className="px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-400 dark:hover:bg-slate-500 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowChargeForm(true)}
                      className="w-full px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md text-slate-600 dark:text-slate-400 hover:border-emerald-600 hover:text-emerald-600 transition-colors"
                    >
                      + Add Spell or Ability
                    </button>
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-slate-900 text-slate-100 rounded-lg shadow-xl p-6 font-mono text-sm">
              <div className="border-b border-slate-700 pb-4 mb-4">
                <div className="text-center text-lg font-bold">
                  {currentItem.name?.toUpperCase() || 'UNNAMED ITEM'}
                </div>
              </div>

              <div className="space-y-4">
                {/* Suggested Rarity - THE ANSWER */}
                <div className="bg-emerald-900/30 border border-emerald-700 rounded-md p-4">
                  <div className="text-emerald-400 font-bold mb-2">
                    📊 SUGGESTED RARITY
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {results.suggestedRarity}
                    </div>
                    <div className="text-xs text-slate-300">
                      {results.explanation}
                    </div>
                  </div>
                </div>

                {/* Anchor Items - References for Comparison */}
                {topAnchors.length > 0 && (
                  <div className="border-t border-slate-700 pt-4">
                    <div className="text-emerald-400 font-bold mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚓</span>
                        <span>ANCHOR ITEMS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setNumAnchorsToShow(Math.max(1, numAnchorsToShow - 1))}
                          disabled={numAnchorsToShow <= 1}
                          className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-sm"
                        >
                          −
                        </button>
                        <span className="text-xs text-slate-400 w-3 text-center">{numAnchorsToShow}</span>
                        <button
                          onClick={() => setNumAnchorsToShow(Math.min(3, numAnchorsToShow + 1))}
                          disabled={numAnchorsToShow >= 3}
                          className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded text-white text-sm"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {topAnchors.slice(0, numAnchorsToShow).map((anchorData, index) => {
                        const { anchor, anchorScore, comparison } = anchorData;
                        const warnings = getWarningIndicator(anchor.name);

                        // Check if anchor is unbalanced
                        const isUnbalanced = anchor.rarity && (() => {
                          const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];
                          const anchorCalculatedRarity = anchorScore < 1 ? 'Common' :
                            anchorScore < 2 ? 'Uncommon' :
                            anchorScore < 3 ? 'Rare' :
                            anchorScore < 4 ? 'Very Rare' : 'Legendary';
                          const idx1 = rarityOrder.findIndex(r => r.toLowerCase() === anchorCalculatedRarity.toLowerCase());
                          const idx2 = rarityOrder.findIndex(r => r.toLowerCase() === anchor.rarity!.toLowerCase());
                          return Math.abs(idx1 - idx2) >= 2;
                        })();

                        return (
                          <div key={index} className={`${index > 0 ? 'border-t border-slate-700 pt-4' : ''} bg-slate-800/30 rounded-lg p-3`}>
                            {/* Anchor Header */}
                            <div className="mb-3 pb-2 border-b border-slate-700/50">
                              <div className="text-white font-semibold text-base flex items-center gap-2 mb-1">
                                <span className="text-emerald-400 text-xs font-mono">#{index + 1}</span>
                                <span>{anchor.name}</span>
                                {warnings.hasMath && <span title="Mathematical mismatch" className="text-cyan-400 font-bold">*</span>}
                                {warnings.hasCommunity && <span title="Community mismatch" className="text-amber-400 font-bold">**</span>}
                              </div>
                              <div className="text-xs text-slate-400">
                                <span className="text-emerald-300">{anchor.rarity?.toUpperCase()}</span>
                                {' • '}
                                <span className="font-mono">{anchorScore.toFixed(1)} pts</span>
                                {anchor.attunement && ' • Attunement'}
                              </div>
                            </div>

                            {/* Combat Features */}
                            <div className="mb-3">
                              <div className="text-emerald-400 text-xs font-semibold mb-1">Features</div>
                              <div className="text-xs text-slate-300 space-y-0.5 pl-2">
                                {anchor.combat.enhancement > 0 && (
                                  <div>+{anchor.combat.enhancement} enhancement</div>
                                )}
                                {anchor.combat.damageBonus && (
                                  <div>
                                    {anchor.combat.damageBonus.dice} {anchor.combat.damageBonus.type}
                                    {anchor.combat.damageBonus.conditional && <span className="text-yellow-400 ml-1">(conditional)</span>}
                                  </div>
                                )}
                                {anchor.combat.acBonus && <div>+{anchor.combat.acBonus} AC</div>}
                                {anchor.combat.savingThrowBonus && <div>+{anchor.combat.savingThrowBonus} saves</div>}
                                {anchor.combat.resistances && anchor.combat.resistances.length > 0 && (
                                  <div>Resist: {anchor.combat.resistances.join(', ')}</div>
                                )}
                                {anchor.combat.charges && (
                                  <div>{anchor.combat.charges.length} charge{anchor.combat.charges.length > 1 ? 's' : ''}</div>
                                )}
                                {!anchor.combat.enhancement && !anchor.combat.damageBonus && !anchor.combat.acBonus && !anchor.combat.savingThrowBonus && !anchor.combat.resistances && !anchor.combat.charges && (
                                  <div className="text-slate-500 italic">No measurable combat features</div>
                                )}
                              </div>
                            </div>

                            {/* Comparison */}
                            <div className="bg-slate-900/50 rounded p-2">
                              <div className="text-xs font-semibold text-slate-400 mb-1">
                                Comparison
                              </div>
                              <div className="text-xs space-y-0.5">
                                {comparison.type === 'stronger' && (
                                  <div className="text-yellow-400 font-medium">
                                    ↑ {comparison.scoreDifference.toFixed(1)} pts stronger
                                  </div>
                                )}
                                {comparison.type === 'weaker' && (
                                  <div className="text-blue-400 font-medium">
                                    ↓ {Math.abs(comparison.scoreDifference).toFixed(1)} pts weaker
                                  </div>
                                )}
                                {comparison.type === 'equal' && (
                                  <div className="text-emerald-400 font-medium">
                                    ≈ Equal power
                                  </div>
                                )}
                                {comparison.details.length > 0 && (
                                  <div className="mt-1 pt-1 border-t border-slate-700/50 text-slate-400 space-y-0.5">
                                    {comparison.details.map((detail, idx) => (
                                      <div key={idx}>• {detail}</div>
                                    ))}
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

                {/* Your Item Summary */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <span>⚔️</span>
                    <span>YOUR ITEM</span>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-3">
                    <div className="text-xs space-y-2">
                      {/* Features List */}
                      <div>
                        <div className="text-slate-400 font-semibold mb-1">Features</div>
                        <div className="text-slate-300 space-y-0.5 pl-2">
                          {enhancement > 0 && <div>+{enhancement} enhancement</div>}
                          {damageBonus && (
                            <div>
                              {damageBonus.dice} {damageBonus.type}
                              {damageBonus.conditional && <span className="text-yellow-400 ml-1">(conditional)</span>}
                            </div>
                          )}
                          {acBonus > 0 && <div>+{acBonus} AC</div>}
                          {savingThrowBonus > 0 && <div>+{savingThrowBonus} saves</div>}
                          {abilities.length > 0 && (
                            <div>
                              {maxCharges} charges ({abilities.length} abilit{abilities.length > 1 ? 'ies' : 'y'})
                              {chargesPerShortRest > 0 && <span className="text-slate-400"> • {chargesPerShortRest}/SR</span>}
                              {chargesPerLongRest > 0 && <span className="text-slate-400"> • {chargesPerLongRest}/LR</span>}
                            </div>
                          )}
                          {!enhancement && !damageBonus && !acBonus && !savingThrowBonus && abilities.length === 0 && (
                            <div className="text-slate-500 italic">No features added</div>
                          )}
                        </div>
                      </div>

                      {/* Combat Score */}
                      <div className="pt-2 border-t border-slate-700/50">
                        <div className="text-slate-400 font-semibold mb-1">Combat Score</div>
                        <div className="text-emerald-400 font-mono font-bold">
                          {results.combatScore.toFixed(1)} pts
                        </div>
                      </div>

                      {/* Attunement Notice */}
                      {attunement && (
                        <div className="pt-2 border-t border-slate-700/50">
                          <div className="text-yellow-400 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Requires Attunement</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Advanced: Formula Details */}
                <div className="border-t border-slate-700 pt-4">
                  <button
                    onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                    className="w-full text-left text-slate-400 hover:text-emerald-400 text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span>⚙️ Advanced: Formula Details</span>
                    <span className="text-xl">{showFormulaDetails ? '−' : '+'}</span>
                  </button>

                  {showFormulaDetails && (
                    <div className="mt-3 text-xs text-slate-400 space-y-2 pl-4">
                      <div className="space-y-1">
                        <div className="text-emerald-400 font-semibold">Base Values:</div>
                        <div>• Enhancement: 1 point per +1</div>
                        <div>• AC Bonus: 1 point per +1</div>
                        <div>• Saving Throw Bonus: 1 point per +1</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-emerald-400 font-semibold">Damage Dice:</div>
                        <div>• 1d4 = 0.5 pts, 1d6 = 1 pt, 1d8 = 1.25 pts, 1d10 = 1.5 pts</div>
                        <div>• 2d6 = 2 pts, 2d8 = 2.5 pts, 3d6 = 3 pts, 3d8 = 3.75 pts, 4d6 = 4 pts</div>
                        <div className="text-yellow-400">• Conditional damage: ×0.25 (only vs specific creatures)</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-emerald-400 font-semibold">Resistances:</div>
                        <div>• 1.5 points per damage type resisted</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-emerald-400 font-semibold">Spell/Ability Charges:</div>
                        <div>• Formula: spell_level × uses_per_day × recharge_multiplier</div>
                        <div>• Dawn/Long Rest: ×0.1</div>
                        <div>• Short Rest: ×0.2</div>
                        <div className="text-slate-500 italic">
                          (Low multipliers account for limited total charges that don't fully recharge)
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-emerald-400 font-semibold">Rarity Thresholds:</div>
                        <div>• Common: &lt;1.0 pts</div>
                        <div>• Uncommon: 1.0-1.9 pts</div>
                        <div>• Rare: 2.0-2.9 pts</div>
                        <div>• Very Rare: 3.0-3.9 pts</div>
                        <div>• Legendary: 4.0+ pts</div>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-700/50">
                        <div className="text-emerald-400 font-semibold">Balance Indicators:</div>
                        <div className="text-cyan-400">
                          <span className="font-bold">*</span> Mathematical mismatch - Formula not yet nuanced enough to handle all item features
                        </div>
                        <div className="text-amber-400">
                          <span className="font-bold">**</span> Community consensus - D&D community reports imbalance for rarity
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
