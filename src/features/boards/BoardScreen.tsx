'use client';

import { useI18n } from '@/i18n/provider';

import { useBoard } from './BoardsProvider';

/**
 * The board route's content, read from the session's boards, so a board
 * created in this session opens too. The board's name is in the header;
 * the columns arrive in node 4.4.
 *
 * An unknown ID renders a "not found" message rather than calling
 * notFound(). In Part A only the browser knows the session's boards: the
 * server renders a new board's URL with the seed data, and a notFound()
 * there would turn the navigation into a 404 and a full reload, which
 * discards the session. Part B moves the boards to the server, which can
 * then answer a real 404.
 */
export function BoardScreen({ boardId }: { boardId: string }) {
  const board = useBoard(boardId);
  const { dict } = useI18n();

  return (
    <main className="flex flex-1 flex-col p-4">
      {!board && (
        <p className="text-heading-l text-muted-foreground m-auto text-center">
          {dict.board.notFound}
        </p>
      )}
    </main>
  );
}
