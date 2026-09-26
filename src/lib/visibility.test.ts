import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { mostVisibleIndex } from './visibility.ts';

describe('mostVisibleIndex', () => {
  test('picks the item with the largest visible share', () => {
    assert.equal(mostVisibleIndex([0.2, 0.9, 0.1], 0), 1);
    assert.equal(mostVisibleIndex([0, 0, 1], 0), 2);
  });

  test('prefers the first item on a tie', () => {
    assert.equal(mostVisibleIndex([0.5, 0.5], 1), 0);
  });

  test('keeps the previous choice when nothing is visible', () => {
    assert.equal(mostVisibleIndex([0, 0, 0], 2), 2);
    assert.equal(mostVisibleIndex([], 1), 1);
  });
});
