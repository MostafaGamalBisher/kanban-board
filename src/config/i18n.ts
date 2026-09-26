/**
 * Supported interface languages. The URL carries the active one
 * (/en/…, /ar/…); the cookie only remembers the last choice for `/`.
 * Language names are not stored here: the switcher gets each one in its
 * own language from Intl.DisplayNames, so there is no text to maintain.
 */
export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_DIRECTION: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

/** Remembers the last chosen language (read by proxy.ts, node 3.1). */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Narrows untrusted input (a URL segment, a cookie) to a supported locale. */
export function isLocale(value: unknown): value is Locale {
  return (LOCALES as readonly unknown[]).includes(value);
}

/**
 * Digits for each locale, set explicitly: the default for plain `ar`
 * differs between browsers and data versions (Western 1,2,3 in newer ICU
 * data, Arabic-Indic ١,٢,٣ in older), so it is never left to chance.
 */
export const NUMBERING_SYSTEM: Record<Locale, 'latn' | 'arab'> = {
  en: 'latn',
  ar: 'arab', // owner's decision (node 3.2): Arabic-Indic, ١٢٣
};

/** BCP 47 tag for Intl APIs, with the numbering system pinned (e.g. ar-u-nu-arab). */
export function intlLocale(locale: Locale): string {
  return `${locale}-u-nu-${NUMBERING_SYSTEM[locale]}`;
}
