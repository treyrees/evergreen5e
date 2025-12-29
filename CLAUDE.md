# Evergreen 5e - Magic Item Balance Calculator

A Next.js application for calculating and validating D&D 5e magic item balance. All calculations are performed client-side using deterministic formulas - no AI/LLM queries or external API calls.

## Project Overview

This tool helps D&D 5e players and DMs create balanced homebrew magic items by:
1. Calculating a "combat score" (points) based on item attributes
2. Suggesting an appropriate rarity tier based on score thresholds
3. Comparing against official SRD reference items with similar characteristics

## Architecture

### Key Files

- **`app/calculator/page.tsx`** - Main calculator UI with item configuration, results display, and "What's Similar?" reference comparison
- **`lib/calculator.ts`** - Core balance calculation logic including:
  - `calculateCombatScore()` - Main scoring function
  - `getSuggestedRarity()` - Maps scores to rarity tiers
  - `findTopAnchorItems()` - Similarity matching algorithm for reference items
- **`lib/item-balance-flags.ts`** - Warning categories for items with special considerations:
  - `SPECIAL_MECHANICS` - Non-quantifiable benefits (flight, invisibility, instant-kill)
  - `COMMUNITY_NOTES` - Known WotC balance oddities (Cloak of Protection, Vicious Weapon)
  - `getItemEmoji()` - Thematic emoji mapping for 50+ item types
- **`data/srd-items.json`** - Reference database of official SRD magic items with modeled attributes
- **`types/magic-item.ts`** - TypeScript interfaces for item data structures

### Scoring System

Rarity thresholds (in points):
- **Common**: 0-0.5 pts
- **Uncommon**: 0.5-1.5 pts
- **Rare**: 1.5-2.5 pts
- **Very Rare**: 2.5-4.0 pts
- **Legendary**: 4.0+ pts

Key scoring values:
- Enhancement bonus: 1.0 pts per +1
- AC bonus: 1.0 pts per +1
- Saving throw bonus: 1.0 pts per +1 (all saves)
- Damage dice: Varies by die size and damage type
- Conditional damage: Multiplied by frequency (creature-common: 0.6×, creature-rare: 0.4×, sworn-enemy: 0.6×, environmental: 0.25×)
- Vicious damage: ×0.05 (5% crit proc rate)
- Charged abilities: Blended burst/sustained scoring based on spell level

### Similarity Algorithm

Reference items are prioritized by:
1. Exact base item match (sword → sword) - priority 0
2. Category match (longsword → greatsword) - priority 1
3. Generic match (any weapon) - priority 2 (fallback only)

Score proximity gating adds penalties:
- <0.75 pts difference: No penalty
- 0.75-1.5 pts: +1 priority penalty
- 1.5-2.5 pts: +3 priority penalty
- >2.5 pts: +6 priority penalty

## Recent Work (December 2024)

### UI Improvements
- Renamed "HEAD TO HEAD" section to "What's Similar?"
- Reference items now show thematic emojis instead of generic icons
- Dynamic item names in comparison (user's item name vs "YOUR ITEM")
- Removed redundant "Your Item Summary" section

### Balance Algorithm Fixes
- Fixed charge pool scoring bug: 0/0 recharge no longer scores higher than explicit recharge
- Fixed Sun Blade: 1d8 radiant is now correctly modeled as conditional vs undead (creature-common), not always-on
- Improved similarity algorithm with score proximity gating

### Item Classification Cleanup
- Emptied NUMERICAL_EDGE_CASES (all items now calculate correctly with conditionalType or vicious flag)
- Added Vicious Weapon to COMMUNITY_NOTES (0.1 pts calc vs Rare official - genuinely weak)
- Moved Cloak of Protection to COMMUNITY_NOTES (2.0 pts calc vs Uncommon official - genuinely strong)

## Development

```bash
npm run dev    # Start dev server on localhost:3000
npm run build  # Production build
npm run lint   # Run ESLint
```

### Known TypeScript Warnings

There will be TypeScript errors related to Google Fonts (next/font/google). **Do not attempt to fix these** - they are expected behavior in the development environment and do not affect functionality.

## Philosophy

The calculator prioritizes:
1. **Transparency** - All formulas are visible in the Formula Details section
2. **Accuracy** - 84% match rate against official SRD item rarities
3. **Honesty** - Items with known WotC balance oddities are flagged with Community Notes
4. **Client-side** - All logic runs in-browser with no external dependencies
