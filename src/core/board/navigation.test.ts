import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { BoardIdSchema } from './ids.ts';
import { boardToOpenAfterDeleting } from './navigation.ts';
import { parseBoards } from './parse.ts';

const boards = parseBoards(
  ['a', 'b', 'c'].map((id) => ({ id, name: id.toUpperCase(), columns: [] })),
  'navigation.test fixture'
);
const id = (value: string) => BoardIdSchema.parse(value);

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
