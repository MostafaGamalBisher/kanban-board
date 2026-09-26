import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { boardsReducer, seededIds, type BoardsAction } from './actions.ts';
import {
  BoardIdSchema,
  ColumnIdSchema,
  SubtaskIdSchema,
  TaskIdSchema,
} from './ids.ts';
import { parseBoards } from './parse.ts';
import type { Boards } from './schema.ts';

/*
 * The operations themselves are covered by operations.test.ts. These tests
 * cover what the reducer adds: ID derivation from the seed, purity, and
 * that every action type reaches its operation.
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
              subtasks: [{ id: 's1', title: 'First', isCompleted: false }],
            },
          ],
        },
        { id: 'done', name: 'Done', tasks: [] },
      ],
    },
  ],
  'actions.test fixture'
);

const b1 = BoardIdSchema.parse('b1');
const todo = ColumnIdSchema.parse('todo');
const done = ColumnIdSchema.parse('done');
const t1 = TaskIdSchema.parse('t1');
const s1 = SubtaskIdSchema.parse('s1');

describe('seededIds', () => {
  test('yields the seed, then numbered derivatives', () => {
    const next = seededIds('abc');
    assert.deepEqual([next(), next(), next()], ['abc', 'abc-1', 'abc-2']);
  });

  test('each factory starts over from the seed', () => {
    seededIds('abc')();
    assert.equal(seededIds('abc')(), 'abc');
  });
});

describe('boardsReducer', () => {
  test('createBoard: the new board’s ID is the seed', () => {
    const next = boardsReducer(fixture, {
      type: 'createBoard',
      input: { name: 'Web', columns: [{ name: 'Ideas' }] },
      idSeed: 'seed',
    });
    assert.deepEqual(next.at(-1), {
      id: 'seed',
      name: 'Web',
      columns: [{ id: 'seed-1', name: 'Ideas', tasks: [] }],
    });
  });

  test('addTask: the new task’s ID is the seed', () => {
    const next = boardsReducer(fixture, {
      type: 'addTask',
      input: {
        boardId: b1,
        columnId: done,
        title: 'New',
        description: '',
        subtasks: [{ title: 'A' }],
      },
      idSeed: 'seed',
    });
    assert.deepEqual(next[0]?.columns[1]?.tasks, [
      {
        id: 'seed',
        title: 'New',
        description: '',
        subtasks: [{ id: 'seed-1', title: 'A', isCompleted: false }],
      },
    ]);
  });

  test('is pure: the same action twice gives equal results', () => {
    // What React Strict Mode does to every dispatch in development.
    const action: BoardsAction = {
      type: 'updateBoard',
      input: {
        boardId: b1,
        name: 'Launch',
        columns: [{ id: todo, name: 'Todo' }, { name: 'Review' }],
      },
      idSeed: 'seed',
    };
    assert.deepEqual(
      boardsReducer(fixture, action),
      boardsReducer(fixture, action)
    );
  });

  test('every action type reaches its operation', () => {
    const actions: BoardsAction[] = [
      {
        type: 'createBoard',
        input: { name: 'Web', columns: [] },
        idSeed: 'x',
      },
      {
        type: 'updateBoard',
        input: { boardId: b1, name: 'Renamed', columns: [] },
        idSeed: 'x',
      },
      { type: 'deleteBoard', input: { boardId: b1 } },
      {
        type: 'addTask',
        input: {
          boardId: b1,
          columnId: todo,
          title: 'New',
          description: '',
          subtasks: [],
        },
        idSeed: 'x',
      },
      {
        type: 'updateTask',
        input: {
          boardId: b1,
          taskId: t1,
          columnId: todo,
          title: 'Renamed',
          description: '',
          subtasks: [],
        },
        idSeed: 'x',
      },
      { type: 'deleteTask', input: { boardId: b1, taskId: t1 } },
      {
        type: 'moveTask',
        input: { boardId: b1, taskId: t1, toColumnId: done, toIndex: 0 },
      },
      {
        type: 'setSubtaskCompleted',
        input: { boardId: b1, taskId: t1, subtaskId: s1, isCompleted: true },
      },
    ];
    for (const action of actions) {
      assert.notDeepEqual(
        boardsReducer(fixture, action),
        fixture,
        `${action.type} changed nothing`
      );
    }
  });
});
