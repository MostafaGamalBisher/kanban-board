import 'server-only';

import { parseBoards } from '@/core/board/parse';
import type { BoardId } from '@/core/board/ids';
import type { Board, Boards } from '@/core/board/schema';
import seed from '@/data/boards.json';

const SEED_SOURCE = 'src/data/boards.json';

let boards: Boards | undefined;

/**
 * All boards, validated against the domain schema on first use and cached
 * for the life of the server process: the seed never changes at runtime.
 * Throws InvalidDataError, naming the file and each problem, if the seed
 * is invalid.
 *
 * Part B replaces the seed with a repository; callers do not change.
 */
export function getBoards(): Boards {
  boards ??= parseBoards(seed, SEED_SOURCE);
  return boards;
}

/**
 * One board, or `undefined` for an unknown ID. An unknown ID is a normal
 * case (a mistyped URL), so the page decides what to show instead.
 */
export function getBoard(id: BoardId): Board | undefined {
  return getBoards().find((board) => board.id === id);
}
