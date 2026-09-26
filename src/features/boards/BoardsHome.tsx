'use client';

import { redirect } from 'next/navigation';

import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';

import { useBoards } from './BoardsProvider';

/**
 * /[locale]: opens the first board, or says there are none.
 *
 * It reads the session's boards, not the seed, so after the first board
 * is deleted it opens the next one. On the first page load the redirect
 * happens during server rendering, before any HTML reaches the browser.
 */
export function BoardsHome() {
  const boards = useBoards();
  const { locale, dict } = useI18n();

  const first = boards[0];
  if (first) {
    redirect(routes.board(locale, first.id));
  }

  return (
    <main className="text-muted-foreground text-heading-l grid min-h-dvh place-items-center p-6 text-center">
      <p>{dict.board.noBoards}</p>
    </main>
  );
}
