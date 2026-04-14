import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  site: 'https://geresexperience.pt',
  integrations: [tailwind({ applyBaseStyles: false, configFile: './tailwind.config.ts' })],
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  image: {
    formats: ['avif', 'webp'],
  },
});
