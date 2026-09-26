import { z } from 'zod';

import type { ValidationKey } from '../validation.ts';
import {
  BoardIdSchema,
  ColumnIdSchema,
  SubtaskIdSchema,
  TaskIdSchema,
} from './ids.ts';
import { LIMITS } from './limits.ts';

/**
 * The board domain: one source of truth for both runtime validation and
 * TypeScript types.
 *
 *   Board ─┬─ Column ─┬─ Task ─┬─ Subtask
 *
 * A task has no `status` field: its status IS the column that contains
 * it, so the two can never disagree. Array order is display order.
 *
 * Entity types are readonly: nothing mutates a board in place. Changes
 * produce new objects (see operations.ts, node 2.3).
 */

const code = (key: ValidationKey) => ({ error: key });

/** Trimmed, non-empty, length-limited text. */
const requiredText = (max: number) =>
  z
    .string(code('required'))
    .trim()
    .min(1, code('required'))
    .max(max, code('tooLong'));

/** Trimmed, may be empty, length-limited text. */
const optionalText = (max: number) =>
  z.string(code('invalid')).trim().max(max, code('tooLong'));

/**
 * Adds a `duplicateName` issue to every item whose name repeats an earlier
 * one (case-insensitive), at `[...arrayPath, index, 'name']`, so a form can
 * mark the exact field.
 */
function reportDuplicateNames(
  names: readonly string[],
  ctx: z.RefinementCtx,
  arrayPath: (string | number)[]
) {
  const seen = new Set<string>();
  names.forEach((name, index) => {
    const normalized = name.toLocaleLowerCase();
    if (seen.has(normalized)) {
      ctx.addIssue({
        code: 'custom',
        message: 'duplicateName' satisfies ValidationKey,
        path: [...arrayPath, index, 'name'],
      });
    }
    seen.add(normalized);
  });
}

/** Adds a `duplicateId` issue for every repeated ID. Guards data integrity. */
function reportDuplicateIds(
  entries: readonly { id: string; path: (string | number)[] }[],
  ctx: z.RefinementCtx
) {
  const seen = new Set<string>();
  for (const { id, path } of entries) {
    if (seen.has(id)) {
      ctx.addIssue({
        code: 'custom',
        message: 'duplicateId' satisfies ValidationKey,
        path,
      });
    }
    seen.add(id);
  }
}

/* ─── Entities ─────────────────────────────────────────────────────────── */

export const SubtaskSchema = z
  .object({
    id: SubtaskIdSchema,
    title: requiredText(LIMITS.subtaskTitle),
    isCompleted: z.boolean(code('invalid')),
  })
  .readonly();

export const TaskSchema = z
  .object({
    id: TaskIdSchema,
    title: requiredText(LIMITS.taskTitle),
    description: optionalText(LIMITS.taskDescription),
    subtasks: z.array(SubtaskSchema).readonly(),
  })
  .readonly();

export const ColumnSchema = z
  .object({
    id: ColumnIdSchema,
    name: requiredText(LIMITS.columnName),
    tasks: z.array(TaskSchema).readonly(),
  })
  .readonly();

export const BoardSchema = z
  .object({
    id: BoardIdSchema,
    name: requiredText(LIMITS.boardName),
    columns: z.array(ColumnSchema).readonly(),
  })
  .readonly()
  .superRefine((board, ctx) => {
    reportDuplicateNames(
      board.columns.map((column) => column.name),
      ctx,
      ['columns']
    );

    // Every column, task and subtask ID is unique within its board, so an
    // ID alone is enough to find an entity (moveTask relies on this).
    reportDuplicateIds(
      board.columns.flatMap((column, c) => [
        { id: column.id, path: ['columns', c, 'id'] },
        ...column.tasks.flatMap((task, t) => [
          { id: task.id, path: ['columns', c, 'tasks', t, 'id'] },
          ...task.subtasks.map((subtask, s) => ({
            id: subtask.id,
            path: ['columns', c, 'tasks', t, 'subtasks', s, 'id'],
          })),
        ]),
      ]),
      ctx
    );
  });

export const BoardsSchema = z
  .array(BoardSchema)
  .readonly()
  .superRefine((boards, ctx) => {
    reportDuplicateIds(
      boards.map((board, b) => ({ id: board.id, path: [b, 'id'] })),
      ctx
    );
  });

export type Subtask = z.infer<typeof SubtaskSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Column = z.infer<typeof ColumnSchema>;
export type Board = z.infer<typeof BoardSchema>;
export type Boards = z.infer<typeof BoardsSchema>;

/* ─── Inputs ───────────────────────────────────────────────────────────────
 * What forms and actions submit. Separate from entities: new items have no
 * ID (the domain assigns one), and an item WITH an ID refers to an
 * existing one. The UI can never forge IDs for new entities.
 */

const boardFields = {
  name: requiredText(LIMITS.boardName),
};

const columnNamesUnique = (
  input: { columns: readonly { name: string }[] },
  ctx: z.RefinementCtx
) =>
  reportDuplicateNames(
    input.columns.map((column) => column.name),
    ctx,
    ['columns']
  );

export const CreateBoardInputSchema = z
  .object({
    ...boardFields,
    columns: z.array(z.object({ name: requiredText(LIMITS.columnName) })),
  })
  .superRefine(columnNamesUnique);

/** Columns with an `id` are kept (and may be renamed); without one they are new; missing ones are removed. */
export const UpdateBoardInputSchema = z
  .object({
    boardId: BoardIdSchema,
    ...boardFields,
    columns: z.array(
      z.object({
        id: ColumnIdSchema.optional(),
        name: requiredText(LIMITS.columnName),
      })
    ),
  })
  .superRefine(columnNamesUnique);

export const DeleteBoardInputSchema = z.object({ boardId: BoardIdSchema });

const taskFields = {
  boardId: BoardIdSchema,
  /** The task's status: the column it belongs in. */
  columnId: ColumnIdSchema,
  title: requiredText(LIMITS.taskTitle),
  description: optionalText(LIMITS.taskDescription),
};

export const CreateTaskInputSchema = z.object({
  ...taskFields,
  subtasks: z.array(z.object({ title: requiredText(LIMITS.subtaskTitle) })),
});

/** Subtasks with an `id` are kept (and may be renamed); without one they are new; missing ones are removed. */
export const UpdateTaskInputSchema = z.object({
  ...taskFields,
  taskId: TaskIdSchema,
  subtasks: z.array(
    z.object({
      id: SubtaskIdSchema.optional(),
      title: requiredText(LIMITS.subtaskTitle),
    })
  ),
});

export const DeleteTaskInputSchema = z.object({
  boardId: BoardIdSchema,
  taskId: TaskIdSchema,
});

/** `toIndex` is the position in the target column after the move. */
export const MoveTaskInputSchema = z.object({
  boardId: BoardIdSchema,
  taskId: TaskIdSchema,
  toColumnId: ColumnIdSchema,
  toIndex: z.int(code('invalid')).min(0, code('invalid')),
});

export const SetSubtaskCompletedInputSchema = z.object({
  boardId: BoardIdSchema,
  taskId: TaskIdSchema,
  subtaskId: SubtaskIdSchema,
  isCompleted: z.boolean(code('invalid')),
});

export type CreateBoardInput = z.infer<typeof CreateBoardInputSchema>;
export type UpdateBoardInput = z.infer<typeof UpdateBoardInputSchema>;
export type DeleteBoardInput = z.infer<typeof DeleteBoardInputSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
export type DeleteTaskInput = z.infer<typeof DeleteTaskInputSchema>;
export type MoveTaskInput = z.infer<typeof MoveTaskInputSchema>;
export type SetSubtaskCompletedInput = z.infer<
  typeof SetSubtaskCompletedInputSchema
>;
