/**
 * Evergreen UI - Tailwind CSS Preset
 *
 * Shared Tailwind configuration for all Evergreen TTRPG calculators.
 * Use this preset in your tailwind.config.js:
 *
 *   module.exports = {
 *     presets: [require('@evergreen/ui/tailwind-preset')],
 *     // your app-specific config...
 *   }
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Evergreen accent colors
        'eg-accent': {
          DEFAULT: 'var(--eg-accent, #00d67e)',
          light: 'var(--eg-accent-light, #00ff96)',
          dark: 'var(--eg-accent-dark, #00b368)',
        },
      },
      fontFamily: {
        // Display font for headings
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        // Body font for text
        body: ['var(--font-dm-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'drift-1': 'drift-1 25s ease-in-out infinite',
        'drift-2': 'drift-2 30s ease-in-out infinite',
        'drift-3': 'drift-3 35s ease-in-out infinite',
      },
      boxShadow: {
        'glow-emerald': '0 0 20px rgba(0, 214, 126, 0.5), 0 0 40px rgba(0, 255, 150, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)',
      },
    },
  },
};
