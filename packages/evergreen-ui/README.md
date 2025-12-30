# @evergreen/ui

Shared UI components for Evergreen TTRPG balance calculators.

## Installation

```bash
npm install @evergreen/ui
```

## Usage

### Components

```tsx
import {
  AnimatedNumber,
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  Checkbox,
  CollapsibleSection,
  ComparisonCard,
  EmptyState,
  Input,
  PageHeader,
  Select,
} from '@evergreen/ui';
```

### Utilities

```tsx
import {
  capitalizeRarity,
  getRarityColorClass,
  getRarityBgClass,
  getMedalBorderClass,
} from '@evergreen/ui';
```

### Styles

Import the shared styles in your app's CSS:

```css
/* In your globals.css or app.css */
@import "@evergreen/ui/styles";

/* Add your system-specific rarity colors */
:root {
  --rarity-common: #2a2a2f;
  --rarity-uncommon: #0f2a1f;
  --rarity-rare: #0f1a2f;
  --rarity-very-rare: #1a0a2e;
  --rarity-legendary: #2a1a0a;
}
```

### Tailwind Preset

Use the shared Tailwind preset:

```js
// tailwind.config.js
module.exports = {
  presets: [require('@evergreen/ui/tailwind-preset')],
  // your app-specific config...
};
```

## Components

### AnimatedNumber

Smooth animated number display using Framer Motion.

```tsx
<AnimatedNumber value={3.5} decimals={1} />
```

### ButtonGroup

Segmented button selector (e.g., +0/+1/+2/+3).

```tsx
<ButtonGroup
  value={enhancement}
  options={[0, 1, 2, 3]}
  onChange={setEnhancement}
/>
```

### Card

Container with consistent styling.

```tsx
<Card>
  <CardHeader>Combat Bonuses</CardHeader>
  {/* content */}
</Card>
```

### CollapsibleSection

Expandable section with toggle.

```tsx
<CollapsibleSection
  title="Passive Abilities"
  subtitle="Senses, Stats, Resistances"
>
  {/* content */}
</CollapsibleSection>
```

### ComparisonCard

Side-by-side item comparison.

```tsx
<ComparisonCard
  yourItem={{ name: 'Flaming Sword', score: 2.5, rarity: 'rare', ... }}
  referenceItem={{ name: '+1 Longsword', score: 1.0, rarity: 'uncommon', ... }}
  rank={0}
/>
```

## Peer Dependencies

- React 18 or 19
- Framer Motion 11 or 12

## License

MIT
