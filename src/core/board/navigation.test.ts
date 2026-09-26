import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { BoardIdSchema, TaskIdSchema } from './ids.ts';
import {
  boardToOpenAfterDeleting,
  neighbourAfterRemoving,
  taskToFocusAfterDeleting,
} from './navigation.ts';
import { parseBoards } from './parse.ts';

const boards = parseBoards(
  ['a', 'b', 'c'].map((id) => ({ id, name: id.toUpperCase(), columns: [] })),
  'navigation.test fixture'
);
const id = (value: string) => BoardIdSchema.parse(value);

describe('neighbourAfterRemoving', () => {
  test('next, else previous, else none', () => {
    assert.equal(neighbourAfterRemoving(['a', 'b', 'c'], 'a'), 'b');
    assert.equal(neighbourAfterRemoving(['a', 'b', 'c'], 'c'), 'b');
    assert.equal(neighbourAfterRemoving(['a'], 'a'), undefined);
  });
});

describe('boardToOpenAfterDeleting', () => {
  test('opens the next board', () => {
    assert.equal(boardToOpenAfterDeleting(boards, id('a')), 'b');
    assert.equal(boardToOpenAfterDeleting(boards, id('b')), 'c');
  });

  test('opens the previous board when the last one is deleted', () => {
    assert.equal(boardToOpenAfterDeleting(boards, id('c')), 'b');
  });

  test('opens nothing when the only board is deleted', () => {
    assert.equal(
      boardToOpenAfterDeleting(boards.slice(0, 1), id('a')),
      undefined
    );
  });

  test('an unknown ID falls back to the first board', () => {
    assert.equal(boardToOpenAfterDeleting(boards, id('zzz')), 'a');
  });
});

describe('taskToFocusAfterDeleting', () => {
  const [board] = parseBoards(
    [
      {
        id: 'b',
        name: 'B',
        columns: [
          {
            id: 'todo',
            name: 'Todo',
            tasks: ['t1', 't2', 't3'].map((id) => ({
              id,
              title: id,
              description: '',
              subtasks: [],
            })),
          },
        ],
      },
    ],
    'navigation.test tasks'
  );
  const column = board?.columns[0];

  test('focuses the next card, else the previous one', () => {
    assert.ok(column);
    assert.equal(
      taskToFocusAfterDeleting(column, TaskIdSchema.parse('t2')),
      't3'
    );
    assert.equal(
      taskToFocusAfterDeleting(column, TaskIdSchema.parse('t3')),
      't2'
    );
  });

  test('none when the task is the only one, or not in the column', () => {
    assert.ok(column);
    const only = { ...column, tasks: column.tasks.slice(0, 1) };
    assert.equal(
      taskToFocusAfterDeleting(only, TaskIdSchema.parse('t1')),
      undefined
    );
    assert.equal(
      taskToFocusAfterDeleting(column, TaskIdSchema.parse('zzz')),
      undefined
    );
  });
});
