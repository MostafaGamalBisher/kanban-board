import type { BoardId, TaskId } from './ids.ts';
import type { Boards, Column } from './schema.ts';

/**
 * The item that takes over when `id` is removed from `ids`: the one after
 * it, else the one before it, else none. Keeps the user close to where
 * they were. An `id` not in the list gives the first item.
 */
export function neighbourAfterRemoving<Id extends string>(
  ids: readonly Id[],
  id: string
): Id | undefined {
  const index = ids.findIndex((candidate) => candidate === id);
  if (index === -1) return ids[0];
  return ids[index + 1] ?? ids[index - 1];
}

/** Which board to open after deleting one (none: the "no boards" page). */
export function boardToOpenAfterDeleting(
  boards: Boards,
  deletedId: BoardId
): BoardId | undefined {
  return neighbourAfterRemoving(
    boards.map((board) => board.id),
    deletedId
  );
}

/**
 * Which card takes focus after deleting a task: a neighbour in the same
 * column (none: the caller picks a fallback, e.g. "+ Add New Task").
 */
export function taskToFocusAfterDeleting(
  column: Column,
  deletedId: TaskId
): TaskId | undefined {
  if (!column.tasks.some((task) => task.id === deletedId)) return undefined;
  return neighbourAfterRemoving(
    column.tasks.map((task) => task.id),
    deletedId
  );
}
