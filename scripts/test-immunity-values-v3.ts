// v3: Bump physical immunity slightly to push all-physical to Legendary
// Keep fire at 2.0 - Rare for single immunity is acceptable

const PROPOSED_DAMAGE_IMMUNITY_V3: Record<string, number> = {
  'fire': 2.0,         // Upper Rare - acceptable for single immunity
  'poison': 1.75,      // Periapt calibration
  'cold': 1.75,        // Similar to poison
  'necrotic': 1.5,     // Common from undead
  'lightning': 1.5,    // Blue dragons
  'acid': 1.25,        // Less common
  'bludgeoning': 1.4,  // Bumped: all 3 = 4.2 → Legendary
  'piercing': 1.4,     // Bumped
  'slashing': 1.4,     // Bumped
  'thunder': 1.0,      // Rare
  'psychic': 1.0,      // Mind flayers
  'radiant': 0.75,     // Rarely matters
  'force': 0.5,        // Never matters
};

const PROPOSED_CONDITION_IMMUNITY_V3: Record<string, number> = {
  'paralyzed': 0.75,    // Devastating but rare
  'stunned': 0.65,
  'petrified': 0.65,
  'incapacitated': 0.5,
  'unconscious': 0.5,
  'exhaustion': 0.5,
  'charmed': 0.5,
  'frightened': 0.5,
  'restrained': 0.4,
  'poisoned': 0.3,
  'blinded': 0.3,
  'deafened': 0.15,
  'grappled': 0.15,
  'prone': 0.15,
};

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

const testItems = [
  { name: 'Periapt of Proof Against Poison', bookRarity: 'rare',
    damageImmunities: ['poison'], conditionImmunities: ['poisoned'],
    notes: 'Key calibration item' },
  { name: 'Ring of Fire Immunity (theoretical)', bookRarity: 'rare',
    damageImmunities: ['fire'], conditionImmunities: [],
    notes: 'Single fire immunity - upper Rare is acceptable' },
  { name: 'All physical immunity (theoretical)', bookRarity: 'legendary',
    damageImmunities: ['bludgeoning', 'piercing', 'slashing'], conditionImmunities: [],
    notes: 'Complete physical immunity' },
  { name: 'Fire + Cold immunity', bookRarity: 'very rare',
    damageImmunities: ['fire', 'cold'], conditionImmunities: [],
    notes: 'Two major elemental immunities' },
  { name: 'Frightened + Charmed immunity', bookRarity: 'uncommon',
    damageImmunities: [], conditionImmunities: ['frightened', 'charmed'],
    notes: 'Two mental conditions' },
  { name: 'Paralysis immunity only', bookRarity: 'uncommon',
    damageImmunities: [], conditionImmunities: ['paralyzed'],
    notes: 'Single worst condition' },
  { name: 'Fire + Cold + Lightning', bookRarity: 'legendary',
    damageImmunities: ['fire', 'cold', 'lightning'], conditionImmunities: [],
    notes: 'Three elemental immunities' },
  { name: 'Fire + frightened + charmed', bookRarity: 'very rare',
    damageImmunities: ['fire'], conditionImmunities: ['frightened', 'charmed'],
    notes: 'Mix of damage and condition' },
  { name: 'Necrotic + frightened (anti-undead)', bookRarity: 'rare',
    damageImmunities: ['necrotic'], conditionImmunities: ['frightened'],
    notes: 'Thematic anti-undead package' },
];

function getRarityName(score: number): string {
  if (score <= 0.5) return 'common';
  if (score <= 1.5) return 'uncommon';
  if (score <= 2.5) return 'rare';
  if (score <= 4.0) return 'very rare';
  return 'legendary';
}

console.log('=== IMMUNITY VALUE COMPARISON v3 ===\n');

let matches = 0;
let total = testItems.length;

testItems.forEach(item => {
  let currentScore = 0;
  for (const dmg of item.damageImmunities) {
    currentScore += CURRENT_DAMAGE_IMMUNITY[dmg] || 2.5;
  }
  for (const cond of item.conditionImmunities) {
    currentScore += CURRENT_CONDITION_IMMUNITY[cond] || 0.5;
  }

  let proposedScore = 0;
  for (const dmg of item.damageImmunities) {
    proposedScore += PROPOSED_DAMAGE_IMMUNITY_V3[dmg] || 1.25;
  }
  for (const cond of item.conditionImmunities) {
    proposedScore += PROPOSED_CONDITION_IMMUNITY_V3[cond] || 0.35;
  }

  const currentRarity = getRarityName(currentScore);
  const proposedRarity = getRarityName(proposedScore);

  const currentMatch = currentRarity === item.bookRarity;
  const proposedMatch = proposedRarity === item.bookRarity;
  if (proposedMatch) matches++;

  console.log(`${proposedMatch ? '✓' : '✗'} ${item.name}`);
  console.log(`   Target: ${item.bookRarity.toUpperCase()}`);
  console.log(`   Current:  ${currentScore.toFixed(2)} pts → ${currentRarity.padEnd(10)} ${currentMatch ? '✓' : '✗'}`);
  console.log(`   Proposed: ${proposedScore.toFixed(2)} pts → ${proposedRarity.padEnd(10)} ${proposedMatch ? '✓' : '✗'}`);
  console.log(`   Notes: ${item.notes}`);
  console.log('');
});

console.log(`\n=== MATCH RATE: ${matches}/${total} (${Math.round(matches/total*100)}%) ===\n`);

console.log('=== PROPOSED v3 FINAL VALUES ===\n');

console.log('DAMAGE IMMUNITIES:');
console.log('Type          | Current | Proposed | Ratio to Resistance');
console.log('--------------|---------|----------|--------------------');

const RESISTANCE_VALUES: Record<string, number> = {
  'fire': 2.25, 'poison': 2.0, 'cold': 2.0,
  'necrotic': 1.75, 'lightning': 1.75, 'acid': 1.5,
  'bludgeoning': 1.25, 'piercing': 1.25, 'slashing': 1.25,
  'thunder': 1.25, 'psychic': 1.0, 'radiant': 0.75, 'force': 0.5,
};

for (const [type, current] of Object.entries(CURRENT_DAMAGE_IMMUNITY)) {
  const proposed = PROPOSED_DAMAGE_IMMUNITY_V3[type];
  const resist = RESISTANCE_VALUES[type] || 1.0;
  const ratio = (proposed / resist).toFixed(2);
  console.log(`${type.padEnd(13)} | ${current.toFixed(2).padStart(7)} | ${proposed.toFixed(2).padStart(8)} | ${ratio}x resistance`);
}

console.log('\nCONDITION IMMUNITIES:');
console.log('Condition     | Current | Proposed');
console.log('--------------|---------|----------');
for (const [cond, current] of Object.entries(CURRENT_CONDITION_IMMUNITY)) {
  const proposed = PROPOSED_CONDITION_IMMUNITY_V3[cond];
  console.log(`${cond.padEnd(13)} | ${current.toFixed(2).padStart(7)} | ${proposed.toFixed(2).padStart(8)}`);
}
