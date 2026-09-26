import type { ColumnId, TaskId } from './ids.ts';
import { moveTask } from './operations.ts';
import type { Board } from './schema.ts';
import { findTask } from './selectors.ts';

/**
 * What a dragged task is over: a card (and whether the dragged task is
 * past that card's middle), or a column's own area (e.g. an empty
 * column). The UI measures; this module decides.
 */
export type DropTarget =
  | { readonly kind: 'task'; readonly taskId: string; readonly after: boolean }
  | { readonly kind: 'column'; readonly columnId: string };

export interface DropPosition {
  readonly toColumnId: ColumnId;
  /** The task's index in the column after the move (see moveTask). */
  readonly toIndex: number;
}

/**
 * Where a dragged task would land:
 * - over a card in its own column: that card's place (the list reorders
 *   around it, as in a sortable list);
 * - over a card in another column: just before or after that card;
 * - over a column's area: the end of that column.
 * `undefined` if the task or the target is not on the board.
 */
export function dropPosition(
  board: Board,
  taskId: TaskId | string,
  target: DropTarget
): DropPosition | undefined {
  const dragged = findTask(board, taskId);
  if (!dragged) return undefined;

  if (target.kind === 'column') {
    const column = board.columns.find((c) => c.id === target.columnId);
    if (!column) return undefined;
    const sameColumn = column.id === dragged.column.id;
    return {
      toColumnId: column.id,
      toIndex: sameColumn ? column.tasks.length - 1 : column.tasks.length,
    };
  }

  const over = findTask(board, target.taskId);
  if (!over) return undefined;
  const overIndex = over.column.tasks.findIndex(
    (task) => task.id === target.taskId
  );
  if (over.column.id === dragged.column.id) {
    return { toColumnId: over.column.id, toIndex: overIndex };
  }
  return {
    toColumnId: over.column.id,
    toIndex: overIndex + (target.after ? 1 : 0),
  };
}

/** The board as it would look after the move: a preview during a drag. */
export function previewMove(
  board: Board,
  taskId: TaskId,
  position: DropPosition
): Board {
  const [moved] = moveTask([board], {
    boardId: board.id,
    taskId,
    ...position,
  });
  return moved ?? board;
}
