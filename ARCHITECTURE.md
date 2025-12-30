# Evergreen Architecture

This document describes the three-repository architecture for Evergreen TTRPG balance calculators.

## Repository Structure

```
evergreen-ui/           # Shared UI package (npm: @evergreen/ui)
├── src/
│   ├── components/     # Reusable React components
│   ├── styles/         # Shared CSS and animations
│   ├── utils/          # Utility functions
│   └── tailwind-preset.js
├── package.json
└── README.md

evergreen-5e/           # D&D 5e Magic Item Balancer
├── packages/evergreen-ui/  # Local copy during development
├── app/                # Next.js app pages
├── lib/                # 5e-specific calculation logic
├── data/               # 5e SRD reference items
└── types/              # 5e-specific TypeScript types

evergreen-draw-steel/   # Draw Steel Item Balancer (future)
├── app/                # Next.js app pages
├── lib/                # Draw Steel calculation logic
├── data/               # Draw Steel reference items
└── types/              # Draw Steel-specific types
```

## Shared vs System-Specific

### Shared (@evergreen/ui)

**Components:**
- `AnimatedNumber` - Smooth number transitions
- `Button`, `ButtonGroup` - Buttons and selectors
- `Card`, `CardHeader` - Content containers
- `Checkbox`, `SometimesToggle` - Form inputs
- `CollapsibleSection`, `DetailsBox` - Expandable sections
- `ComparisonCard` - Side-by-side item comparison
- `EmptyState` - Placeholder when no content
- `Input`, `Select` - Form inputs
- `PageHeader`, `PrivacyBadge` - Page layout

**Utilities:**
- `capitalizeRarity()` - Format rarity names
- `getRarityColorClass()` - Tailwind color classes
- `getRarityBgClass()` - Background colors
- `getMedalBorderClass()` - Ranking borders

**Styles:**
- Ambient effects (drifting motes, noise texture)
- Button glow effects
- Card hover animations
- Shimmer animation

### System-Specific (5e / Draw Steel)

**Types:**
- Item schemas (damage types, conditions, etc.)
- Combat features interface
- Rarity definitions (may differ between systems)

**Calculator Logic:**
- Scoring formulas
- Rarity thresholds
- Damage type multipliers
- Spell level scaling

**Reference Data:**
- Official/reference items database
- Item warnings and community notes
- Item emoji mappings

## Development Workflow

### Adding a UI-Only Feature (e.g., dark mode)

1. Develop in `packages/evergreen-ui/`
2. Build: `npm run ui:build`
3. Test in 5e app: `npm run dev`
4. Commit and publish to npm
5. Update Draw Steel to use new version

### Adding a System-Specific Feature (e.g., new 5e damage type)

1. Develop in `lib/calculator.ts` and related files
2. No changes needed in other repos

### Adding a Feature to Both Systems (e.g., charge pool wizard)

1. Create generic UI component in `@evergreen/ui`:
   - Props-based, no system logic
   - Publish to npm
2. In each app, import and wire up system-specific logic

## Publishing @evergreen/ui

### Option A: GitHub Packages (Recommended)

```bash
# In packages/evergreen-ui/
npm login --registry=https://npm.pkg.github.com
npm publish
```

### Option B: npm Public

```bash
npm login
npm publish --access public
```

### Option C: Local Development (Current)

Using npm workspaces, the package is linked locally:
```bash
npm install  # Links packages/* automatically
```

## Fork Instructions for Draw Steel

1. Fork this repository on GitHub
2. Rename to `evergreen-draw-steel`
3. Delete 5e-specific files:
   - `lib/calculator.ts` (replace with Draw Steel logic)
   - `data/srd-items.json` (replace with DS items)
   - `types/magic-item.ts` (replace with DS types)
   - `lib/item-balance-flags.ts` (replace with DS flags)
4. Update `package.json`:
   - Change name to `evergreen-draw-steel`
   - Add `@evergreen/ui` as dependency
5. Extract shared UI to separate repo (optional)

## Keeping UI in Sync

Until `@evergreen/ui` is published as a separate package:

1. Make UI changes in `packages/evergreen-ui/` in either repo
2. Copy the changes to the other repo
3. When ready, extract to separate GitHub repo and publish

After publishing `@evergreen/ui`:

1. Both apps depend on `@evergreen/ui` via npm
2. UI changes go to the `evergreen-ui` repo
3. Publish new version
4. Run `npm update @evergreen/ui` in both apps
