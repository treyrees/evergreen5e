import { calculateCombatScore, getSuggestedRarity, RARITY_THRESHOLDS } from '../lib/calculator';
const items = require('../data/srd-items.json');

// Current resistance items for reference
const withResist = items.filter((i: any) => i.combat?.resistances?.length > 0);

console.log('=== CURRENT RESISTANCE ITEMS (for reference) ===\n');
withResist.forEach((i: any) => {
  const score = calculateCombatScore(i.combat);
  const baseScore = score - (i.overrideBonus || 0);
  const suggested = getSuggestedRarity(score);
  const suggestedName = typeof suggested === 'object' ? suggested.rarity : suggested;
  const match = suggestedName === i.rarity ? '✓' : '✗';
  console.log(`${match} ${i.name}`);
  console.log(`   Book: ${i.rarity} | Score: ${score.toFixed(2)} pts (base: ${baseScore.toFixed(2)})`);
  console.log(`   Resistances: ${i.combat.resistances.join(', ')}`);
  if (i.overrideBonus !== undefined) console.log(`   Override: +${i.overrideBonus}`);
  console.log('');
});

// Current immunity values
const CURRENT_DAMAGE_IMMUNITY: Record<string, number> = {
  'fire': 4.0,
  'poison': 4.0,
  'cold': 3.5,
  'necrotic': 3.0,
  'lightning': 3.0,
  'acid': 2.5,
  'bludgeoning': 2.25,
  'piercing': 2.25,
  'slashing': 2.25,
  'thunder': 2.0,
  'psychic': 1.75,
  'radiant': 1.25,
  'force': 0.75,
};

const CURRENT_CONDITION_IMMUNITY: Record<string, number> = {
  'paralyzed': 1.5,
  'stunned': 1.25,
  'petrified': 1.25,
  'incapacitated': 1.0,
  'unconscious': 1.0,
  'exhaustion': 1.0,
  'charmed': 0.75,
  'frightened': 0.75,
  'restrained': 0.75,
  'poisoned': 0.5,
  'blinded': 0.5,
  'deafened': 0.25,
  'grappled': 0.25,
  'prone': 0.25,
};

// PROPOSED new immunity values
const PROPOSED_DAMAGE_IMMUNITY: Record<string, number> = {
  'fire': 1.75,        // Was 4.0 - still premium but not a full tier
  'poison': 1.5,       // Was 4.0 - calibrated to Periapt
  'cold': 1.5,         // Was 3.5
  'necrotic': 1.25,    // Was 3.0
  'lightning': 1.25,   // Was 3.0
  'acid': 1.0,         // Was 2.5
  'bludgeoning': 1.0,  // Was 2.25 - all 3 physical = 3.0 pts
  'piercing': 1.0,     // Was 2.25
  'slashing': 1.0,     // Was 2.25
  'thunder': 0.75,     // Was 2.0
  'psychic': 0.75,     // Was 1.75
  'radiant': 0.5,      // Was 1.25
  'force': 0.25,       // Was 0.75
};

const PROPOSED_CONDITION_IMMUNITY: Record<string, number> = {
  'paralyzed': 0.75,    // Was 1.5 - still highest, very situational
  'stunned': 0.6,       // Was 1.25
  'petrified': 0.6,     // Was 1.25
  'incapacitated': 0.5, // Was 1.0
  'unconscious': 0.5,   // Was 1.0
  'exhaustion': 0.5,    // Was 1.0
  'charmed': 0.4,       // Was 0.75
  'frightened': 0.4,    // Was 0.75
  'restrained': 0.4,    // Was 0.75
  'poisoned': 0.3,      // Was 0.5 - calibrated to Periapt
  'blinded': 0.3,       // Was 0.5
  'deafened': 0.1,      // Was 0.25
  'grappled': 0.1,      // Was 0.25
  'prone': 0.1,         // Was 0.25
};

// Test items - real D&D items with immunities
const testItems = [
  {
    name: 'Periapt of Proof Against Poison',
    bookRarity: 'rare',
    damageImmunities: ['poison'],
    conditionImmunities: ['poisoned'],
    notes: 'Key calibration item'
  },
  {
    name: 'Ring of Fire Immunity (theoretical)',
    bookRarity: 'rare',  // If Ring of Fire Resistance is Rare, immunity should be Very Rare?
    damageImmunities: ['fire'],
    conditionImmunities: [],
    notes: 'Theoretical - should be Very Rare?'
  },
  {
    name: 'Helm of Brilliance (partial)',
    bookRarity: 'very rare',
    damageImmunities: ['fire'],  // Actually resistance + immunity to certain effects
    conditionImmunities: [],
    notes: 'Has many other features'
  },
  {
    name: 'Ring of Mind Shielding (partial)',
    bookRarity: 'uncommon',
    damageImmunities: [],
    conditionImmunities: ['charmed'],  // Can't be detected or targeted by mind reading
    notes: 'Immunity to detection, not quite condition immunity'
  },
  {
    name: 'Adamantine Armor (immunity to crits)',
    bookRarity: 'uncommon',
    damageImmunities: [],
    conditionImmunities: [],
    notes: 'Critical hit immunity is different mechanic'
  },
  {
    name: 'Multi-condition item (theoretical)',
    bookRarity: 'rare',
    damageImmunities: [],
    conditionImmunities: ['frightened', 'charmed'],
    notes: 'Two condition immunities'
  },
  {
    name: 'Multi-damage immunity (theoretical)',
    bookRarity: 'legendary',
    damageImmunities: ['fire', 'cold', 'lightning'],
    conditionImmunities: [],
    notes: 'Three damage immunities'
  },
  {
    name: 'All physical immunity (theoretical)',
    bookRarity: 'legendary',
    damageImmunities: ['bludgeoning', 'piercing', 'slashing'],
    conditionImmunities: [],
    notes: 'All physical damage immunity'
  },
];

function getRarityName(score: number): string {
  if (score <= 0.5) return 'common';
  if (score <= 1.5) return 'uncommon';
  if (score <= 2.5) return 'rare';
  if (score <= 4.0) return 'very rare';
  return 'legendary';
}

console.log('\n=== IMMUNITY VALUE COMPARISON ===\n');
console.log('Test items with CURRENT vs PROPOSED immunity values:\n');

testItems.forEach(item => {
  // Calculate with current values
  let currentScore = 0;
  for (const dmg of item.damageImmunities) {
    currentScore += CURRENT_DAMAGE_IMMUNITY[dmg] || 2.5;
  }
  for (const cond of item.conditionImmunities) {
    currentScore += CURRENT_CONDITION_IMMUNITY[cond] || 0.5;
  }

  // Calculate with proposed values
  let proposedScore = 0;
  for (const dmg of item.damageImmunities) {
    proposedScore += PROPOSED_DAMAGE_IMMUNITY[dmg] || 1.0;
  }
  for (const cond of item.conditionImmunities) {
    proposedScore += PROPOSED_CONDITION_IMMUNITY[cond] || 0.3;
  }

  const currentRarity = getRarityName(currentScore);
  const proposedRarity = getRarityName(proposedScore);

  const currentMatch = currentRarity === item.bookRarity ? '✓' : '✗';
  const proposedMatch = proposedRarity === item.bookRarity ? '✓' : '~';

  console.log(`${item.name}`);
  console.log(`   Target: ${item.bookRarity.toUpperCase()}`);
  console.log(`   Current:  ${currentScore.toFixed(2)} pts → ${currentRarity} ${currentMatch}`);
  console.log(`   Proposed: ${proposedScore.toFixed(2)} pts → ${proposedRarity} ${proposedMatch}`);
  if (item.damageImmunities.length > 0) {
    console.log(`   Damage immunities: ${item.damageImmunities.join(', ')}`);
  }
  if (item.conditionImmunities.length > 0) {
    console.log(`   Condition immunities: ${item.conditionImmunities.join(', ')}`);
  }
  console.log(`   Notes: ${item.notes}`);
  console.log('');
});

console.log('\n=== VALUE COMPARISON TABLE ===\n');

console.log('DAMAGE IMMUNITIES:');
console.log('Type          | Current | Proposed | Change');
console.log('--------------|---------|----------|--------');
for (const [type, current] of Object.entries(CURRENT_DAMAGE_IMMUNITY)) {
  const proposed = PROPOSED_DAMAGE_IMMUNITY[type];
  const change = ((proposed - current) / current * 100).toFixed(0);
  console.log(`${type.padEnd(13)} | ${current.toFixed(2).padStart(7)} | ${proposed.toFixed(2).padStart(8)} | ${change}%`);
}

console.log('\nCONDITION IMMUNITIES:');
console.log('Condition     | Current | Proposed | Change');
console.log('--------------|---------|----------|--------');
for (const [cond, current] of Object.entries(CURRENT_CONDITION_IMMUNITY)) {
  const proposed = PROPOSED_CONDITION_IMMUNITY[cond];
  const change = ((proposed - current) / current * 100).toFixed(0);
  console.log(`${cond.padEnd(13)} | ${current.toFixed(2).padStart(7)} | ${proposed.toFixed(2).padStart(8)} | ${change}%`);
}
