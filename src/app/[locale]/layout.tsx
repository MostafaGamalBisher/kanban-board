import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { isLocale, LOCALE_DIRECTION, LOCALES } from '@/config/i18n';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

import { fontArabic, fontSans } from '../fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

/** Prerender /en and /ar at build time. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Any other first segment (/xx) is a 404, not a page rendered on demand. */
export const dynamicParams = false;

/**
 * Root layout. The locale comes from the URL (/en, /ar): proxy.ts has
 * already redirected requests without one. `lang` and `dir` are rendered
 * on the server, so Arabic is right-to-left from the first byte, with no
 * layout flip after loading.
 *
 * `dark` is hard-set until node 3.4 reads the theme cookie.
 */
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir={LOCALE_DIRECTION[locale]}
      className={cn('dark', fontSans.variable, fontArabic.variable)}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
