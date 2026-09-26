'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LOCALE_COOKIE, LOCALES, type Locale } from '@/config/i18n';
import { useI18n } from '@/i18n/provider';

import { writePreferenceCookie } from './cookies';

/** "العربية", "English": each language named in itself, by the browser. */
const nativeName = (locale: Locale) =>
  new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;

/**
 * Links to the same page in the other language(s), and remembers the choice
 * in the locale cookie so that `/` opens in it next time. The URL is the
 * source of truth; the cookie is only a preference.
 */
export function LanguageSwitcher() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const rest = pathname.slice(`/${locale}`.length);

  return (
    <nav className="flex gap-2">
      {LOCALES.filter((target) => target !== locale).map((target) => (
        <Link
          key={target}
          href={`/${target}${rest}`}
          hrefLang={target}
          lang={target}
          onClick={() => writePreferenceCookie(LOCALE_COOKIE, target)}
          className="text-body-l text-primary hover:bg-secondary rounded-full px-4 py-2 font-bold"
        >
          {nativeName(target)}
        </Link>
      ))}
    </nav>
  );
}
