import { intlLocale, LOCALE_DIRECTION, type Locale } from '../config/i18n.ts';
import type { Dictionary } from './dictionaries/en.ts';
import type { Plural } from './plural.ts';

export type MessageValues = Readonly<Record<string, string | number>>;

export interface I18n {
  readonly locale: Locale;
  readonly dir: 'ltr' | 'rtl';
  readonly dict: Dictionary;
  /** 1234 → "1,234" or "١٬٢٣٤", per the locale's configured digits. */
  number(value: number): string;
  /** Fills {placeholders}; numbers are formatted with the locale's digits. */
  format(message: string, values?: MessageValues): string;
  /** Picks the plural form for `count`, then fills {count} and any other values. */
  plural(forms: Plural, count: number, values?: MessageValues): string;
}

/**
 * Builds the formatting helpers for one locale. Pure (no React, no
 * Next.js), so the server, the browser and the tests share it. Components
 * read text as typed properties (`dict.board.taskCount`), so a typo is a
 * compile error rather than a missing string at runtime.
 */
export function createI18n(locale: Locale, dict: Dictionary): I18n {
  const numberFormat = new Intl.NumberFormat(intlLocale(locale));
  const pluralRules = new Intl.PluralRules(locale);

  const number = (value: number) => numberFormat.format(value);

  const format = (message: string, values: MessageValues = {}) =>
    message.replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      const value = values[name];
      if (value === undefined) {
        return placeholder;
      }
      return typeof value === 'number' ? number(value) : value;
    });

  const plural = (forms: Plural, count: number, values: MessageValues = {}) =>
    format(forms[pluralRules.select(count)] ?? forms.other, {
      ...values,
      count,
    });

  return {
    locale,
    dir: LOCALE_DIRECTION[locale],
    dict,
    number,
    format,
    plural,
  };
}
