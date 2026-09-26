'use client';

import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';

import { LOCALE_DIRECTION, type Locale } from '@/config/i18n';
import type { Dictionary } from '@/i18n/dictionaries/en';
import { I18nProvider } from '@/i18n/provider';

/**
 * App-wide client providers, composed once in the root layout.
 *
 * Direction.Provider: Radix components ignore `<html dir>` and default to
 * left-to-right. Without it, on /ar, arrow-key navigation in menus and
 * selects would run backwards and `align="end"` would open on the wrong
 * side.
 */
export function AppProviders({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <Direction.Provider dir={LOCALE_DIRECTION[locale]}>
        {children}
      </Direction.Provider>
    </I18nProvider>
  );
}
