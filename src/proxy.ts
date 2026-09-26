import { NextResponse, type NextRequest } from 'next/server';

import { isLocale, LOCALE_COOKIE } from '@/config/i18n';
import { negotiateLocale } from '@/lib/locale-negotiation';

/**
 * Every page lives under a locale: /en/… or /ar/…. A request without one
 * (e.g. `/` or `/boards/x`) is redirected to the negotiated locale:
 * remembered cookie → browser Accept-Language → default (see
 * lib/locale-negotiation.ts). Unknown paths therefore always land under a
 * locale (/foo → /en/foo → 404). Note: an unmatched URL currently gets
 * Next's bare default 404 page, outside our layout; node 4.4 adds a
 * catch-all route and a localized [locale]/not-found page.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split('/')[1];

  if (isLocale(firstSegment)) {
    return NextResponse.next();
  }

  const locale = negotiateLocale(
    request.cookies.get(LOCALE_COOKIE)?.value,
    request.headers.get('accept-language')
  );

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url);
  // The target depends on these request headers; caches must not share it.
  response.headers.set('Vary', 'Accept-Language, Cookie');
  return response;
}

export const config = {
  // Skip Next internals and any path with a file extension (icons, images,
  // favicon.ico): only page routes are redirected.
  matcher: ['/((?!_next|.*\\..*).*)'],
};
