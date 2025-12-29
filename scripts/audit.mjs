import { readFileSync } from 'fs';

// Read SRD items
const srdItems = JSON.parse(readFileSync('./data/srd-items.json', 'utf8'));

// Inline calculator logic
const DIE_TYPE_VALUES = {
  'd4': 0.5, 'd6': 1.0, 'd8': 1.25, 'd10': 1.5, 'd12': 1.75, 'd20': 2.5,
};

function getDiceValue(diceString) {
  const match = diceString.match(/^(\d+)d(\d+)$/);
  if (!match) return 0;
  const numDice = parseInt(match[1]);
  const dieType = `d${match[2]}`;
  return numDice * (DIE_TYPE_VALUES[dieType] || 1.0);
}

const RECHARGE_MULTIPLIERS = {
  'long rest': 0.25,
  'short rest': 0.4,
};

function calculateCombatScore(combat) {
  let score = 0;

  // Enhancement bonus
  score += combat.enhancement || 0;

  // Damage bonus
  if (combat.damageBonus) {
    let diceValue = getDiceValue(combat.damageBonus.dice);
    const frequency = combat.damageBonus.frequency || 'per-hit';
    if (frequency === 'per-turn') diceValue *= 0.4;
    if (combat.damageBonus.conditional) diceValue *= 0.25;
    score += diceValue;
  }

  // AC bonus
  score += combat.acBonus || 0;

  // Saving throw bonus
  score += combat.savingThrowBonus || 0;

  // Ability score setter - scales with the value it sets to
  if (combat.abilityScoreSetter) {
    const setValue = combat.abilityScoreSetter.setValue;
    if (setValue >= 25) score += 4.0;      // +7 modifier (epic)
    else if (setValue >= 23) score += 3.5; // +6 modifier (very powerful)
    else if (setValue >= 21) score += 3.0; // +5 modifier (powerful)
    else score += 2.5;                      // 19 or lower (+4 modifier, baseline)
  }

  // Ability score bonus - adds to existing score
  if (combat.abilityScoreBonus) {
    score += combat.abilityScoreBonus.bonus * 0.75;
  }

  // Flight - one of the most powerful abilities in D&D
  if (combat.flight) {
    if (combat.flight.duration === 'unlimited') {
      score += 2.0;
    } else if (combat.flight.hoursPerDay && combat.flight.hoursPerDay >= 4) {
      score += 1.5;
    } else {
      score += 1.0;
    }
  }

  // Resistances
  if (combat.resistances) {
    score += combat.resistances.length * 1.5;
  }

  // Legacy charges
  if (combat.charges) {
    for (const charge of combat.charges) {
      // Normalize "dawn" and "per day" to "long rest"
      const normalizedRecharge = (charge.recharge === 'dawn' || charge.recharge === 'per day')
        ? 'long rest'
        : charge.recharge;
      const multiplier = RECHARGE_MULTIPLIERS[normalizedRecharge] || 0.5;
      score += charge.spellLevel * charge.usesPerDay * multiplier;
    }
  }

  // Charge pool
  if (combat.chargePool && combat.chargePool.abilities.length > 0) {
    const dailyRecharge =
      combat.chargePool.chargesPerLongRest +
      (combat.chargePool.chargesPerShortRest * 2);
    const sustainableDailyCharges = Math.min(
      dailyRecharge > 0 ? dailyRecharge : combat.chargePool.maxCharges,
      combat.chargePool.maxCharges
    );
    for (const ability of combat.chargePool.abilities) {
      if (ability.chargesPerUse > 0) {
        const effectiveUses = sustainableDailyCharges / ability.chargesPerUse;
        const multiplier = 0.15;
        score += ability.spellLevel * effectiveUses * multiplier;
      }
    }
  }

  return score;
}

function scoreToRarity(score, hasCombatFeatures = false) {
  // Minimum floor: items with features should be at least Uncommon
  if (hasCombatFeatures && score > 0 && score < 1) {
    return 'Uncommon';
  }

  if (score < 1) return 'Common';
  if (score < 2) return 'Uncommon';
  if (score < 3) return 'Rare';
  if (score < 4) return 'Very Rare';
  return 'Legendary';
}

// Rarity order for calculating distance
const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

function getRarityDistance(calculated, official) {
  const idx1 = RARITY_ORDER.findIndex(r => r.toLowerCase() === calculated.toLowerCase());
  const idx2 = RARITY_ORDER.findIndex(r => r.toLowerCase() === official.toLowerCase());
  return idx1 - idx2; // Positive = overvalued, Negative = undervalued
}

// Process items
const results = srdItems
  .filter(item => item.rarity)
  .map(item => {
    const score = calculateCombatScore(item.combat);
    const hasCombatFeatures = score > 0;
    // For items with manual rarity override, use the official rarity instead of calculating
    const calculated = item.manualRarity ? item.rarity : scoreToRarity(score, hasCombatFeatures);
    const distance = getRarityDistance(calculated, item.rarity);
    return {
      name: item.name,
      official: item.rarity,
      calculated,
      score,
      distance,
      baseItem: item.baseItem,
      manualOverride: item.manualRarity || false
    };
  });

// Summary statistics
const total = results.length;
const exact = results.filter(r => r.distance === 0).length;
const off1 = results.filter(r => Math.abs(r.distance) === 1).length;
const off2plus = results.filter(r => Math.abs(r.distance) >= 2).length;
const overvalued = results.filter(r => r.distance > 0);
const undervalued = results.filter(r => r.distance < 0);

console.log('=== SRD ITEM ACCURACY AUDIT ===\n');
console.log(`Total SRD items with rarity: ${total}`);
console.log(`Exact matches: ${exact} (${(exact/total*100).toFixed(1)}%)`);
console.log(`Off by 1 tier: ${off1} (${(off1/total*100).toFixed(1)}%)`);
console.log(`Off by 2+ tiers: ${off2plus} (${(off2plus/total*100).toFixed(1)}%)`);
console.log(`\nOvervalued (calc > official): ${overvalued.length}`);
console.log(`Undervalued (calc < official): ${undervalued.length}\n`);

console.log('=== WORST MISMATCHES (2+ tiers off) ===');
results.filter(r => Math.abs(r.distance) >= 2)
  .sort((a, b) => Math.abs(b.distance) - Math.abs(a.distance))
  .slice(0, 20)
  .forEach(r => {
    const dir = r.distance > 0 ? 'OVER' : 'UNDER';
    console.log(`${dir}: ${r.name} - Official: ${r.official}, Calc: ${r.calculated} (${r.score.toFixed(1)} pts)`);
  });

console.log(`\n... and ${Math.max(0, results.filter(r => Math.abs(r.distance) >= 2).length - 20)} more\n`);

// Export full results for further analysis
console.log('=== BY DISTANCE ===');
[3, 2, 1, 0, -1, -2, -3].forEach(dist => {
  const count = results.filter(r => r.distance === dist).length;
  if (count > 0) {
    const label = dist > 0 ? `+${dist} (overvalued)` : dist < 0 ? `${dist} (undervalued)` : '0 (exact)';
    console.log(`${label}: ${count} items`);
  }
});
