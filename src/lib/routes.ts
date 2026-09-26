import type { Locale } from '@/config/i18n';

/**
 * URL builders: every in-app link is built here, so the URL scheme lives
 * in one place (it mirrors the folders under src/app/[locale]/).
 */
export const routes = {
  home: (locale: Locale) => `/${locale}`,
  board: (locale: Locale, boardId: string) =>
    `/${locale}/boards/${encodeURIComponent(boardId)}`,
};
