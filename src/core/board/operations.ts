import { NotFoundError } from '../errors.ts';
import {
  BoardIdSchema,
  ColumnIdSchema,
  SubtaskIdSchema,
  TaskIdSchema,
  type BoardId,
  type TaskId,
} from './ids.ts';
import type {
  Board,
  Boards,
  Column,
  CreateBoardInput,
  CreateTaskInput,
  DeleteBoardInput,
  DeleteTaskInput,
  MoveTaskInput,
  SetSubtaskCompletedInput,
  Subtask,
  Task,
  UpdateBoardInput,
  UpdateTaskInput,
} from './schema.ts';

/**
 * Board operations: pure functions `(boards, input) → new boards`.
 *
 * - Nothing is mutated. Unchanged boards, columns and tasks keep their
 *   identity, so React can skip re-rendering them.
 * - Inputs are assumed valid: callers parse them with the input schemas
 *   first. Operations enforce referential rules (IDs must exist) and throw
 *   NotFoundError otherwise.
 * - Operations that create entities take an IdFactory instead of
 *   generating IDs themselves, which keeps them deterministic. The app
 *   passes `createId` (src/lib/ids.ts); tests pass a counter.
 */

export type IdFactory = () => string;

/** Result of an operation that creates an entity the caller needs to find. */
export interface Created<Id> {
  readonly boards: Boards;
  readonly id: Id;
}

/* ─── Boards ───────────────────────────────────────────────────────────── */

export function createBoard(
  boards: Boards,
  input: CreateBoardInput,
  newId: IdFactory
): Created<BoardId> {
  const board: Board = {
    id: BoardIdSchema.parse(newId()),
    name: input.name,
    columns: input.columns.map((column) => ({
      id: ColumnIdSchema.parse(newId()),
      name: column.name,
      tasks: [],
    })),
  };
  return { boards: [...boards, board], id: board.id };
}

/**
 * Renames the board and replaces its column list with `input.columns`, in
 * that order. A column with an `id` keeps its tasks; one without is new
 * and empty; a column missing from the input is removed with its tasks.
 */
export function updateBoard(
  boards: Boards,
  input: UpdateBoardInput,
  newId: IdFactory
): Boards {
  return replaceBoard(boards, input.boardId, (board) => ({
    ...board,
    name: input.name,
    columns: input.columns.map((entry): Column => {
      if (entry.id === undefined) {
        return {
          id: ColumnIdSchema.parse(newId()),
          name: entry.name,
          tasks: [],
        };
      }
      const existing = board.columns.find((column) => column.id === entry.id);
      if (!existing) {
        throw new NotFoundError('column', entry.id);
      }
      return existing.name === entry.name
        ? existing
        : { ...existing, name: entry.name };
    }),
  }));
}

export function deleteBoard(boards: Boards, input: DeleteBoardInput): Boards {
  locateBoard(boards, input.boardId);
  return boards.filter((board) => board.id !== input.boardId);
}

/* ─── Tasks ────────────────────────────────────────────────────────────── */

/** Adds a task to the end of `input.columnId` (its status). */
export function addTask(
  boards: Boards,
  input: CreateTaskInput,
  newId: IdFactory
): Created<TaskId> {
  const task: Task = {
    id: TaskIdSchema.parse(newId()),
    title: input.title,
    description: input.description,
    subtasks: input.subtasks.map((subtask) => ({
      id: SubtaskIdSchema.parse(newId()),
      title: subtask.title,
      isCompleted: false,
    })),
  };
  const next = replaceBoard(boards, input.boardId, (board) => {
    const columnIndex = findColumnIndex(board, input.columnId);
    return replaceColumnAt(board, columnIndex, (column) => ({
      ...column,
      tasks: [...column.tasks, task],
    }));
  });
  return { boards: next, id: task.id };
}

/**
 * Updates title, description and subtasks. A subtask with an `id` keeps
 * its completion state; one without is new and open; a missing one is
 * removed. If `input.columnId` differs from the task's column, the task
 * moves to the end of the new column (a status change).
 */
export function updateTask(
  boards: Boards,
  input: UpdateTaskInput,
  newId: IdFactory
): Boards {
  return replaceBoard(boards, input.boardId, (board) => {
    const { columnIndex, taskIndex, task } = locateTask(board, input.taskId);
    const updated: Task = {
      ...task,
      title: input.title,
      description: input.description,
      subtasks: input.subtasks.map((entry): Subtask => {
        if (entry.id === undefined) {
          return {
            id: SubtaskIdSchema.parse(newId()),
            title: entry.title,
            isCompleted: false,
          };
        }
        const existing = task.subtasks.find(
          (subtask) => subtask.id === entry.id
        );
        if (!existing) {
          throw new NotFoundError('subtask', entry.id);
        }
        return existing.title === entry.title
          ? existing
          : { ...existing, title: entry.title };
      }),
    };

    const sourceColumn = board.columns[columnIndex];
    if (sourceColumn?.id === input.columnId) {
      return replaceColumnAt(board, columnIndex, (column) => ({
        ...column,
        tasks: column.tasks.with(taskIndex, updated),
      }));
    }

    const targetIndex = findColumnIndex(board, input.columnId);
    const withoutTask = replaceColumnAt(board, columnIndex, (column) => ({
      ...column,
      tasks: column.tasks.toSpliced(taskIndex, 1),
    }));
    return replaceColumnAt(withoutTask, targetIndex, (column) => ({
      ...column,
      tasks: [...column.tasks, updated],
    }));
  });
}

export function deleteTask(boards: Boards, input: DeleteTaskInput): Boards {
  return replaceBoard(boards, input.boardId, (board) => {
    const { columnIndex, taskIndex } = locateTask(board, input.taskId);
    return replaceColumnAt(board, columnIndex, (column) => ({
      ...column,
      tasks: column.tasks.toSpliced(taskIndex, 1),
    }));
  });
}

/**
 * Moves a task to `toIndex` in `toColumnId`, within the same column or
 * across columns. `toIndex` is the task's position after the move; values
 * past the end are clamped to the end, so a drop below the last card works.
 */
export function moveTask(boards: Boards, input: MoveTaskInput): Boards {
  return replaceBoard(boards, input.boardId, (board) => {
    const { columnIndex, taskIndex, task } = locateTask(board, input.taskId);
    const targetIndex = findColumnIndex(board, input.toColumnId);

    const withoutTask = replaceColumnAt(board, columnIndex, (column) => ({
      ...column,
      tasks: column.tasks.toSpliced(taskIndex, 1),
    }));

    return replaceColumnAt(withoutTask, targetIndex, (column) => {
      const position = Math.min(input.toIndex, column.tasks.length);
      return { ...column, tasks: column.tasks.toSpliced(position, 0, task) };
    });
  });
}

export function setSubtaskCompleted(
  boards: Boards,
  input: SetSubtaskCompletedInput
): Boards {
  return replaceBoard(boards, input.boardId, (board) => {
    const { columnIndex, taskIndex, task } = locateTask(board, input.taskId);
    const subtaskIndex = task.subtasks.findIndex(
      (subtask) => subtask.id === input.subtaskId
    );
    const subtask = task.subtasks[subtaskIndex];
    if (!subtask) {
      throw new NotFoundError('subtask', input.subtaskId);
    }
    if (subtask.isCompleted === input.isCompleted) {
      return board;
    }
    return replaceColumnAt(board, columnIndex, (column) => ({
      ...column,
      tasks: column.tasks.with(taskIndex, {
        ...task,
        subtasks: task.subtasks.with(subtaskIndex, {
          ...subtask,
          isCompleted: input.isCompleted,
        }),
      }),
    }));
  });
}

/* ─── Helpers ──────────────────────────────────────────────────────────── */

function locateBoard(boards: Boards, boardId: BoardId) {
  const index = boards.findIndex((board) => board.id === boardId);
  const board = boards[index];
  if (!board) {
    throw new NotFoundError('board', boardId);
  }
  return { index, board };
}

/** Replaces one board; returns the same array if `update` changed nothing. */
function replaceBoard(
  boards: Boards,
  boardId: BoardId,
  update: (board: Board) => Board
): Boards {
  const { index, board } = locateBoard(boards, boardId);
  const updated = update(board);
  return updated === board ? boards : boards.with(index, updated);
}

function findColumnIndex(board: Board, columnId: Column['id']): number {
  const index = board.columns.findIndex((column) => column.id === columnId);
  if (index === -1) {
    throw new NotFoundError('column', columnId);
  }
  return index;
}

/** `columnIndex` must come from findColumnIndex or locateTask. */
function replaceColumnAt(
  board: Board,
  columnIndex: number,
  update: (column: Column) => Column
): Board {
  const column = board.columns[columnIndex];
  if (!column) {
    throw new RangeError(`column index out of range: ${columnIndex}`);
  }
  return { ...board, columns: board.columns.with(columnIndex, update(column)) };
}

function locateTask(board: Board, taskId: TaskId) {
  for (const [columnIndex, column] of board.columns.entries()) {
    const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
    const task = column.tasks[taskIndex];
    if (task) {
      return { columnIndex, taskIndex, task };
    }
  }
  throw new NotFoundError('task', taskId);
}
