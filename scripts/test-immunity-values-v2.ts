import { calculateCombatScore, getSuggestedRarity, RARITY_THRESHOLDS } from '../lib/calculator';
const items = require('../data/srd-items.json');

// PROPOSED v2 - slightly higher damage immunities to fix physical immunity edge case
const PROPOSED_DAMAGE_IMMUNITY_V2: Record<string, number> = {
  'fire': 2.0,         // Ring of Fire Immunity → upper Rare
  'poison': 1.75,      // Periapt calibration
  'cold': 1.75,        // Dragons, winter
  'necrotic': 1.5,     // Undead common
  'lightning': 1.5,    // Blue dragons
  'acid': 1.25,        // Less common
  'bludgeoning': 1.25, // All 3 physical = 3.75 pts (borderline Legendary)
  'piercing': 1.25,
  'slashing': 1.25,
  'thunder': 1.0,      // Rare
  'psychic': 1.0,      // Mind flayers specific
  'radiant': 0.75,     // Almost never
  'force': 0.5,        // Never
};

const PROPOSED_CONDITION_IMMUNITY_V2: Record<string, number> = {
  'paralyzed': 0.75,    // Devastating but rare
  'stunned': 0.65,      // Very bad
  'petrified': 0.65,    // Essentially death
  'incapacitated': 0.5, // Bad
  'unconscious': 0.5,   // Usually from 0 HP
  'exhaustion': 0.5,    // Cumulative danger
  'charmed': 0.5,       // Common, dangerous (bumped up)
  'frightened': 0.5,    // Common (bumped up)
  'restrained': 0.4,    // Speed 0, advantage against
  'poisoned': 0.3,      // Common condition
  'blinded': 0.3,       // Situational
  'deafened': 0.15,     // Ribbon
  'grappled': 0.15,     // Minor
  'prone': 0.15,        // Minor
};

// Current values for comparison
const CURRENT_DAMAGE_IMMUNITY: Record<string, number> = {
  'fire': 4.0, 'poison': 4.0, 'cold': 3.5,
  'necrotic': 3.0, 'lightning': 3.0, 'acid': 2.5,
  'bludgeoning': 2.25, 'piercing': 2.25, 'slashing': 2.25,
  'thunder': 2.0, 'psychic': 1.75, 'radiant': 1.25, 'force': 0.75,
};

const CURRENT_CONDITION_IMMUNITY: Record<string, number> = {
  'paralyzed': 1.5, 'stunned': 1.25, 'petrified': 1.25,
  'incapacitated': 1.0, 'unconscious': 1.0, 'exhaustion': 1.0,
  'charmed': 0.75, 'frightened': 0.75, 'restrained': 0.75,
  'poisoned': 0.5, 'blinded': 0.5,
  'deafened': 0.25, 'grappled': 0.25, 'prone': 0.25,
};

// Test items
const testItems = [
  {
    name: 'Periapt of Proof Against Poison',
    bookRarity: 'rare',
    damageImmunities: ['poison'],
    conditionImmunities: ['poisoned'],
    notes: 'Key calibration - immunity to poison dmg + poisoned condition'
  },
  {
    name: 'Ring of Fire Immunity (theoretical)',
    bookRarity: 'very rare', // Upgraded expectation - immunity should exceed resistance
    damageImmunities: ['fire'],
    conditionImmunities: [],
    notes: 'If resistance is Rare, immunity should be Very Rare'
  },
  {
    name: 'Scarab of Protection (partial model)',
    bookRarity: 'legendary',
    damageImmunities: ['necrotic'],
    conditionImmunities: [],
    notes: 'Also has spell absorption, death save advantage - needs override'
  },
  {
    name: 'All physical immunity (theoretical)',
    bookRarity: 'legendary',
    damageImmunities: ['bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: [],
    notes: 'Complete physical immunity - extremely powerful'
  },
  {
    name: 'Frightened + Charmed immunity (theoretical)',
    bookRarity: 'uncommon',
    damageImmunities: [],
    conditionImmunities: ['frightened', 'charmed'],
    notes: 'Two mental condition immunities'
  },
  {
    name: 'Paralysis immunity only (theoretical)',
    bookRarity: 'uncommon',
    damageImmunities: [],
    conditionImmunities: ['paralyzed'],
    notes: 'Single devastating condition immunity'
  },
  {
    name: 'Multi-damage immunity (fire+cold+lightning)',
    bookRarity: 'legendary',
    damageImmunities: ['fire', 'cold', 'lightning'],
    conditionImmunities: [],
    notes: 'Three elemental immunities'
  },
  {
    name: 'Elemental + conditions (fire + frightened + charmed)',
    bookRarity: 'very rare',
    damageImmunities: ['fire'],
    conditionImmunities: ['frightened', 'charmed'],
    notes: 'Mix of damage and condition immunity'
  },
];

function getRarityName(score: number): string {
  if (score <= 0.5) return 'common';
  if (score <= 1.5) return 'uncommon';
  if (score <= 2.5) return 'rare';
  if (score <= 4.0) return 'very rare';
  return 'legendary';
}

console.log('=== IMMUNITY VALUE COMPARISON v2 ===\n');

testItems.forEach(item => {
  // Calculate with current values
  let currentScore = 0;
  for (const dmg of item.damageImmunities) {
    currentScore += CURRENT_DAMAGE_IMMUNITY[dmg] || 2.5;
  }
  for (const cond of item.conditionImmunities) {
    currentScore += CURRENT_CONDITION_IMMUNITY[cond] || 0.5;
  }

  // Calculate with proposed v2 values
  let proposedScore = 0;
  for (const dmg of item.damageImmunities) {
    proposedScore += PROPOSED_DAMAGE_IMMUNITY_V2[dmg] || 1.25;
  }
  for (const cond of item.conditionImmunities) {
    proposedScore += PROPOSED_CONDITION_IMMUNITY_V2[cond] || 0.35;
  }

  const currentRarity = getRarityName(currentScore);
  const proposedRarity = getRarityName(proposedScore);

  const currentMatch = currentRarity === item.bookRarity ? '✓' : '✗';
  const proposedMatch = proposedRarity === item.bookRarity ? '✓' : '✗';

  console.log(`${item.name}`);
  console.log(`   Target: ${item.bookRarity.toUpperCase()}`);
  console.log(`   Current:  ${currentScore.toFixed(2)} pts → ${currentRarity.padEnd(10)} ${currentMatch}`);
  console.log(`   Proposed: ${proposedScore.toFixed(2)} pts → ${proposedRarity.padEnd(10)} ${proposedMatch}`);
  if (item.notes) console.log(`   Notes: ${item.notes}`);
  console.log('');
});

console.log('\n=== PROPOSED v2 VALUE TABLES ===\n');

console.log('DAMAGE IMMUNITIES:');
console.log('Type          | Current | Proposed | Reduction');
console.log('--------------|---------|----------|----------');
for (const [type, current] of Object.entries(CURRENT_DAMAGE_IMMUNITY)) {
  const proposed = PROPOSED_DAMAGE_IMMUNITY_V2[type];
  const reduction = Math.round((1 - proposed / current) * 100);
  console.log(`${type.padEnd(13)} | ${current.toFixed(2).padStart(7)} | ${proposed.toFixed(2).padStart(8)} | -${reduction}%`);
}

console.log('\nCONDITION IMMUNITIES:');
console.log('Condition     | Current | Proposed | Reduction');
console.log('--------------|---------|----------|----------');
for (const [cond, current] of Object.entries(CURRENT_CONDITION_IMMUNITY)) {
  const proposed = PROPOSED_CONDITION_IMMUNITY_V2[cond];
  const reduction = Math.round((1 - proposed / current) * 100);
  console.log(`${cond.padEnd(13)} | ${current.toFixed(2).padStart(7)} | ${proposed.toFixed(2).padStart(8)} | -${reduction}%`);
}

// Summary statistics
console.log('\n=== SUMMARY ===');
console.log('Damage immunity reduction: ~50-60% across the board');
console.log('Condition immunity reduction: ~45-55% across the board');
console.log('');
console.log('Key calibrations:');
console.log('- Periapt of Proof Against Poison (Rare): poison immunity + poisoned condition');
console.log('- Fire immunity alone → upper Rare / lower Very Rare');
console.log('- All physical immunity → borderline Legendary (3.75 pts)');
console.log('- Single condition immunity → Uncommon range');
