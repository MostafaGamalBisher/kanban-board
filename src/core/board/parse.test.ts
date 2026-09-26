import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { InvalidDataError } from '../errors.ts';
import { parseBoards } from './parse.ts';

const valid = [
  {
    id: 'b1',
    name: '  Launch  ',
    columns: [
      {
        id: 'c1',
        name: 'Todo',
        tasks: [
          {
            id: 't1',
            title: 'One',
            description: '',
            subtasks: [{ id: 's1', title: 'A', isCompleted: false }],
          },
        ],
      },
    ],
  },
];

describe('parseBoards', () => {
  test('returns trimmed, deeply frozen boards', () => {
    const [board] = parseBoards(valid, 'test');
    assert.equal(board?.name, 'Launch');
    assert.ok(Object.isFrozen(board));
    assert.ok(Object.isFrozen(board?.columns));
    assert.ok(Object.isFrozen(board?.columns[0]?.tasks[0]?.subtasks[0]));
  });

  test('reports every problem with its path and code', () => {
    const broken = structuredClone(valid) as typeof valid;
    const board = broken[0]!;
    board.name = '   ';
    board.columns.push({ id: 'c2', name: 'TODO', tasks: [] });
    board.columns[0]!.tasks.push({
      ...board.columns[0]!.tasks[0]!,
      subtasks: [],
    });

    assert.throws(
      () => parseBoards(broken, 'src/data/boards.json'),
      (error: unknown) => {
        assert.ok(error instanceof InvalidDataError);
        assert.equal(error.source, 'src/data/boards.json');
        assert.equal(
          error.message,
          [
            'Invalid data in src/data/boards.json:',
            '  [0].name: required',
            '  [0].columns[1].name: duplicateName',
            '  [0].columns[0].tasks[1].id: duplicateId',
          ].join('\n')
        );
        return true;
      }
    );
  });

  test('rejects duplicate board IDs', () => {
    assert.throws(
      () => parseBoards([...valid, ...valid], 'test'),
      /\[1\]\.id: duplicateId/
    );
  });

  test('rejects data that is not a list', () => {
    assert.throws(() => parseBoards({ boards: [] }, 'test'), InvalidDataError);
  });
});
