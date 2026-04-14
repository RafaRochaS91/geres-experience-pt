import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:        'var(--color-brand)',
        'brand-dark': 'var(--color-brand-dark)',
        'brand-light':'var(--color-brand-light)',
        accent:       'var(--color-accent)',
        surface:      'var(--color-surface)',
        'surface-alt':'var(--color-surface-alt)',
        text:         'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        cta:          'var(--color-cta)',
        highlight:    'var(--color-highlight)',
        granite:      'var(--color-granite)',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
