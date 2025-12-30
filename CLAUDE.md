# Evergreen 5e - Magic Item Balance Calculator

A Next.js application for calculating and validating D&D 5e magic item balance. All calculations are performed client-side using deterministic formulas - no AI/LLM queries or external API calls.

## Multi-System Architecture

This project is designed to support multiple TTRPG systems (D&D 5e, Draw Steel) with a shared UI layer. See `ARCHITECTURE.md` for full details.

### Where to Put Changes

**Shared UI (`packages/evergreen-ui/`)** - Changes that should look/behave the same across all systems:
- Visual components (buttons, cards, inputs, badges)
- Animations and effects (shimmer, glow, ambient motes)
- Layout patterns (collapsible sections, comparison cards)
- Color utilities (rarity colors, medal borders)
- Design tokens and Tailwind preset

**5e-Specific (root app files)** - Changes specific to D&D 5e balance:
- `lib/calculator.ts` - Scoring formulas, rarity thresholds, damage multipliers
- `lib/item-balance-flags.ts` - SRD item warnings, emoji mappings
- `data/srd-items.json` - Reference item database
- `types/magic-item.ts` - 5e item type definitions (damage types, conditions, etc.)
- `app/calculator/page.tsx` - 5e-specific form fields (BASE_ITEMS, DAMAGE_TYPES)

### Quick Reference

| Change Type | Location |
|-------------|----------|
| New button style | `packages/evergreen-ui/src/components/Button.tsx` |
| New animation | `packages/evergreen-ui/src/styles/globals.css` |
| New 5e damage type | `lib/calculator.ts` + `app/calculator/page.tsx` |
| New scoring formula | `lib/calculator.ts` |
| New SRD reference item | `data/srd-items.json` |
| New rarity color | `packages/evergreen-ui/src/utils/rarity.ts` |

**Note:** The shared UI package is not yet consumed by the main app - it's prepared for future extraction. Currently, UI code lives in both places during the transition period.

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
  - `COMMUNITY_NOTES` - Known WotC balance oddities (Cloak of Protection, stat-setters)
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
- AC bonus: 1.0 pts per +1 on armor/shields, **1.5 pts per +1 on other items** (stacks with armor)
- Saving throw bonus: 1.0 pts per +1 (all saves)
- Damage dice: Varies by die size (d6 = 1.0 baseline), damage type multipliers (force: 1.2×, radiant: 1.1×, poison: 0.7×, physical: 1.0×)
- Conditional damage: Multiplied by frequency (creature-common: 0.6×, creature-rare: 0.4×, sworn-enemy: 0.6×, environmental: 0.25×)
- Charged abilities: Blended burst/sustained scoring, high-level spells scale non-linearly (Lv6→7, Lv7→10, Lv8→14, Lv9→20 effective value)

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

### 2024 SRD Upgrade (Latest)
- **Updated Vicious Weapon to 2024 SRD**: Now correctly modeled as +2d6 on every hit (not crit-only like 2014). Calculates as 2.0 pts (Rare) ✓
- **Fixed physical damage type multipliers**: Magic weapons deal magical slashing/piercing/bludgeoning which bypasses "resistance to non-magical attacks". Changed from 0.85× to 1.0×.
- **Accuracy now 98%**: Up from 84%. Only 1 item remains off by 1 tier (Cloak of Protection - known WotC imbalance).

### Balance Formula Improvements
- **Fixed Wish/high-level spell scoring**: Charge pool abilities now use the same non-linear spell level scaling as legacy charges (Level 9 = 20 effective value, not 9). A "Wish once per day" glove now correctly scores as Legendary (~4.0 pts) instead of Uncommon (~1.8 pts).
- **AC stacking multiplier**: AC bonuses on non-armor items (weapons, rings, cloaks, etc.) now score at 1.5× because they stack with armor and break bounded accuracy. Example: +2 AC on a ring = 3.0 pts instead of 2.0 pts.

### UI Improvements
- Renamed "HEAD TO HEAD" section to "What's Similar?"
- Reference items now show thematic emojis instead of generic icons
- Dynamic item names in comparison (user's item name vs "YOUR ITEM")
- Removed redundant "Your Item Summary" section

### Balance Algorithm Fixes
- Fixed charge pool scoring bug: 0/0 recharge no longer scores higher than explicit recharge
- Fixed Sun Blade: 1d8 radiant is now correctly modeled as conditional vs undead (creature-common), not always-on
- Improved similarity algorithm with score proximity gating

## Development

```bash
npm run dev    # Start dev server on localhost:3000
npm run build  # Production build
npm run lint   # Run ESLint
```

### Known TypeScript Warnings

There will be TypeScript errors related to Google Fonts (next/font/google). **Do not attempt to fix these** - they are expected behavior in the development environment and do not affect functionality.

### Build Failures

**Do not run `npm run build`** - the build will fail due to network issues fetching Google Fonts in this environment. This is expected and does not indicate a problem with the code. Use `npm run lint` to verify code quality instead.

## Philosophy

The calculator prioritizes:
1. **Transparency** - All formulas are visible in the Formula Details section
2. **Accuracy** - 98% match rate against official SRD item rarities (2024 SRD)
3. **Honesty** - Items with known WotC balance oddities are flagged with Community Notes
4. **Client-side** - All logic runs in-browser with no external dependencies
