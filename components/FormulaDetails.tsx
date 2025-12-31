'use client';

import { useState } from 'react';

/** Collapsible panel showing all formula details for the calculator */
export function FormulaDetails() {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  return (
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
                  <div>• Spell Save DC Bonus: 1.0 pts per +1</div>
                  <div>• Spell Attack Bonus: 0.75 pts per +1</div>
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
                  <div>• Truesight: 1.5 pts (see through all illusions, invisibility, shapechangers)</div>
                  <div>• Blindsight/See Invisibility: 0.75 pts (see invisible creatures)</div>
                  <div>• Speed Bonus: 0.5 pts (+10 ft movement)</div>
                  <div>• Tremorsense: 0.5 pts (detect via vibrations)</div>
                  <div>• Climb/Burrow/Swimming: 0.5 pts (alternative movement modes)</div>
                  <div>• Darkvision: 0.25 pts (many races have this)</div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-200 font-semibold">Damage Resistances:</div>
                  <div>• Fire: 2.25 pts (dragons, elementals, spells - very common)</div>
                  <div>• Poison/Cold: 2.0 pts (common damage sources)</div>
                  <div>• Necrotic/Lightning: 1.75 pts (moderately common)</div>
                  <div>• Acid: 1.5 pts | Thunder: 1.25 pts</div>
                  <div>• Physical (each): 1.25 pts <span className="text-slate-500">(all 3 = 3.75 pts)</span></div>
                  <div>• Psychic: 1.0 pts | Radiant: 0.75 pts | Force: 0.5 pts</div>
                  <div className="text-slate-500 text-[10px] pl-2">Physical types worth less individually since you need all 3 for full protection</div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-200 font-semibold">Damage Immunities:</div>
                  <div>• Fire/Poison: 4.0 pts (very common damage)</div>
                  <div>• Cold: 3.5 pts | Necrotic/Lightning: 3.0 pts</div>
                  <div>• Acid: 2.5 pts | Physical (each): 2.25 pts</div>
                  <div>• Thunder: 2.0 pts | Psychic: 1.75 pts</div>
                  <div>• Radiant: 1.25 pts | Force: 0.75 pts (very rare)</div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-200 font-semibold">Condition Immunities:</div>
                  <div>• Paralyzed: 1.5 pts | Stunned/Petrified: 1.25 pts</div>
                  <div>• Incapacitated/Unconscious/Exhaustion: 1.0 pts</div>
                  <div>• Charmed/Frightened/Restrained: 0.75 pts</div>
                  <div>• Poisoned/Blinded: 0.5 pts | Deafened/Grappled/Prone: 0.25 pts</div>
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
                    Attunement does <span className="text-slate-500">not</span> modify scores. Official 5e pricing is inconsistent; Cloak of Protection (+1 AC/saves, Uncommon) vs Ring of Protection (identical stats, Rare).
                  </div>
                  <div className="text-slate-500 italic text-[10px] mt-1">
                    When comparing, prioritize reference items with matching attunement. The 3-slot limit means attunement is an &quot;opportunity cost&quot; that varies by build.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-slate-200 font-semibold">Weapon Properties:</div>
                  <div>• Finesse: 0.25 pts (DEX or STR flexibility)</div>
                  <div>• Reach: 0.25 pts (+5 ft tactical advantage)</div>
                  <div>• Light: 0.2 pts (enables two-weapon fighting)</div>
                  <div>• Versatile: 0.15 pts (one or two hands)</div>
                  <div>• Thrown: 0.1 pts (minor ranged versatility)</div>
                  <div>• Heavy/Two-Handed: -0.15 pts (combined penalty)</div>
                </div>

                <div className="space-y-1">
                  <div className="text-slate-200 font-semibold">Armor Properties:</div>
                  <div>• Fortified: 0.3 pts (crits become normal hits)</div>
                  <div>• Spiked: 0.2 pts (1d4 piercing to grapplers)</div>
                  <div>• Buoyant: 0.15 pts (no swimming penalty)</div>
                  <div>• Swift Donning: 0.1 pts (don/doff as action)</div>
                  <div>• Comfortable: 0.1 pts (sleep without penalty)</div>
                  <div>• Noisy: -0.2 pts (disadvantage on Stealth)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
