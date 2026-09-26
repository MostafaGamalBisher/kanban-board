import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { dropPosition, previewMove } from './drag.ts';
import { TaskIdSchema } from './ids.ts';
import { parseBoards } from './parse.ts';

const task = (id: string) => ({ id, title: id, description: '', subtasks: [] });
const [board] = parseBoards(
  [
    {
      id: 'b',
      name: 'B',
      columns: [
        { id: 'todo', name: 'Todo', tasks: ['a', 'b', 'c'].map(task) },
        { id: 'doing', name: 'Doing', tasks: ['d', 'e'].map(task) },
        { id: 'done', name: 'Done', tasks: [] },
      ],
    },
  ],
  'drag.test fixture'
);
const id = (value: string) => TaskIdSchema.parse(value);
const layout = (b: NonNullable<typeof board>) =>
  b.columns.map((c) => c.tasks.map((t) => t.id).join(''));

describe('dropPosition', () => {
  test('over a card in its own column: takes that card’s place', () => {
    assert.ok(board);
    assert.deepEqual(
      dropPosition(board, 'a', { kind: 'task', taskId: 'c', after: false }),
      { toColumnId: 'todo', toIndex: 2 }
    );
    assert.deepEqual(
      dropPosition(board, 'c', { kind: 'task', taskId: 'a', after: true }),
      { toColumnId: 'todo', toIndex: 0 }
    );
  });

  test('over a card in another column: before or after it', () => {
    assert.ok(board);
    assert.deepEqual(
      dropPosition(board, 'a', { kind: 'task', taskId: 'e', after: false }),
      { toColumnId: 'doing', toIndex: 1 }
    );
    assert.deepEqual(
      dropPosition(board, 'a', { kind: 'task', taskId: 'e', after: true }),
      { toColumnId: 'doing', toIndex: 2 }
    );
  });

  test('over a column’s area: the end of that column', () => {
    assert.ok(board);
    assert.deepEqual(
      dropPosition(board, 'a', { kind: 'column', columnId: 'done' }),
      {
        toColumnId: 'done',
        toIndex: 0,
      }
    );
    assert.deepEqual(
      dropPosition(board, 'a', { kind: 'column', columnId: 'todo' }),
      {
        toColumnId: 'todo',
        toIndex: 2,
      }
    );
  });

  test('undefined for an unknown task or target', () => {
    assert.ok(board);
    assert.equal(
      dropPosition(board, 'zzz', { kind: 'column', columnId: 'done' }),
      undefined
    );
    assert.equal(
      dropPosition(board, 'a', { kind: 'task', taskId: 'zzz', after: false }),
      undefined
    );
    assert.equal(
      dropPosition(board, 'a', { kind: 'column', columnId: 'zzz' }),
      undefined
    );
  });
});

describe('previewMove', () => {
  test('shows the board after the move, leaving the input untouched', () => {
    assert.ok(board);
    const moved = previewMove(board, id('a'), {
      toColumnId: board.columns[2]!.id,
      toIndex: 0,
    });
    assert.deepEqual(layout(moved), ['bc', 'de', 'a']);
    assert.deepEqual(layout(board), ['abc', 'de', '']);
  });

  test('a move to the same place returns the same board', () => {
    assert.ok(board);
    assert.equal(
      previewMove(board, id('b'), {
        toColumnId: board.columns[0]!.id,
        toIndex: 1,
      }),
      board
    );
  });
});
