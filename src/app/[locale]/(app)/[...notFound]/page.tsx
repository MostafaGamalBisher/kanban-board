import type { Metadata } from 'next';

import { NotFoundView } from '@/features/shell/NotFoundView';
import { getI18n } from '@/i18n/server';

/** Search engines must not index this page (it answers with status 200). */
export const metadata: Metadata = { robots: { index: false } };

/**
 * Any path under a locale that matches no route (/en/foo, /ar/boards)
 * renders the localized "page not found" view inside the app frame.
 *
 * It renders the view directly instead of calling notFound(). With a root
 * layout under a dynamic segment ([locale]), Next.js cannot server-render
 * a notFound() inside it: the server sends a blank error page and the
 * browser draws the 404 afterwards (blank without JavaScript, and the
 * saved theme is ignored). The owner chose a complete server-rendered page
 * with status 200 and noindex over that; the unknown-board view behaves
 * the same way.
 */
export default async function CatchAllNotFound() {
  const { dict } = await getI18n();
  return <NotFoundView message={dict.common.notFound} />;
}
