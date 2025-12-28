import { readFileSync } from 'fs';

const srdItems = JSON.parse(readFileSync('./data/srd-items.json', 'utf8'));

const DICE_VALUES = {
  '1d4': 0.5, '1d6': 1, '1d8': 1.25, '1d10': 1.5,
  '2d6': 2, '3d6': 3, '2d8': 2.5, '3d8': 3.75, '4d6': 4,
};

// Test different dawn multipliers
function getRechargeMultipliers(dawnMult) {
  return {
    'dawn': dawnMult,
    'long rest': 0.25,
    'short rest': 0.4,
  };
}

function calculateCombatScore(combat, chargePoolMultiplier = 0.2, useMinimumFloor = false, dawnMultiplier = 0.25) {
  let score = 0;

  score += combat.enhancement || 0;

  if (combat.damageBonus) {
    let diceValue = DICE_VALUES[combat.damageBonus.dice] || 0;
    const frequency = combat.damageBonus.frequency || 'per-hit';
    if (frequency === 'per-turn') diceValue *= 0.4;
    if (combat.damageBonus.conditional) diceValue *= 0.25;
    score += diceValue;
  }

  score += combat.acBonus || 0;
  score += combat.savingThrowBonus || 0;

  if (combat.resistances) {
    score += combat.resistances.length * 1.5;
  }

  if (combat.charges) {
    const rechargeMultipliers = getRechargeMultipliers(dawnMultiplier);
    for (const charge of combat.charges) {
      const multiplier = rechargeMultipliers[charge.recharge] || 0.1;
      score += charge.spellLevel * charge.usesPerDay * multiplier;
    }
  }

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
        score += ability.spellLevel * effectiveUses * chargePoolMultiplier;
      }
    }
  }

  // Apply minimum floor if enabled
  if (useMinimumFloor && score > 0 && score < 1) {
    score = 1; // Bump to Uncommon
  }

  return score;
}

function scoreToRarity(score) {
  if (score < 1) return 'Common';
  if (score < 2) return 'Uncommon';
  if (score < 3) return 'Rare';
  if (score < 4) return 'Very Rare';
  return 'Legendary';
}

const RARITY_ORDER = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'];

function getRarityDistance(calculated, official) {
  const idx1 = RARITY_ORDER.findIndex(r => r.toLowerCase() === calculated.toLowerCase());
  const idx2 = RARITY_ORDER.findIndex(r => r.toLowerCase() === official.toLowerCase());
  return idx1 - idx2;
}

// Test different dawn multipliers
const dawnMultipliers = [0.08, 0.10, 0.12, 0.14, 0.15];

console.log('=== TESTING DAWN RECHARGE MULTIPLIERS ===\n');

dawnMultipliers.forEach(dawnMult => {
  const results = srdItems
    .filter(item => item.rarity)
    .map(item => {
      const score = calculateCombatScore(item.combat, 0.15, true, dawnMult); // chargePool=0.15, floor=true
      const calculated = scoreToRarity(score);
      const distance = getRarityDistance(calculated, item.rarity);
      return { name: item.name, official: item.rarity, calculated, score, distance };
    });

  const total = results.length;
  const exact = results.filter(r => r.distance === 0).length;
  const off1 = results.filter(r => Math.abs(r.distance) === 1).length;
  const off2plus = results.filter(r => Math.abs(r.distance) >= 2).length;

  console.log(`Dawn multiplier: ${dawnMult.toFixed(2)} (chargePool=0.15, with floor)`);
  console.log(`  Exact: ${exact}/${total} (${(exact/total*100).toFixed(1)}%)`);
  console.log(`  Off by 1: ${off1}/${total} (${(off1/total*100).toFixed(1)}%)`);
  console.log(`  Off by 2+: ${off2plus}/${total} (${(off2plus/total*100).toFixed(1)}%)`);

  // Show the problem wands
  const wands = results.filter(r => r.name.includes('Wand of Fire') || r.name.includes('Wand of Light'));
  if (wands.length > 0) {
    wands.forEach(w => {
      console.log(`    ${w.name}: ${w.score.toFixed(1)} pts → ${w.calculated} (official: ${w.official})`);
    });
  }
  console.log('');
});
