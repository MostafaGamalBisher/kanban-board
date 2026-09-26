import { z } from 'zod';

/**
 * Branded IDs. Every ID is a non-empty string at runtime, but each entity's
 * ID is a distinct type, so passing a TaskId where a ColumnId is expected
 * is a compile error. Seed data may use readable IDs; runtime-created
 * entities get UUIDs.
 */
const id = () =>
  z.string({ error: 'invalid' }).trim().min(1, { error: 'invalid' });

export const BoardIdSchema = id().brand<'BoardId'>();
export const ColumnIdSchema = id().brand<'ColumnId'>();
export const TaskIdSchema = id().brand<'TaskId'>();
export const SubtaskIdSchema = id().brand<'SubtaskId'>();

export type BoardId = z.infer<typeof BoardIdSchema>;
export type ColumnId = z.infer<typeof ColumnIdSchema>;
export type TaskId = z.infer<typeof TaskIdSchema>;
export type SubtaskId = z.infer<typeof SubtaskIdSchema>;
