import type { Config } from 'tailwindcss';

// Allows `bg-brand/60`, `text-brand-dark/40` etc. with CSS variable colours.
// Tailwind v3 needs comma-separated RGB channels for opacity modifiers to work.
function withOpacity(varName: string) {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue !== undefined
      ? `rgba(var(${varName}), ${opacityValue})`
      : `rgb(var(${varName}))`;
}

const config: Config = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:         withOpacity('--color-brand-rgb'),
        'brand-dark':  withOpacity('--color-brand-dark-rgb'),
        'brand-light': withOpacity('--color-brand-light-rgb'),
        accent:        withOpacity('--color-accent-rgb'),
        surface:       withOpacity('--color-surface-rgb'),
        'surface-alt': withOpacity('--color-surface-alt-rgb'),
        text:          withOpacity('--color-text-rgb'),
        'text-muted':  withOpacity('--color-text-muted-rgb'),
        cta:           withOpacity('--color-cta-rgb'),
        highlight:     withOpacity('--color-highlight-rgb'),
        granite:       withOpacity('--color-granite-rgb'),
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
