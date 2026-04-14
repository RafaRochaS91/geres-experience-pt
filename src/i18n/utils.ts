import { pt } from './pt';
import { en } from './en';
import type { TranslationKey } from './pt';

const translations = { pt, en } as const;

export type Locale = keyof typeof translations;

export function useTranslations(locale: Locale) {
  return function t(key: TranslationKey): string {
    return translations[locale][key] ?? translations['pt'][key] ?? key;
  };
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt';
}

export function localePath(locale: Locale, path = '/'): string {
  return locale === 'pt' ? path : `/en${path === '/' ? '' : path}`;
}
