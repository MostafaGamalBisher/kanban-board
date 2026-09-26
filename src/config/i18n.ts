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
