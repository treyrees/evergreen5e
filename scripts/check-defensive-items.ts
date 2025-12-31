import { calculateCombatScore, getSuggestedRarity } from '../lib/calculator';
const items = require('../data/srd-items.json');

const withResist = items.filter((i: any) => i.combat?.resistances?.length > 0);

console.log('=== CURRENT SCORING FOR RESISTANCE ITEMS ===\n');
withResist.forEach((i: any) => {
  const score = calculateCombatScore(i.combat);
  const suggested = getSuggestedRarity(score);
  const match = suggested === i.rarity ? 'MATCH' : 'MISMATCH';
  console.log(`${match} ${i.name}`);
  console.log(`   Book: ${i.rarity} | Calculated: ${suggested} (${score.toFixed(2)} pts)`);
  console.log(`   Resistances: ${i.combat.resistances.join(', ')}`);
  if (i.overrideBonus !== undefined) console.log(`   Override Bonus: ${i.overrideBonus}`);
  console.log(`   Combat data: ${JSON.stringify(i.combat)}`);
  console.log('');
});
