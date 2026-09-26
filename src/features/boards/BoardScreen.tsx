'use client';

import { NotFoundView } from '@/features/shell/NotFoundView';
import { useI18n } from '@/i18n/provider';

import { BoardView } from './BoardView';
import { useBoard } from './BoardsProvider';

/**
 * The board route's content, read from the session's boards, so a board
 * created in this session opens too. The board's name is in the header.
 *
 * An unknown ID renders the not-found view rather than calling notFound().
 * In Part A only the browser knows the session's boards: the server
 * renders a new board's URL with the seed data, and a notFound() there
 * would turn the navigation into a 404 and a full reload, which discards
 * the session. Part B moves the boards to the server, which can then
 * answer a real 404.
 */
export function BoardScreen({ boardId }: { boardId: string }) {
  const board = useBoard(boardId);
  const { dict } = useI18n();

  return board ? (
    <BoardView board={board} />
  ) : (
    <NotFoundView message={dict.board.notFound} />
  );
}
