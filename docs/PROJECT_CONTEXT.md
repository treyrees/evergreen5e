# Evergreen 5e - Project Context

## What is Evergreen 5e?

Evergreen 5e is a D&D 5th Edition magic item balance calculator. It helps DMs and players determine the appropriate rarity for custom magic items by:

1. **Deconstructing SRD Items**: Breaking down official SRD 5.2.1 magic items into quantifiable combat features (enhancement bonuses, damage dice, AC, saves, ability scores, flight, resistances, spell charges, etc.)

2. **Calculating Power Scores**: Converting these features into a numerical "power score" using weighted formulas calibrated against official item rarities

3. **Mapping Custom Items**: Allowing users to input their custom item's features and calculating a suggested rarity based on the same scoring system

4. **Anchor Comparisons**: Showing similar official items at the same rarity tier so users can validate their custom item against known reference points

### The Core Concept

The calculator treats official SRD items as "sources of truth." If an official Rare item scores 2.5 points, then a custom item scoring 2.5 points should also be Rare. This creates a transparent, reproducible system for item balance.

**Rarity Thresholds:**
- Common: < 1.0 pts
- Uncommon: 1.0 - 1.9 pts
- Rare: 2.0 - 2.9 pts
- Very Rare: 3.0 - 3.9 pts
- Legendary: 4.0+ pts

## Tech Stack

- **Framework**: Next.js 15.1.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Data**: Static JSON (`data/srd-items.json`)

### Key Files

```
/app
  /calculator/page.tsx    # Main calculator UI
  /items/page.tsx         # SRD items reference table
  /page.tsx               # Landing page
/lib
  /calculator.ts          # Core scoring algorithm
  /item-balance-flags.ts  # Discrepancy categorization
/data
  /srd-items.json         # 49 SRD magic items with combat features
/types
  /magic-item.ts          # TypeScript interfaces
/scripts
  /audit.mjs              # Accuracy testing script
```

## Current Deployment

- **Platform**: Vercel
- **Production Branch**: `claude/evergreen5e-calculator-IMiwJ`
- **Preview Deployments**: Automatic for feature branches

## What's Working

### Calculator Features
- Enhancement bonuses (+1/+2/+3 weapons/armor)
- Damage dice with type multipliers (Force > Radiant > Fire > Poison)
- Vicious weapons (crit-only damage at 5% proc rate)
- Per-turn vs per-hit damage frequency
- Conditional damage (×0.25 for creature-type specific)
- AC bonuses
- Saving throw bonuses
- Ability score setters (19/21/23/25) with ability-type multipliers (CON > DEX > STR)
- Ability score bonuses
- Flight (unlimited vs limited duration)
- Damage resistances
- Spell charges (with recharge multipliers)
- Charge pools (Staff of Power style)

### SRD 5.2.1 Mechanics (New)
- Advantage on specific checks/saves
- Reaction-based AC bonuses
- Bonus action damage (shield bash)
- Condition infliction (restrained, prone, etc.)
- Damage type override (force arrows)
- Hands-free defense (Animated Shield)

### Accuracy
- **77.6% exact match** (38/49 items)
- **22.4% off by 1 tier** (11 items)
- **0% off by 2+ tiers**

### Discrepancy System
Items that don't match are properly flagged with explanations in three categories:

1. **Special Mechanics** (⭐): Non-numerical bonuses like flight, invisibility, instant kill
2. **Numerical Edge Cases** (🔢): Conditional bonuses dependent on setting/campaign
3. **Community Notes** (💬): Items considered underpowered for their tier

## What Needs Fixing

### Known Issues

1. **Override Dependency**: 7 items still require manual override scores because their mechanics can't be expressed numerically (Vorpal Sword, Nine Lives Stealer, etc.)

2. **Flight Valuation**: Broom of Flying calculates as Rare (2.0 pts) but is officially Uncommon. Flight value is hard to quantify consistently.

3. **Stacking Bonuses**: Items like Staff of Power and Cloak of Protection that provide multiple small bonuses tend to calculate higher than their official rarity.

4. **Conditional Damage**: The ×0.25 multiplier for creature-specific damage may be too aggressive for common enemy types (undead, giants).

### Future Enhancements

1. **User Input UI**: Allow users to input all combat features for their custom items (currently limited)

2. **More SRD Items**: Expand beyond the current 49 items

3. **Non-Combat Features**: Utility effects, roleplay benefits, attunement requirements

4. **Campaign Context**: Sliders for "how common are undead/giants/dragons in your campaign" to adjust conditional damage values

5. **Export/Share**: Save and share custom item builds

## Architecture Decisions

### Why Static JSON?

The SRD item data is stored in a static JSON file rather than a database because:
- Data changes infrequently (only when SRD updates)
- No user accounts or persistence needed
- Enables static site generation for fast performance
- Simplifies deployment (no database to manage)

### Why Override Scores?

Some item mechanics genuinely can't be reduced to numbers:
- Vorpal Sword's instant decapitation
- Ring of Spell Storing's action economy breaking
- Cloak of Invisibility's tactical advantage

For these, we use `overrideScore` to manually set the power level. This is a last resort when math fails.

### Why Three Discrepancy Categories?

Not all mismatches are equal:
- **Special Mechanics**: The calculator is working correctly; the item just has features we can't model
- **Numerical Edge Cases**: The calculator could model this, but it's too campaign-dependent
- **Community Notes**: Community consensus that the official rating is wrong

This helps users understand whether to trust the calculation or the official rating.

### Scoring Philosophy

The scoring system is designed to be:
1. **Transparent**: Every calculation is visible in Formula Details
2. **Calibrated**: Weights are tuned against official items, not theory
3. **Conservative**: When uncertain, we flag the discrepancy rather than override
4. **Honest**: We report 77.6% accuracy, not claim 100% with hidden overrides

### UI Decisions

- **Dark theme**: Easier on eyes for long sessions
- **Collapsible sections**: Advanced info hidden by default
- **Anchor comparisons**: Show official items at same rarity for validation
- **Warning badges**: Visual indicators for flagged items

## Running Locally

```bash
npm install
npm run dev     # Development server on localhost:3000
npm run build   # Production build
npm run audit   # Run accuracy audit against SRD items
```

## Contributing

When adding new items or mechanics:
1. Add combat features to `types/magic-item.ts`
2. Add scoring logic to `lib/calculator.ts`
3. Update `scripts/audit.mjs` to match
4. Add UI display in both `/calculator` and `/items` pages
5. Run `npm run audit` to verify accuracy
6. Flag any new discrepancies in `lib/item-balance-flags.ts`
