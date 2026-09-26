'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { Locale } from '@/config/i18n';

import type { Dictionary } from './dictionaries/en';
import { createI18n, type I18n } from './format';

const I18nContext = createContext<I18n | null>(null);

/**
 * Makes text and formatting available to Client Components. The server
 * sends only data (locale + dictionary; functions cannot cross to the
 * browser), and the helpers are rebuilt here once per locale.
 */
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const i18n = useMemo(
    () => createI18n(locale, dictionary),
    [locale, dictionary]
  );
  return <I18nContext value={i18n}>{children}</I18nContext>;
}

/** Text and formatting in Client Components: `const { dict, plural } = useI18n();` */
export function useI18n(): I18n {
  const i18n = useContext(I18nContext);
  if (!i18n) {
    throw new Error('useI18n() must be used inside <I18nProvider>.');
  }
  return i18n;
}
