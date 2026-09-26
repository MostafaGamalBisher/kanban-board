import type { TaskId } from './ids.ts';
import type { Board, Column, Task } from './schema.ts';

/** A task together with the column that holds it (its status). */
export interface FoundTask {
  readonly task: Task;
  readonly column: Column;
}

/** Finds a task in a board, or `undefined` if the board has no such task. */
export function findTask(
  board: Board,
  taskId: TaskId | string
): FoundTask | undefined {
  for (const column of board.columns) {
    const task = column.tasks.find((candidate) => candidate.id === taskId);
    if (task) return { task, column };
  }
  return undefined;
}

/** "done of total" for a task's subtasks. */
export function subtaskProgress(task: Task): {
  readonly done: number;
  readonly total: number;
} {
  return {
    done: task.subtasks.filter((subtask) => subtask.isCompleted).length,
    total: task.subtasks.length,
  };
}
