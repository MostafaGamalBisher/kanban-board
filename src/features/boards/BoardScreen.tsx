'use client';

import { useI18n } from '@/i18n/provider';

import { BoardNav } from './BoardNav';
import { useBoard } from './BoardsProvider';

/**
 * The board route's content, read from the session's boards, so a board
 * created in this session opens too. The header, sidebar and columns
 * replace this minimal layout in nodes 4.2–4.4.
 *
 * An unknown ID renders a "not found" view rather than calling notFound().
 * In Part A only the browser knows the session's boards: the server
 * renders a new board's URL with the seed data, and a notFound() there
 * would turn the navigation into a 404 and a full reload, which discards
 * the session. Part B moves the boards to the server, which can then
 * answer a real 404.
 */
export function BoardScreen({ boardId }: { boardId: string }) {
  const board = useBoard(boardId);
  const { dict } = useI18n();

  return (
    <main className="flex flex-col gap-8 py-8">
      {board ? (
        <h1 className="text-heading-xl px-6">
          <bdi>{board.name}</bdi>
        </h1>
      ) : (
        <p className="text-heading-l text-muted-foreground px-6">
          {dict.board.notFound}
        </p>
      )}
      <BoardNav currentBoardId={board?.id} />
    </main>
  );
}
