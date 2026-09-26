import type { BoardId } from './ids.ts';
import type { Boards } from './schema.ts';

/**
 * Which board to open after deleting `deletedId`: the one after it in the
 * list, else the one before it, else none (the "no boards" page). Keeps
 * the user close to where they were.
 */
export function boardToOpenAfterDeleting(
  boards: Boards,
  deletedId: BoardId
): BoardId | undefined {
  const index = boards.findIndex((board) => board.id === deletedId);
  if (index === -1) return boards[0]?.id;
  return (boards[index + 1] ?? boards[index - 1])?.id;
}
