import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';

import { NotFoundError, type EntityKind } from '../errors.ts';
import {
  BoardIdSchema,
  ColumnIdSchema,
  SubtaskIdSchema,
  TaskIdSchema,
} from './ids.ts';
import {
  addTask,
  createBoard,
  deleteBoard,
  deleteTask,
  moveTask,
  setSubtaskCompleted,
  updateBoard,
  updateTask,
  type IdFactory,
} from './operations.ts';
import { parseBoards } from './parse.ts';
import type { Board, Boards } from './schema.ts';

/* ─── Fixture ──────────────────────────────────────────────────────────────
 * A small inline fixture, independent of the seed file. It is parsed, so it
 * is deeply frozen: an operation that tried to mutate it would throw.
 */

const fixture: Boards = parseBoards(
  [
    {
      id: 'b1',
      name: 'Launch',
      columns: [
        {
          id: 'todo',
          name: 'Todo',
          tasks: [
            {
              id: 't1',
              title: 'One',
              description: '',
              subtasks: [
                { id: 's1', title: 'First', isCompleted: true },
                { id: 's2', title: 'Second', isCompleted: false },
              ],
            },
            { id: 't2', title: 'Two', description: '', subtasks: [] },
            { id: 't3', title: 'Three', description: '', subtasks: [] },
          ],
        },
        {
          id: 'doing',
          name: 'Doing',
          tasks: [{ id: 't4', title: 'Four', description: '', subtasks: [] }],
        },
        { id: 'done', name: 'Done', tasks: [] },
      ],
    },
    { id: 'b2', name: 'Other', columns: [] },
  ],
  'operations.test fixture'
);

const snapshot = structuredClone(fixture);

const b1 = BoardIdSchema.parse('b1');
const todo = ColumnIdSchema.parse('todo');
const doing = ColumnIdSchema.parse('doing');
const done = ColumnIdSchema.parse('done');
const t1 = TaskIdSchema.parse('t1');
const t3 = TaskIdSchema.parse('t3');
const t4 = TaskIdSchema.parse('t4');
const s1 = SubtaskIdSchema.parse('s1');
const s2 = SubtaskIdSchema.parse('s2');

/* ─── Helpers ──────────────────────────────────────────────────────────── */

/** Deterministic IdFactory: new-1, new-2, … */
function counter(): IdFactory {
  let n = 0;
  return () => `new-${++n}`;
}

function board(boards: Boards, id = 'b1'): Board {
  const found = boards.find((b) => b.id === id);
  assert.ok(found, `board ${id} exists`);
  return found;
}

/** Column name → task IDs, in display order. */
function layout(boards: Boards, id = 'b1'): Record<string, string[]> {
  return Object.fromEntries(
    board(boards, id).columns.map((c) => [c.name, c.tasks.map((t) => t.id)])
  );
}

function assertNotFound(fn: () => unknown, entity: EntityKind, id: string) {
  assert.throws(fn, (error: unknown) => {
    assert.ok(error instanceof NotFoundError);
    assert.equal(error.entity, entity);
    assert.equal(error.id, id);
    return true;
  });
}

// Every test re-checks that the shared fixture was never modified.
beforeEach(() => assert.deepEqual(fixture, snapshot));

/* ─── moveTask ─────────────────────────────────────────────────────────── */

describe('moveTask', () => {
  test('moves down within a column', () => {
    const result = moveTask(fixture, {
      boardId: b1,
      taskId: t1,
      toColumnId: todo,
      toIndex: 2,
    });
    assert.deepEqual(layout(result).Todo, ['t2', 't3', 't1']);
  });

  test('moves up within a column', () => {
    const result = moveTask(fixture, {
      boardId: b1,
      taskId: t3,
      toColumnId: todo,
      toIndex: 0,
    });
    assert.deepEqual(layout(result).Todo, ['t3', 't1', 't2']);
  });

  test('moving to its own position leaves the order unchanged', () => {
    const result = moveTask(fixture, {
      boardId: b1,
      taskId: t1,
      toColumnId: todo,
      toIndex: 0,
    });
    assert.deepEqual(layout(result), layout(fixture));
  });

  test('moves across columns to a given position', () => {
    const result = moveTask(fixture, {
      boardId: b1,
      taskId: t1,
      toColumnId: doing,
      toIndex: 0,
    });
    assert.deepEqual(layout(result), {
      Todo: ['t2', 't3'],
      Doing: ['t1', 't4'],
      Done: [],
    });
  });

  test('moves into an empty column', () => {
    const result = moveTask(fixture, {
      boardId: b1,
      taskId: t4,
      toColumnId: done,
      toIndex: 0,
    });
    assert.deepEqual(layout(result).Doing, []);
    assert.deepEqual(layout(result).Done, ['t4']);
  });

  test('an index past the end is clamped to the end', () => {
    const result = moveTask(fixture, {
      boardId: b1,
      taskId: t1,
      toColumnId: doing,
      toIndex: 99,
    });
    assert.deepEqual(layout(result).Doing, ['t4', 't1']);
  });

  test('keeps the task itself (subtasks and all) unchanged', () => {
    const result = moveTask(fixture, {
      boardId: b1,
      taskId: t1,
      toColumnId: done,
      toIndex: 0,
    });
    const before = board(fixture).columns[0]?.tasks[0];
    const after = board(result).columns[2]?.tasks[0];
    assert.equal(after, before);
  });

  test('throws NotFoundError for an unknown board, task or column', () => {
    const base = { boardId: b1, taskId: t1, toColumnId: todo, toIndex: 0 };
    assertNotFound(
      () => moveTask(fixture, { ...base, boardId: BoardIdSchema.parse('x') }),
      'board',
      'x'
    );
    assertNotFound(
      () => moveTask(fixture, { ...base, taskId: TaskIdSchema.parse('x') }),
      'task',
      'x'
    );
    assertNotFound(
      () =>
        moveTask(fixture, { ...base, toColumnId: ColumnIdSchema.parse('x') }),
      'column',
      'x'
    );
  });
});

/* ─── Boards ───────────────────────────────────────────────────────────── */

describe('createBoard', () => {
  test('appends a board with new IDs and empty columns', () => {
    const { boards, id } = createBoard(
      fixture,
      { name: 'Web', columns: [{ name: 'Ideas' }, { name: 'Live' }] },
      counter()
    );
    assert.equal(id, 'new-1');
    assert.equal(boards.length, 3);
    assert.deepEqual(board(boards, id), {
      id: 'new-1',
      name: 'Web',
      columns: [
        { id: 'new-2', name: 'Ideas', tasks: [] },
        { id: 'new-3', name: 'Live', tasks: [] },
      ],
    });
  });

  test('a board with no columns is allowed', () => {
    const { boards, id } = createBoard(
      fixture,
      { name: 'Empty', columns: [] },
      counter()
    );
    assert.deepEqual(board(boards, id).columns, []);
  });
});

describe('updateBoard', () => {
  test('renames the board and a column, keeping tasks', () => {
    const result = updateBoard(
      fixture,
      {
        boardId: b1,
        name: 'Renamed',
        columns: [
          { id: todo, name: 'Backlog' },
          { id: doing, name: 'Doing' },
          { id: done, name: 'Done' },
        ],
      },
      counter()
    );
    assert.equal(board(result).name, 'Renamed');
    assert.deepEqual(layout(result), {
      Backlog: ['t1', 't2', 't3'],
      Doing: ['t4'],
      Done: [],
    });
  });

  test('input order becomes column order; new columns start empty', () => {
    const result = updateBoard(
      fixture,
      {
        boardId: b1,
        name: 'Launch',
        columns: [
          { id: done, name: 'Done' },
          { name: 'Review' },
          { id: todo, name: 'Todo' },
          { id: doing, name: 'Doing' },
        ],
      },
      counter()
    );
    assert.deepEqual(
      board(result).columns.map((c) => c.id),
      ['done', 'new-1', 'todo', 'doing']
    );
    assert.deepEqual(layout(result).Review, []);
  });

  test('removing a column removes its tasks', () => {
    const result = updateBoard(
      fixture,
      { boardId: b1, name: 'Launch', columns: [{ id: doing, name: 'Doing' }] },
      counter()
    );
    assert.deepEqual(layout(result), { Doing: ['t4'] });
  });

  test('an unrenamed column keeps its identity', () => {
    const result = updateBoard(
      fixture,
      {
        boardId: b1,
        name: 'Launch',
        columns: [
          { id: todo, name: 'Todo' },
          { id: doing, name: 'Now' },
        ],
      },
      counter()
    );
    assert.equal(board(result).columns[0], board(fixture).columns[0]);
  });

  test('throws NotFoundError for an unknown column ID', () => {
    assertNotFound(
      () =>
        updateBoard(
          fixture,
          {
            boardId: b1,
            name: 'Launch',
            columns: [{ id: ColumnIdSchema.parse('ghost'), name: 'Ghost' }],
          },
          counter()
        ),
      'column',
      'ghost'
    );
  });
});

describe('deleteBoard', () => {
  test('removes only that board', () => {
    const result = deleteBoard(fixture, { boardId: b1 });
    assert.deepEqual(
      result.map((b) => b.id),
      ['b2']
    );
  });

  test('throws NotFoundError for an unknown board', () => {
    assertNotFound(
      () => deleteBoard(fixture, { boardId: BoardIdSchema.parse('x') }),
      'board',
      'x'
    );
  });
});

/* ─── Tasks ────────────────────────────────────────────────────────────── */

describe('addTask', () => {
  test('appends to the chosen column with open subtasks', () => {
    const { boards, id } = addTask(
      fixture,
      {
        boardId: b1,
        columnId: doing,
        title: 'New',
        description: 'Details',
        subtasks: [{ title: 'A' }, { title: 'B' }],
      },
      counter()
    );
    assert.equal(id, 'new-1');
    assert.deepEqual(layout(boards).Doing, ['t4', 'new-1']);
    assert.deepEqual(board(boards).columns[1]?.tasks[1], {
      id: 'new-1',
      title: 'New',
      description: 'Details',
      subtasks: [
        { id: 'new-2', title: 'A', isCompleted: false },
        { id: 'new-3', title: 'B', isCompleted: false },
      ],
    });
  });

  test('throws NotFoundError for an unknown column', () => {
    assertNotFound(
      () =>
        addTask(
          fixture,
          {
            boardId: b1,
            columnId: ColumnIdSchema.parse('x'),
            title: 'New',
            description: '',
            subtasks: [],
          },
          counter()
        ),
      'column',
      'x'
    );
  });
});

describe('updateTask', () => {
  const base = {
    boardId: b1,
    taskId: t1,
    columnId: todo,
    title: 'One',
    description: '',
    subtasks: [
      { id: s1, title: 'First' },
      { id: s2, title: 'Second' },
    ],
  };

  test('same column: updates in place, keeping its position', () => {
    const result = updateTask(
      fixture,
      { ...base, title: 'Uno', description: 'Edited' },
      counter()
    );
    assert.deepEqual(layout(result).Todo, ['t1', 't2', 't3']);
    const task = board(result).columns[0]?.tasks[0];
    assert.equal(task?.title, 'Uno');
    assert.equal(task?.description, 'Edited');
  });

  test('a different column is a status change: moves to its end', () => {
    const result = updateTask(fixture, { ...base, columnId: doing }, counter());
    assert.deepEqual(layout(result), {
      Todo: ['t2', 't3'],
      Doing: ['t4', 't1'],
      Done: [],
    });
  });

  test('subtasks: kept ones keep completion, new ones are open, missing ones go', () => {
    const result = updateTask(
      fixture,
      {
        ...base,
        subtasks: [{ id: s1, title: 'First, renamed' }, { title: 'Third' }],
      },
      counter()
    );
    assert.deepEqual(board(result).columns[0]?.tasks[0]?.subtasks, [
      { id: 's1', title: 'First, renamed', isCompleted: true },
      { id: 'new-1', title: 'Third', isCompleted: false },
    ]);
  });

  test('throws NotFoundError for an unknown task, subtask or column', () => {
    assertNotFound(
      () =>
        updateTask(
          fixture,
          { ...base, taskId: TaskIdSchema.parse('x') },
          counter()
        ),
      'task',
      'x'
    );
    assertNotFound(
      () =>
        updateTask(
          fixture,
          {
            ...base,
            subtasks: [{ id: SubtaskIdSchema.parse('x'), title: 'X' }],
          },
          counter()
        ),
      'subtask',
      'x'
    );
    assertNotFound(
      () =>
        updateTask(
          fixture,
          { ...base, columnId: ColumnIdSchema.parse('x') },
          counter()
        ),
      'column',
      'x'
    );
  });
});

describe('deleteTask', () => {
  test('removes the task from its column', () => {
    const result = deleteTask(fixture, { boardId: b1, taskId: t3 });
    assert.deepEqual(layout(result).Todo, ['t1', 't2']);
  });

  test('throws NotFoundError for an unknown task', () => {
    assertNotFound(
      () =>
        deleteTask(fixture, { boardId: b1, taskId: TaskIdSchema.parse('x') }),
      'task',
      'x'
    );
  });
});

describe('setSubtaskCompleted', () => {
  test('ticks and unticks a subtask', () => {
    const ticked = setSubtaskCompleted(fixture, {
      boardId: b1,
      taskId: t1,
      subtaskId: s2,
      isCompleted: true,
    });
    assert.equal(
      board(ticked).columns[0]?.tasks[0]?.subtasks[1]?.isCompleted,
      true
    );

    const unticked = setSubtaskCompleted(fixture, {
      boardId: b1,
      taskId: t1,
      subtaskId: s1,
      isCompleted: false,
    });
    assert.equal(
      board(unticked).columns[0]?.tasks[0]?.subtasks[0]?.isCompleted,
      false
    );
  });

  test('setting the current state returns the same array (no-op)', () => {
    const result = setSubtaskCompleted(fixture, {
      boardId: b1,
      taskId: t1,
      subtaskId: s1,
      isCompleted: true,
    });
    assert.equal(result, fixture);
  });

  test('throws NotFoundError for an unknown subtask', () => {
    assertNotFound(
      () =>
        setSubtaskCompleted(fixture, {
          boardId: b1,
          taskId: t1,
          subtaskId: SubtaskIdSchema.parse('x'),
          isCompleted: true,
        }),
      'subtask',
      'x'
    );
  });
});

/* ─── Structural sharing ───────────────────────────────────────────────────
 * Unchanged parts must be the same objects, so React can skip them.
 */

describe('structural sharing', () => {
  test('a change in one board leaves other boards identical', () => {
    const result = deleteTask(fixture, { boardId: b1, taskId: t3 });
    assert.equal(board(result, 'b2'), board(fixture, 'b2'));
  });

  test('a change in one column leaves other columns identical', () => {
    const result = deleteTask(fixture, { boardId: b1, taskId: t3 });
    assert.equal(board(result).columns[1], board(fixture).columns[1]);
    assert.equal(board(result).columns[2], board(fixture).columns[2]);
  });

  test('untouched tasks in a changed column stay identical', () => {
    const result = deleteTask(fixture, { boardId: b1, taskId: t3 });
    assert.equal(
      board(result).columns[0]?.tasks[0],
      board(fixture).columns[0]?.tasks[0]
    );
  });
});
