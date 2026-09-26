import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AppProviders } from '@/components/providers';
import { isLocale, LOCALE_DIRECTION, LOCALES } from '@/config/i18n';
import { siteConfig } from '@/config/site';
import { BoardsProvider } from '@/features/boards/BoardsProvider';
import { preferencesScript } from '@/features/preferences/preferences-script';
import { getDictionary, getI18n } from '@/i18n/server';
import { cn } from '@/lib/utils';
import { getBoards } from '@/server/boards/queries';

import { fontArabic, fontSans } from '../fonts';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: siteConfig.name, description: dict.meta.description };
}

/**
 * Prerender /en and /ar at build time. No `dynamicParams = false` here:
 * child segments inherit it, and the board route must render IDs it did
 * not prerender (boards created in the session). An unknown locale is
 * still a 404: proxy.ts redirects it under a real locale (/xx →
 * /en/xx), and the isLocale() check below catches anything else.
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Root layout. The locale comes from the URL (/en, /ar): proxy.ts has
 * already redirected requests without one. `lang` and `dir` are rendered
 * on the server, so Arabic is right-to-left from the first byte, with no
 * layout flip after loading.
 *
 * The server always renders the default theme (dark), so pages stay
 * static; preferencesScript applies saved preferences before the first paint.
 *
 * The boards are read here, on the server, straight from the data layer
 * (no HTTP request), and handed to BoardsProvider, which keeps the
 * session's copy. Being in the layout, that copy survives navigation
 * between boards.
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
      // preferencesScript may change the class and data-sidebar before React
      // hydrates. Suppresses the warning for this element only.
      suppressHydrationWarning
    >
      <head>
        {/* Must run before the first paint: applies saved preferences. */}
        <script dangerouslySetInnerHTML={{ __html: preferencesScript }} />
      </head>
      <body className="antialiased">
        <AppProviders locale={locale} dictionary={dictionary}>
          <BoardsProvider initialBoards={getBoards()}>
            {children}
          </BoardsProvider>
        </AppProviders>
      </body>
    </html>
  );
}
