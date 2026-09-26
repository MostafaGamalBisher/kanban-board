import { DEFAULT_LOCALE, isLocale, type Locale } from '../config/i18n.ts';

/**
 * Picks the interface language for a request that has no locale in its URL:
 *   1. the remembered choice (the locale cookie), if it is supported;
 *   2. otherwise the browser's preferences (the Accept-Language header);
 *   3. otherwise the default locale.
 * Pure, so it is unit-tested; proxy.ts supplies the cookie and header.
 */
export function negotiateLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null
): Locale {
  if (isLocale(cookieValue)) {
    return cookieValue;
  }
  return fromAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE;
}

/**
 * Parses e.g. `ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7` and returns the most
 * preferred supported language. Region subtags are ignored (ar-EG → ar);
 * entries with q=0 mean "not acceptable" and are skipped.
 */
export function fromAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) {
    return undefined;
  }
  const ranked = header
    .split(',')
    .map((part, order) => {
      const [range = '', ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return {
        language: range.trim().toLowerCase().split('-')[0],
        q: Number.isFinite(q) ? q : 0,
        order,
      };
    })
    .filter((entry) => entry.q > 0)
    .sort((a, b) => b.q - a.q || a.order - b.order);

  return ranked.map((entry) => entry.language).find(isLocale);
}
