import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { textDirection } from './text-direction.ts';

describe('textDirection', () => {
  test('follows the first letter', () => {
    assert.equal(textDirection('Todo'), 'ltr');
    assert.equal(textDirection('للتنفيذ'), 'rtl');
    assert.equal(textDirection('Web تصميم'), 'ltr');
    assert.equal(textDirection('تصميم Web'), 'rtl');
  });

  test('skips digits, spaces and punctuation', () => {
    assert.equal(textDirection('  2024 — Q1'), 'ltr');
    assert.equal(textDirection('(١) مرحلة'), 'rtl');
  });

  test('is undefined when there is no letter', () => {
    assert.equal(textDirection(''), undefined);
    assert.equal(textDirection(' 42 !'), undefined);
  });
});
