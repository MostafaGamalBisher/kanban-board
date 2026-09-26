import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { toValidationKey } from '../validation.ts';
import {
  BoardFormSchema,
  CreateBoardInputSchema,
  CreateTaskInputSchema,
  MoveTaskInputSchema,
  UpdateBoardInputSchema,
} from './schema.ts';

/** `path: code` for every issue, or [] when the input is valid. */
function problems(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}): string[] {
  return result.success
    ? []
    : (result.error?.issues ?? []).map(
        (issue) => `${issue.path.join('.')}: ${toValidationKey(issue.message)}`
      );
}

describe('CreateBoardInputSchema (the Add Board form)', () => {
  test('accepts a valid board and trims text', () => {
    const result = CreateBoardInputSchema.safeParse({
      name: '  Web  ',
      columns: [{ name: ' Ideas ' }],
    });
    assert.ok(result.success);
    assert.deepEqual(result.data, {
      name: 'Web',
      columns: [{ name: 'Ideas' }],
    });
  });

  test('marks empty names and duplicate column names at the exact field', () => {
    const result = CreateBoardInputSchema.safeParse({
      name: ' ',
      columns: [{ name: 'Todo' }, { name: 'todo' }, { name: '' }],
    });
    assert.deepEqual(problems(result), [
      'name: required',
      'columns.2.name: required',
      'columns.1.name: duplicateName',
    ]);
  });

  test('reports a missing field as `required`, never English', () => {
    assert.deepEqual(
      problems(CreateBoardInputSchema.safeParse({ columns: [] })),
      ['name: required']
    );
  });
});

describe('UpdateBoardInputSchema (the Edit Board form)', () => {
  test('duplicate names are caught across kept and new columns', () => {
    const result = UpdateBoardInputSchema.safeParse({
      boardId: 'b1',
      name: 'Launch',
      columns: [{ id: 'c1', name: 'Done' }, { name: 'DONE' }],
    });
    assert.deepEqual(problems(result), ['columns.1.name: duplicateName']);
  });
});

describe('BoardFormSchema (the shared Add/Edit Board form)', () => {
  test('reports every empty field and duplicate at its own path', () => {
    const result = BoardFormSchema.safeParse({
      name: ' ',
      columns: [{ name: 'Todo' }, { name: '' }, { name: 'todo' }],
    });
    assert.deepEqual(problems(result), [
      'name: required',
      'columns.1.name: required',
      'columns.2.name: duplicateName',
    ]);
  });

  test('keeps the IDs of existing columns', () => {
    const result = BoardFormSchema.safeParse({
      name: 'Launch',
      columns: [{ id: 'c1', name: 'Todo' }, { name: 'Review' }],
    });
    assert.ok(result.success);
    assert.deepEqual(result.data.columns, [
      { id: 'c1', name: 'Todo' },
      { name: 'Review' },
    ]);
  });
});

describe('CreateTaskInputSchema (the Add Task form)', () => {
  test('rejects an over-long title and allows an empty description', () => {
    const result = CreateTaskInputSchema.safeParse({
      boardId: 'b1',
      columnId: 'c1',
      title: 'x'.repeat(101),
      description: '',
      subtasks: [],
    });
    assert.deepEqual(problems(result), ['title: tooLong']);
  });
});

describe('MoveTaskInputSchema (drag and drop)', () => {
  for (const toIndex of [-1, 1.5, Number.NaN]) {
    test(`rejects toIndex ${toIndex}`, () => {
      const result = MoveTaskInputSchema.safeParse({
        boardId: 'b1',
        taskId: 't1',
        toColumnId: 'c1',
        toIndex,
      });
      assert.deepEqual(problems(result), ['toIndex: invalid']);
    });
  }
});
