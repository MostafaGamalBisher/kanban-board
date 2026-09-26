import { notFound } from 'next/navigation';
import { locale as rootLocale } from 'next/root-params';

import { isLocale, type Locale } from '@/config/i18n';

import type { Dictionary } from './dictionaries/en';
import { createI18n, type I18n } from './format';

/**
 * Dictionaries load on demand, so a request only pays for its own
 * language. Server-side only: `next/root-params` fails the build if this
 * module is imported by a Client Component.
 */
const dictionaries = {
  en: () => import('./dictionaries/en').then((module) => module.en),
  ar: () => import('./dictionaries/ar').then((module) => module.ar),
} satisfies Record<Locale, () => Promise<Dictionary>>;

/** The current locale's dictionary, e.g. to pass to <I18nProvider>. */
export async function getDictionary(): Promise<{
  locale: Locale;
  dictionary: Dictionary;
}> {
  const locale = await rootLocale();
  if (!isLocale(locale)) {
    notFound();
  }
  return { locale, dictionary: await dictionaries[locale]() };
}

/**
 * Text and formatting for Server Components. The locale comes from the URL
 * via next/root-params, so callers pass nothing:
 *
 *   const { dict, plural } = await getI18n();
 */
export async function getI18n(): Promise<I18n> {
  const { locale, dictionary } = await getDictionary();
  return createI18n(locale, dictionary);
}
