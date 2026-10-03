import type { Config } from 'tailwindcss';

/** Every color is an RGB triplet CSS variable so Tailwind opacity modifiers work (bg-forest-700/40). */
const rgb = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        forest: { 900: rgb('forest-900'), 700: rgb('forest-700') },
        moss: { 500: rgb('moss-500') },
        leaf: { 300: rgb('leaf-300') },
        mist: { 50: rgb('mist-50') },
        parchment: { 100: rgb('parchment-100') },
        bark: { 600: rgb('bark-600') },
        rune: { gold: rgb('rune-gold') },
        mana: { 500: rgb('mana-500') },
        spell: { glow: rgb('spell-glow') },
        ember: { 500: rgb('ember-500') },
        // Semantic (theme-aware)
        bg: rgb('bg'),
        surface: rgb('surface'),
        elevated: rgb('elevated'),
        ink: rgb('ink'),
        'ink-2': rgb('ink-2'),
        primary: rgb('primary'),
        'on-primary': rgb('on-primary'),
        line: rgb('line'),
        region: {
          r0: rgb('region-r0'),
          r1: rgb('region-r1'),
          r2: rgb('region-r2'),
          r3: rgb('region-r3'),
          r4: rgb('region-r4'),
          r5: rgb('region-r5'),
        },
      },
      fontFamily: {
        display: ['"Shippori Mincho B1"', '"M PLUS Rounded 1c"', 'serif'],
        sans: ['Nunito', '"M PLUS Rounded 1c"', 'system-ui', 'sans-serif'],
        jp: ['"M PLUS Rounded 1c"', 'Nunito', 'sans-serif'],
        kana: ['"Klee One"', '"M PLUS Rounded 1c"', 'serif'],
      },
      fontSize: {
        xs: ['0.8125rem', '1.25rem'],
        sm: ['0.9375rem', '1.375rem'],
        base: ['1.0625rem', '1.5rem'],
        lg: ['1.25rem', '1.75rem'],
        xl: ['1.5rem', '2rem'],
        '2xl': ['2rem', '2.5rem'],
        '3xl': ['3rem', '3.5rem'],
        kana: ['2.5rem', '3.25rem'],
        'kana-lg': ['4.5rem', '5rem'],
      },
      borderRadius: { stone: '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgb(14 36 25 / 0.08), 0 4px 14px rgb(14 36 25 / 0.06)',
        glow: '0 0 0 4px rgb(var(--c-leaf-300) / 0.35), 0 0 24px rgb(var(--c-spell-glow) / 0.5)',
      },
      maxWidth: { app: '480px' },
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
    },
  },
  plugins: [],
} satisfies Config;
