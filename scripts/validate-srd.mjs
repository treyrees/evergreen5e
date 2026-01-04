/**
 * Validate calculator.ts against SRD items
 * Run with: node --experimental-vm-modules scripts/validate-srd.mjs
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';

// Read the SRD items
const srdItems = JSON.parse(readFileSync('./data/srd-items.json', 'utf8'));

// Since we can't easily import TypeScript, we'll implement a simplified version
// that matches the key logic from calculator.ts

const DIE_TYPE_VALUES = {
  'd4': 0.5, 'd6': 1.0, 'd8': 1.25, 'd10': 1.5, 'd12': 1.75, 'd20': 2.5,
};

const DAMAGE_TYPE_MULTIPLIERS = {
  'force': 1.2, 'psychic': 1.15, 'radiant': 1.1,
  'fire': 1.0, 'cold': 1.0, 'lightning': 1.0, 'thunder': 1.0, 'acid': 1.0,
  'bludgeoning': 1.0, 'piercing': 1.0, 'slashing': 1.0,
  'necrotic': 0.9, 'poison': 0.7,
};

const RECHARGE_MULTIPLIERS = {
  'dawn': 0.10, 'long rest': 0.20, 'short rest': 0.4,
};

const SPELL_LEVEL_VALUES = {
  0: 0.1, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 7, 7: 10, 8: 14, 9: 20,
};

function getDiceValue(diceString) {
  const match = diceString.match(/^(\d+)d(\d+)$/);
  if (!match) return 0;
  const numDice = parseInt(match[1]);
  const dieType = `d${match[2]}`;
  return numDice * (DIE_TYPE_VALUES[dieType] || 1.0);
}

function calculateCombatScore(combat, baseItem) {
  let score = 0;

  // Check if armor/shield for AC stacking
  const isArmorOrShield = baseItem && ['armor (light)', 'armor (medium)', 'armor (heavy)', 'shield'].includes(baseItem);
  const acBonus = combat.acBonus || 0;
  const acStackingMultiplier = isArmorOrShield ? 1.0 : (1.0 + (0.5 * acBonus));

  // Enhancement
  const enhancementMultiplier = combat.enhancementMultiplier ?? 1.0;
  score += (combat.enhancement || 0) * enhancementMultiplier;

  // Damage bonus
  if (combat.damageBonus?.dice) {
    let diceValue = getDiceValue(combat.damageBonus.dice);
    const damageType = combat.damageBonus.type?.toLowerCase() || 'fire';
    diceValue *= DAMAGE_TYPE_MULTIPLIERS[damageType] || 1.0;

    if (combat.damageBonus.vicious) {
      diceValue *= 0.05;
    } else {
      const frequency = combat.damageBonus.frequency || 'per-hit';
      if (frequency === 'per-turn') diceValue *= 0.4;
    }

    if (combat.damageBonus.conditionalType) {
      const conditionalMultipliers = {
        'creature-common': 0.6, 'creature-rare': 0.4, 'sworn-enemy': 0.6, 'environmental': 0.25,
      };
      diceValue *= conditionalMultipliers[combat.damageBonus.conditionalType] || 0.5;
    } else if (combat.damageBonus.conditional) {
      diceValue *= 0.5;
    }
    score += diceValue;
  }

  // AC bonus
  if (combat.acBonus) {
    const acMultiplier = combat.acBonusMultiplier ?? 1.0;
    score += combat.acBonus * acMultiplier * acStackingMultiplier;
  }

  // Saving throw bonus
  if (combat.savingThrowBonus) {
    const saveMultiplier = combat.savingThrowBonusMultiplier ?? 1.0;
    score += combat.savingThrowBonus * saveMultiplier;
  }

  // Spell save DC bonus
  if (combat.spellSaveDCBonus) {
    score += combat.spellSaveDCBonus * 1.0;
  }

  // Spell attack bonus
  if (combat.spellAttackBonus) {
    score += combat.spellAttackBonus * 0.75;
  }

  // Ability score setter
  if (combat.abilityScoreSetter) {
    const setValue = combat.abilityScoreSetter.setValue;
    const ability = combat.abilityScoreSetter.ability?.toUpperCase() || 'STR';

    let baseValue;
    if (setValue >= 26) baseValue = 4.0;
    else if (setValue >= 24) baseValue = 3.5;
    else if (setValue >= 22) baseValue = 3.0;
    else if (setValue >= 20) baseValue = 2.0;
    else baseValue = 1.5;

    const abilityMultipliers = { 'CON': 1.34, 'DEX': 1.17, 'STR': 1.0, 'WIS': 1.0, 'INT': 1.0, 'CHA': 1.0 };
    score += baseValue * (abilityMultipliers[ability] || 1.0);
  }

  // Ability score bonus
  if (combat.abilityScoreBonus) {
    score += combat.abilityScoreBonus.bonus * 0.75;
  }

  // Flight
  if (combat.flight) {
    if (combat.flight.flySpeed !== undefined || combat.flight.flyDuration !== undefined) {
      const flySpeed = combat.flight.flySpeed || 30;
      const flyDuration = combat.flight.flyDuration;

      let speedScore;
      if (flySpeed >= 60) speedScore = 2.0;
      else if (flySpeed >= 50) speedScore = 1.0;
      else if (flySpeed >= 40) speedScore = 0.85;
      else speedScore = 0.75;

      let durationBonus = 0;
      if (flyDuration === 'unlimited') durationBonus = 0.1;
      else if (typeof flyDuration === 'number') {
        if (flyDuration >= 4) durationBonus = 0.25;
        else if (flyDuration >= 2) durationBonus = 0.15;
      }
      score += speedScore + durationBonus;
    } else if (combat.flight.duration === 'unlimited') {
      score += 1.5;
    } else if (combat.flight.hoursPerDay && combat.flight.hoursPerDay >= 4) {
      score += 1.0;
    } else {
      score += 1.0;
    }
  }

  // Permanent buffs
  if (combat.permanentBuffs) {
    const PERMANENT_BUFF_VALUES = {
      flight: 2.0, darkvision: 0.25, blindsight: 0.75, speedBonus: 0.5,
      tremorsense: 0.5, climbBurrow: 0.5, truesight: 1.5, seeInvisibility: 0.75, swimming: 0.5,
    };
    for (const [buff, enabled] of Object.entries(combat.permanentBuffs)) {
      if (enabled && PERMANENT_BUFF_VALUES[buff]) {
        score += PERMANENT_BUFF_VALUES[buff];
      }
    }
  }

  // Resistances with diminishing returns
  const DAMAGE_RESISTANCE_VALUES = {
    'fire': 2.25, 'poison': 2.0, 'cold': 2.0, 'necrotic': 1.75, 'lightning': 1.75,
    'acid': 1.5, 'bludgeoning': 1.25, 'piercing': 1.25, 'slashing': 1.25,
    'thunder': 1.25, 'psychic': 1.0, 'radiant': 0.75, 'force': 0.5,
  };
  const DAMAGE_IMMUNITY_VALUES = {
    'fire': 2.7, 'poison': 2.4, 'cold': 2.4, 'necrotic': 2.1, 'lightning': 2.1,
    'acid': 1.8, 'bludgeoning': 1.5, 'piercing': 1.5, 'slashing': 1.5,
    'thunder': 1.5, 'psychic': 1.2, 'radiant': 1.0, 'force': 0.75,
  };

  const allDefenses = [];
  if (combat.resistances) {
    const resistMultiplier = combat.resistancesMultiplier ?? 1.0;
    for (const resistance of combat.resistances) {
      allDefenses.push({
        value: DAMAGE_RESISTANCE_VALUES[resistance.toLowerCase()] ?? 1.5,
        multiplier: resistMultiplier,
      });
    }
  }
  if (combat.damageImmunities) {
    const immunityMultiplier = combat.damageImmunitiesMultiplier ?? 1.0;
    for (const immunity of combat.damageImmunities) {
      allDefenses.push({
        value: DAMAGE_IMMUNITY_VALUES[immunity.toLowerCase()] ?? 1.5,
        multiplier: immunityMultiplier,
      });
    }
  }
  if (allDefenses.length > 0) {
    allDefenses.sort((a, b) => b.value - a.value);
    const STACKING_MULTIPLIERS = [1.0, 0.6, 0.35, 0.2];
    for (let i = 0; i < allDefenses.length; i++) {
      const stackingMult = STACKING_MULTIPLIERS[Math.min(i, 3)];
      score += allDefenses[i].value * allDefenses[i].multiplier * stackingMult;
    }
  }

  // Condition immunities
  if (combat.conditionImmunities && combat.conditionImmunities.length > 0) {
    const conditionMultiplier = combat.conditionImmunitiesMultiplier ?? 1.0;
    const CONDITION_IMMUNITY_VALUES = {
      'paralyzed': 0.75, 'stunned': 0.65, 'petrified': 0.65, 'incapacitated': 0.5,
      'unconscious': 0.5, 'exhaustion': 0.5, 'charmed': 0.5, 'frightened': 0.5,
      'restrained': 0.6, 'poisoned': 0.3, 'blinded': 0.3, 'deafened': 0.15,
      'grappled': 0.3, 'prone': 0.3,
    };
    const conditionsLower = combat.conditionImmunities.map(c => c.toLowerCase());
    for (const condition of conditionsLower) {
      score += (CONDITION_IMMUNITY_VALUES[condition] ?? 0.35) * conditionMultiplier;
    }
    // Synergy bonuses
    const physicalControl = ['grappled', 'prone', 'restrained'];
    const physicalCount = physicalControl.filter(c => conditionsLower.includes(c)).length;
    if (physicalCount >= 3) score += 1.0 * conditionMultiplier;
    else if (physicalCount >= 2) score += 0.5 * conditionMultiplier;

    const mentalControl = ['charmed', 'frightened'];
    const mentalCount = mentalControl.filter(c => conditionsLower.includes(c)).length;
    if (mentalCount >= 2) score += 0.5 * conditionMultiplier;

    const incapBundle = ['stunned', 'paralyzed', 'incapacitated'];
    const incapCount = incapBundle.filter(c => conditionsLower.includes(c)).length;
    if (incapCount >= 3) score += 1.0 * conditionMultiplier;
    else if (incapCount >= 2) score += 0.5 * conditionMultiplier;
  }

  // Legacy spell charges
  if (combat.charges && combat.charges.length > 0) {
    for (const charge of combat.charges) {
      const normalizedRecharge = charge.recharge === 'dawn' ? 'long rest' : charge.recharge;
      const multiplier = RECHARGE_MULTIPLIERS[normalizedRecharge] || 0.5;
      const effectiveLevel = SPELL_LEVEL_VALUES[charge.spellLevel] ?? charge.spellLevel;
      score += effectiveLevel * charge.usesPerDay * multiplier;
    }
  }

  // Advantage
  if (combat.advantage && combat.advantage.length > 0) {
    const BONUS_VALUES = {
      'initiative': 0.75, 'attack': 1.0,
      'dex-saves': 1.25, 'wis-saves': 1.10, 'con-saves': 1.00,
      'str-saves': 0.65, 'cha-saves': 0.60, 'int-saves': 0.40,
      'perception': 0.25, 'stealth': 0.25,
    };
    const advantageMultiplier = combat.advantageMultiplier ?? 1.0;
    for (const adv of combat.advantage) {
      score += (BONUS_VALUES[adv] || 0.25) * advantageMultiplier;
    }
  }

  // Hands-free defense
  if (combat.handsFreeDef) {
    score += 3.0;
  }

  // NEW: Charge pool with shared charges fix
  if (combat.chargePool && combat.chargePool.abilities.length > 0) {
    const dailyRecharge = combat.chargePool.chargesPerLongRest + (combat.chargePool.chargesPerShortRest * 2);

    // Calculate value-per-charge for each ability
    const abilitiesWithValue = combat.chargePool.abilities
      .filter(ability => ability.chargesPerUse > 0)
      .map(ability => {
        const effectiveLevel = SPELL_LEVEL_VALUES[ability.spellLevel] ?? ability.spellLevel;
        const valuePerCharge = effectiveLevel / ability.chargesPerUse;
        return { ...ability, effectiveLevel, valuePerCharge };
      });

    // Sort by value-per-charge (highest first)
    abilitiesWithValue.sort((a, b) => b.valuePerCharge - a.valuePerCharge);

    // Score the PRIMARY ability at full value
    if (abilitiesWithValue.length > 0) {
      const primary = abilitiesWithValue[0];
      const burstUses = combat.chargePool.maxCharges / primary.chargesPerUse;
      const sustainedUses = dailyRecharge > 0
        ? Math.min(dailyRecharge, combat.chargePool.maxCharges) / primary.chargesPerUse
        : 1 / primary.chargesPerUse;
      const burstWeight = Math.min(0.5, primary.spellLevel * 0.15);
      const effectiveUses = sustainedUses * (1 - burstWeight) + burstUses * burstWeight;
      const multiplier = 0.20;
      score += primary.effectiveLevel * effectiveUses * multiplier;

      // Secondary abilities add small flexibility bonus (10%)
      const FLEXIBILITY_MULTIPLIER = 0.10;
      for (let i = 1; i < abilitiesWithValue.length; i++) {
        const secondary = abilitiesWithValue[i];
        score += secondary.effectiveLevel * FLEXIBILITY_MULTIPLIER;
      }
    }
  }

  return score;
}

function getItemScore(item) {
  const baseScore = item.combat ? calculateCombatScore(item.combat, item.baseItem) : 0;
  return baseScore + (item.overrideBonus ?? 0);
}

function scoreToRarity(score, hasCombatFeatures = false) {
  if (hasCombatFeatures && score > 0 && score < 1) return 'Uncommon';
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

// Run validation
console.log('=== SRD ITEM VALIDATION ===\n');

const results = srdItems
  .filter(item => item.rarity)
  .map(item => {
    const score = getItemScore(item);
    const hasCombatFeatures = score > 0;
    const calculated = scoreToRarity(score, hasCombatFeatures);
    const distance = getRarityDistance(calculated, item.rarity);
    return {
      name: item.name,
      official: item.rarity,
      calculated,
      score,
      distance,
      hasChargePool: !!item.combat?.chargePool,
      hasLegacyCharges: !!item.combat?.charges,
    };
  });

const total = results.length;
const exact = results.filter(r => r.distance === 0).length;
const off1 = results.filter(r => Math.abs(r.distance) === 1).length;
const off2plus = results.filter(r => Math.abs(r.distance) >= 2).length;

console.log(`Total items: ${total}`);
console.log(`Exact match: ${exact}/${total} (${(exact/total*100).toFixed(1)}%)`);
console.log(`Off by 1: ${off1}/${total} (${(off1/total*100).toFixed(1)}%)`);
console.log(`Off by 2+: ${off2plus}/${total} (${(off2plus/total*100).toFixed(1)}%)`);

console.log('\n=== ITEMS OFF BY 1+ TIER ===\n');
results
  .filter(r => Math.abs(r.distance) >= 1)
  .sort((a, b) => Math.abs(b.distance) - Math.abs(a.distance))
  .forEach(r => {
    const direction = r.distance > 0 ? '↑' : '↓';
    const chargeInfo = r.hasChargePool ? ' [chargePool]' : (r.hasLegacyCharges ? ' [charges]' : '');
    console.log(`  ${r.name}: ${r.score.toFixed(2)} pts → ${r.calculated} (official: ${r.official}) ${direction}${Math.abs(r.distance)}${chargeInfo}`);
  });

console.log('\n=== ITEMS WITH CHARGE POOLS ===\n');
results
  .filter(r => r.hasChargePool)
  .forEach(r => {
    const match = r.distance === 0 ? '✓' : '✗';
    console.log(`  ${match} ${r.name}: ${r.score.toFixed(2)} pts → ${r.calculated} (official: ${r.official})`);
  });
