import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { parseBoards } from './parse.ts';
import { findTask, subtaskProgress } from './selectors.ts';

const [board] = parseBoards(
  [
    {
      id: 'b',
      name: 'Board',
      columns: [
        { id: 'todo', name: 'Todo', tasks: [] },
        {
          id: 'doing',
          name: 'Doing',
          tasks: [
            {
              id: 't1',
              title: 'Task',
              description: '',
              subtasks: [
                { id: 's1', title: 'One', isCompleted: true },
                { id: 's2', title: 'Two', isCompleted: false },
                { id: 's3', title: 'Three', isCompleted: true },
              ],
            },
          ],
        },
      ],
    },
  ],
  'selectors.test fixture'
);

describe('findTask', () => {
  test('returns the task with the column that holds it', () => {
    assert.ok(board);
    const found = findTask(board, 't1');
    assert.equal(found?.task.title, 'Task');
    assert.equal(found?.column.id, 'doing');
  });

  test('is undefined for an unknown task', () => {
    assert.ok(board);
    assert.equal(findTask(board, 'nope'), undefined);
  });
});

describe('subtaskProgress', () => {
  test('counts completed and total subtasks', () => {
    assert.ok(board);
    const found = findTask(board, 't1');
    assert.ok(found);
    assert.deepEqual(subtaskProgress(found.task), { done: 2, total: 3 });
  });
});
