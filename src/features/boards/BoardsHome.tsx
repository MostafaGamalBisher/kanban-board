'use client';

import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { useI18n } from '@/i18n/provider';
import { routes } from '@/lib/routes';

import { useBoardDialogs } from './BoardDialogs';
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
  const { openCreateBoard } = useBoardDialogs();

  const first = boards[0];
  if (first) {
    redirect(routes.board(locale, first.id));
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <p className="text-heading-l text-muted-foreground">
        {dict.board.noBoards}
      </p>
      <Button size="lg" onClick={() => openCreateBoard()}>
        {dict.board.createBoard}
      </Button>
    </main>
  );
}
