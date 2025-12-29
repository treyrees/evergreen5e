import { readFileSync } from 'fs';

// Read SRD items
const srdItems = JSON.parse(readFileSync('./data/srd-items.json', 'utf8'));

// Inline calculator logic
const DIE_TYPE_VALUES = {
  'd4': 0.5, 'd6': 1.0, 'd8': 1.25, 'd10': 1.5, 'd12': 1.75, 'd20': 2.5,
};

const DAMAGE_TYPE_MULTIPLIERS = {
  'force': 1.2, 'psychic': 1.15, 'radiant': 1.1,
  'fire': 1.0, 'cold': 1.0, 'lightning': 1.0, 'thunder': 1.0, 'acid': 1.0,
  'bludgeoning': 1.0, 'piercing': 1.0, 'slashing': 1.0,  // Magic weapons bypass non-magical resistance
  'necrotic': 0.9, 'poison': 0.7,
};

function getDiceValue(diceString) {
  const match = diceString.match(/^(\d+)d(\d+)$/);
  if (!match) return 0;
  const numDice = parseInt(match[1]);
  const dieType = `d${match[2]}`;
  return numDice * (DIE_TYPE_VALUES[dieType] || 1.0);
}

const RECHARGE_MULTIPLIERS = {
  'long rest': 0.20,  // Reduced from 0.25 to fix wand overvaluation
  'short rest': 0.4,
};

function getItemScore(item) {
  if (item.overrideScore !== undefined) {
    return item.overrideScore;
  }
  const baseScore = item.combat ? calculateCombatScore(item.combat, item.baseItem) : 0;
  const bonus = item.overrideBonus ?? 0;
  return baseScore + bonus;
}

function calculateCombatScore(combat, baseItem) {
  let score = 0;

  // Determine if this is an armor/shield item (AC doesn't stack) or other (AC stacks)
  const isArmorOrShield = baseItem && ['armor (light)', 'armor (medium)', 'armor (heavy)', 'shield'].includes(baseItem);
  const acStackingMultiplier = isArmorOrShield ? 1.0 : 1.5;

  // Enhancement bonus (with optional multiplier)
  const enhancementMultiplier = combat.enhancementMultiplier ?? 1.0;
  score += (combat.enhancement || 0) * enhancementMultiplier;

  // Damage bonus
  if (combat.damageBonus) {
    let diceValue = getDiceValue(combat.damageBonus.dice);
    const damageType = combat.damageBonus.type.toLowerCase();
    const typeMultiplier = DAMAGE_TYPE_MULTIPLIERS[damageType] || 1.0;
    diceValue *= typeMultiplier;

    // Vicious (critical-only damage): only applies on natural 20 (5% of attacks)
    if (combat.damageBonus.vicious) {
      diceValue *= 0.05;
    }
    // Frequency multiplier (if not vicious)
    else {
      const frequency = combat.damageBonus.frequency || 'per-hit';
      if (frequency === 'per-turn') diceValue *= 0.4;
    }

    // Conditional damage - uses conditionalType for specific multipliers
    if (combat.damageBonus.conditionalType) {
      const conditionalMultipliers = {
        'creature-common': 0.6,   // Undead, fiends, humanoids - frequent
        'creature-rare': 0.4,     // Giants, dragons, constructs - less common
        'sworn-enemy': 0.6,       // Single declared target (Oathbow) - always active in combat
        'environmental': 0.25,    // "In darkness", "underwater", situational
      };
      diceValue *= conditionalMultipliers[combat.damageBonus.conditionalType] || 0.5;
    } else if (combat.damageBonus.conditional) {
      // Legacy fallback
      diceValue *= 0.5;
    }
    score += diceValue;
  }

  // AC bonus (with stacking multiplier for non-armor items)
  if (combat.acBonus) {
    const acMultiplier = combat.acBonusMultiplier ?? 1.0;
    score += combat.acBonus * acMultiplier * acStackingMultiplier;
  }

  // Saving throw bonus (with optional multiplier)
  if (combat.savingThrowBonus) {
    const saveMultiplier = combat.savingThrowBonusMultiplier ?? 1.0;
    score += combat.savingThrowBonus * saveMultiplier;
  }

  // Ability score setter - scales with value AND ability type
  if (combat.abilityScoreSetter) {
    const setValue = combat.abilityScoreSetter.setValue;
    const ability = (combat.abilityScoreSetter.ability || 'STR').toUpperCase();

    let baseValue;
    if (setValue >= 25) baseValue = 4.0;
    else if (setValue >= 23) baseValue = 3.5;
    else if (setValue >= 21) baseValue = 3.0;
    else if (setValue >= 20) baseValue = 2.0;
    else baseValue = 1.5;

    const abilityMultipliers = {
      'CON': 1.34,
      'DEX': 1.17,
      'STR': 1.0,
      'WIS': 1.0,
      'INT': 1.0,
      'CHA': 1.0,
    };

    const multiplier = abilityMultipliers[ability] || 1.0;
    score += baseValue * multiplier;
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

  // Resistances (with optional multiplier)
  if (combat.resistances && combat.resistances.length > 0) {
    const resistMultiplier = combat.resistancesMultiplier ?? 1.0;
    score += combat.resistances.length * 2.0 * resistMultiplier;
  }

  // Spell level values - high level spells scale non-linearly
  const SPELL_LEVEL_VALUES = {
    0: 0.1, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5,
    6: 7, 7: 10, 8: 14, 9: 20,  // Campaign-defining spells
  };

  // Legacy charges
  if (combat.charges) {
    for (const charge of combat.charges) {
      // Normalize "dawn" and "per day" to "long rest"
      const normalizedRecharge = (charge.recharge === 'dawn' || charge.recharge === 'per day')
        ? 'long rest'
        : charge.recharge;
      const multiplier = RECHARGE_MULTIPLIERS[normalizedRecharge] || 0.5;
      const effectiveLevel = SPELL_LEVEL_VALUES[charge.spellLevel] ?? charge.spellLevel;
      score += effectiveLevel * charge.usesPerDay * multiplier;
    }
  }

  // Charge pool (blended burst/sustained scoring)
  if (combat.chargePool && combat.chargePool.abilities.length > 0) {
    const dailyRecharge =
      combat.chargePool.chargesPerLongRest +
      (combat.chargePool.chargesPerShortRest * 2);

    for (const ability of combat.chargePool.abilities) {
      if (ability.chargesPerUse > 0) {
        // Burst potential: you can nova ALL charges in a single fight
        const burstUses = combat.chargePool.maxCharges / ability.chargesPerUse;

        // Sustained uses: what you get back per day
        const sustainedUses = dailyRecharge > 0
          ? Math.min(dailyRecharge, combat.chargePool.maxCharges) / ability.chargesPerUse
          : 1 / ability.chargesPerUse;

        // Blend burst and sustained: burst matters more for powerful spells
        const burstWeight = Math.min(0.5, ability.spellLevel * 0.15);
        const effectiveUses = sustainedUses * (1 - burstWeight) + burstUses * burstWeight;

        // Use effective spell level (high-level spells scale non-linearly)
        const effectiveLevel = SPELL_LEVEL_VALUES[ability.spellLevel] ?? ability.spellLevel;

        const multiplier = 0.20;
        score += effectiveLevel * effectiveUses * multiplier;
      }
    }
  }

  // === NEW SRD 5.2.1 MECHANICS ===

  // Advantage on checks/saves
  const ADVANTAGE_VALUES = {
    'initiative': 0.75,
    'attack': 1.5,
    'saves': 1.5,
    'dex-saves': 0.5,
    'str-saves': 0.25,
    'con-saves': 0.5,
    'perception': 0.25,
    'stealth': 0.25,
    'acrobatics': 0.25,
  };
  if (combat.advantage) {
    for (const adv of combat.advantage) {
      score += ADVANTAGE_VALUES[adv] || 0.25;
    }
  }

  // Reaction AC bonus
  if (combat.reactionAC) {
    const { bonus, usesPerShortRest = 0, usesPerLongRest = 0, unlimited = false } = combat.reactionAC;
    if (unlimited) {
      score += bonus * 0.5;
    } else {
      const dailyUses = usesPerLongRest + (usesPerShortRest * 3);
      const useRate = Math.min(1, dailyUses / 10);
      score += bonus * 0.3 * useRate * dailyUses;
    }
  }

  // Bonus action damage
  if (combat.bonusActionDamage) {
    let bashValue = getDiceValue(combat.bonusActionDamage.dice);
    const typeMultiplier = DAMAGE_TYPE_MULTIPLIERS[combat.bonusActionDamage.type?.toLowerCase() || 'bludgeoning'] || 1.0;
    bashValue *= typeMultiplier;
    if (combat.bonusActionDamage.flatBonus) {
      bashValue += combat.bonusActionDamage.flatBonus * 0.3;
    }
    score += bashValue * 0.4;
  }

  // Condition infliction
  const CONDITION_VALUES = {
    'restrained': 1.5,
    'prone': 0.5,
    'frightened': 1.0,
    'paralyzed': 2.0,
    'stunned': 1.5,
    'blinded': 1.0,
    'poisoned': 0.75,
  };
  if (combat.conditionInfliction) {
    const baseValue = CONDITION_VALUES[combat.conditionInfliction.condition] || 0.5;
    const dcModifier = (combat.conditionInfliction.dc - 10) * 0.05;
    score += baseValue * (1 + dcModifier);
  }

  // Damage type override
  if (combat.damageTypeOverride) {
    const typeMultiplier = DAMAGE_TYPE_MULTIPLIERS[combat.damageTypeOverride.toLowerCase()] || 1.0;
    const baseDamageTypeMultiplier = DAMAGE_TYPE_MULTIPLIERS['piercing'] || 0.85;
    const typeUpgrade = (typeMultiplier - baseDamageTypeMultiplier) * 1.0;
    if (typeUpgrade > 0) {
      score += typeUpgrade;
    }
  }

  // Hands-free defense
  if (combat.handsFreeDef) {
    score += 3.0;
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
    const score = getItemScore(item);
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

console.log('\n=== OFF BY 1 TIER (detailed) ===');
results.filter(r => Math.abs(r.distance) === 1)
  .sort((a, b) => b.distance - a.distance)
  .forEach(r => {
    const dir = r.distance > 0 ? 'OVER' : 'UNDER';
    console.log(`${dir}: ${r.name} - Official: ${r.official}, Calc: ${r.calculated} (${r.score.toFixed(2)} pts)`);
  });
