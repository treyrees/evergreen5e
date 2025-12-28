'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { MagicItem, DamageBonus, SpellCharge } from '@/types/magic-item';
import {
  calculateCombatScore,
  getSuggestedRarity,
} from '@/lib/calculator';

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
  const [itemName, setItemName] = useState('Trident of Fish Command');
  const [baseItem, setBaseItem] = useState('trident');
  const [enhancement, setEnhancement] = useState(1);
  const [damageBonus, setDamageBonus] = useState<DamageBonus | undefined>(
    undefined
  );
  const [acBonus, setAcBonus] = useState(0);
  const [savingThrowBonus, setSavingThrowBonus] = useState(0);
  const [resistances, setResistances] = useState<string[]>([]);
  const [charges, setCharges] = useState<SpellCharge[]>([]);
  const [attunement, setAttunement] = useState(true);

  // UI state
  const [showChargeForm, setShowChargeForm] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [newCharge, setNewCharge] = useState<SpellCharge>({
    spell: '',
    spellLevel: 1,
    usesPerDay: 1,
    recharge: 'dawn',
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
      charges: charges.length > 0 ? charges : undefined,
    },
    attunement,
  }), [itemName, baseItem, enhancement, damageBonus, acBonus, savingThrowBonus, resistances, charges, attunement]);

  const results = useMemo(() => getSuggestedRarity(currentItem), [currentItem]);

  const addCharge = () => {
    if (newCharge.spell.trim()) {
      setCharges([...charges, newCharge]);
      setNewCharge({
        spell: '',
        spellLevel: 1,
        usesPerDay: 1,
        recharge: 'dawn',
      });
      setShowChargeForm(false);
    }
  };

  const removeCharge = (index: number) => {
    setCharges(charges.filter((_, i) => i !== index));
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
                  {/* Enhancement Bonus */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Enhancement Bonus
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

                {/* Damage Resistances */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Damage Resistances
                  </label>
                  <select
                    multiple
                    value={resistances}
                    onChange={(e) =>
                      setResistances(
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    size={5}
                  >
                    {DAMAGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  {resistances.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resistances.map((res) => (
                        <span
                          key={res}
                          className="inline-flex items-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs px-2 py-1 rounded"
                        >
                          {res}
                          <button
                            onClick={() =>
                              setResistances(resistances.filter((r) => r !== res))
                            }
                            className="ml-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Spells & Spell-Like Abilities */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Spells & Spell-Like Abilities
                  </label>

                  {charges.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {charges.map((charge, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-3 rounded-md"
                        >
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            <span className="font-medium">{charge.spell}</span> (
                            Level {charge.spellLevel}, {charge.usesPerDay}x/
                            {charge.recharge})
                          </div>
                          <button
                            onClick={() => removeCharge(index)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showChargeForm ? (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
                      <input
                        type="text"
                        value={newCharge.spell}
                        onChange={(e) =>
                          setNewCharge({ ...newCharge, spell: e.target.value })
                        }
                        placeholder="Spell name"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Level
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="9"
                            value={newCharge.spellLevel}
                            onChange={(e) =>
                              setNewCharge({
                                ...newCharge,
                                spellLevel: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Uses/Day
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={newCharge.usesPerDay}
                            onChange={(e) =>
                              setNewCharge({
                                ...newCharge,
                                usesPerDay: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Recharge
                          </label>
                          <select
                            value={newCharge.recharge}
                            onChange={(e) =>
                              setNewCharge({
                                ...newCharge,
                                recharge: e.target.value as SpellCharge['recharge'],
                              })
                            }
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                          >
                            <option value="dawn">Dawn</option>
                            <option value="long rest">Long Rest</option>
                            <option value="short rest">Short Rest</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addCharge}
                          className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium"
                        >
                          Add Charge
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

                {/* Anchor Item - Reference for Comparison */}
                {results.anchorItem && (
                  <div className="border-t border-slate-700 pt-4">
                    <div className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                      <span className="text-lg">⚓</span>
                      <span>ANCHOR ITEM (Reference)</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-white font-semibold text-base">
                        {results.anchorItem.name}
                      </div>
                      <div className="text-xs text-emerald-300">
                        {results.anchorItem.rarity?.toUpperCase()} •{' '}
                        {results.anchorScore.toFixed(1)} points
                        {results.anchorItem.attunement && ' • Requires Attunement'}
                      </div>

                      {/* Anchor Combat Features */}
                      <div className="mt-2 pt-2 border-t border-emerald-700/50 text-xs text-slate-300 space-y-1">
                        {results.anchorItem.combat.enhancement > 0 && (
                          <div>• +{results.anchorItem.combat.enhancement} enhancement</div>
                        )}
                        {results.anchorItem.combat.damageBonus && (
                          <div>
                            • {results.anchorItem.combat.damageBonus.dice}{' '}
                            {results.anchorItem.combat.damageBonus.type} damage
                            {results.anchorItem.combat.damageBonus.conditional && <span className="text-yellow-400"> (conditional)</span>}
                          </div>
                        )}
                        {results.anchorItem.combat.acBonus && (
                          <div>• +{results.anchorItem.combat.acBonus} AC</div>
                        )}
                        {results.anchorItem.combat.resistances && results.anchorItem.combat.resistances.length > 0 && (
                          <div>• Resistances: {results.anchorItem.combat.resistances.join(', ')}</div>
                        )}
                        {results.anchorItem.combat.charges && (
                          <div>• {results.anchorItem.combat.charges.length} spell/ability charges</div>
                        )}
                      </div>

                      {/* Comparison to Anchor */}
                      {results.anchorComparison && (
                        <div className="mt-3 pt-2 border-t border-emerald-700/50">
                          <div className="text-xs font-semibold text-emerald-300 mb-1">
                            {itemName || 'UNNAMED ITEM'} vs {results.anchorItem.name.toUpperCase()}:
                          </div>
                          <div className="text-xs text-slate-300 space-y-0.5">
                            {results.anchorComparison.type === 'stronger' && (
                              <div className="text-yellow-400">
                                ↑ {results.anchorComparison.scoreDifference.toFixed(1)} points stronger
                              </div>
                            )}
                            {results.anchorComparison.type === 'weaker' && (
                              <div className="text-blue-400">
                                ↓ {Math.abs(results.anchorComparison.scoreDifference).toFixed(1)} points weaker
                              </div>
                            )}
                            {results.anchorComparison.type === 'equal' && (
                              <div className="text-emerald-400">
                                ≈ Equal power level
                              </div>
                            )}
                            {results.anchorComparison.details.map((detail, idx) => (
                              <div key={idx} className="text-slate-400">
                                • {detail}
                              </div>
                            ))}
                            {results.anchorIsUnbalanced && (
                              <div className="mt-2 pt-2 border-t border-yellow-700/30 text-yellow-400">
                                ⚠️ This anchor appears unbalanced in the SRD
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Combat Power */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="text-emerald-400 font-bold mb-2">
                    ⚔️ YOUR ITEM&apos;S COMBAT POWER
                  </div>
                  <div className="pl-4 space-y-1 text-slate-300">
                    {enhancement > 0 && (
                      <div>Enhancement: +{enhancement}</div>
                    )}
                    {damageBonus && (
                      <div>
                        Damage: {damageBonus.dice} {damageBonus.type}
                        {damageBonus.conditional && <span className="text-yellow-400"> (conditional)</span>}
                      </div>
                    )}
                    {acBonus > 0 && <div>AC Bonus: +{acBonus}</div>}
                    {savingThrowBonus > 0 && (
                      <div>Saving Throw: +{savingThrowBonus}</div>
                    )}
                    {resistances.length > 0 && (
                      <div>
                        Resistances: {resistances.join(', ')}
                      </div>
                    )}
                    {charges.length > 0 && (
                      <div>
                        Charges: {charges.length} spell/abilit
                        {charges.length !== 1 ? 'ies' : 'y'}
                      </div>
                    )}
                    <div className="pt-2 text-emerald-400">
                      Combat Score: {results.combatScore.toFixed(1)} points
                    </div>
                  </div>
                </div>

                {attunement && (
                  <div className="border-t border-slate-700 pt-4 text-yellow-400 text-xs">
                    ⚠️ Requires Attunement
                  </div>
                )}

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
