import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AppProviders } from '@/components/providers';
import { isLocale, LOCALE_DIRECTION, LOCALES } from '@/config/i18n';
import { siteConfig } from '@/config/site';
import { themeScript } from '@/features/preferences/theme-script';
import { getDictionary, getI18n } from '@/i18n/server';
import { cn } from '@/lib/utils';

import { fontArabic, fontSans } from '../fonts';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: siteConfig.name, description: dict.meta.description };
}

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
 * The server always renders the default theme (dark), so pages stay
 * static; themeScript applies a saved preference before the first paint.
 */
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const { dictionary } = await getDictionary();

  return (
    <html
      lang={locale}
      dir={LOCALE_DIRECTION[locale]}
      className={cn('dark', fontSans.variable, fontArabic.variable)}
      // themeScript may change the class before React hydrates (a saved
      // light theme). Suppresses the warning for this element only.
      suppressHydrationWarning
    >
      <head>
        {/* Must run before the first paint: applies the saved theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <AppProviders locale={locale} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
